import mongoose from 'mongoose';
import { Attendance } from './model.js';
import { AttendanceStats } from './model-stats.js';
import type { IAttendanceStats, IMonthlyBreakdown } from './model-stats.js';
import { Student } from '../Student/model.js';

const CHRONIC_THRESHOLD = 80; // below 80% = chronic absentee

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function academicYearStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1); // January 1st of current year
}

interface AttendanceAggRow {
  _id: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

interface MonthlyAggRow {
  _id: string;   // "YYYY-MM"
  totalDays: number;
  present: number;
  absent: number;
  late: number;
}

export class AttendanceStatsService {
  /**
   * Recalculate and upsert stats for a list of students.
   * Called fire-and-forget from bulkRecord after saving attendance.
   */
  static async updateStatsForStudents(
    studentIds: string[],
    schoolId: string,
  ): Promise<void> {
    if (studentIds.length === 0) return;

    const termStart = academicYearStart();
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const studentOids = studentIds.map((id) => new mongoose.Types.ObjectId(id));

    // Fetch student records to get classId and gradeId
    const students = await Student.find({
      _id: { $in: studentOids },
      schoolId,
      isDeleted: false,
    })
      .select('_id classId gradeId')
      .lean();

    if (students.length === 0) return;

    // Aggregate totals per student using period 1 as the daily marker
    const totalsAgg: AttendanceAggRow[] = await Attendance.aggregate([
      {
        $match: {
          studentId: { $in: studentOids },
          schoolId: schoolOid,
          isDeleted: false,
          period: 1,
          date: { $gte: termStart },
        },
      },
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
        },
      },
    ]);

    // Aggregate monthly breakdown per student
    const monthlyAgg: Array<{ _id: { studentId: string; month: string } } & MonthlyAggRow> =
      await Attendance.aggregate([
        {
          $match: {
            studentId: { $in: studentOids },
            schoolId: schoolOid,
            isDeleted: false,
            period: 1,
            date: { $gte: termStart },
          },
        },
        {
          $group: {
            _id: {
              studentId: '$studentId',
              month: {
                $dateToString: { format: '%Y-%m', date: '$date' },
              },
            },
            totalDays: { $sum: 1 },
            present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
            late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          },
        },
      ]);

    // Build totals map
    const totalsMap = new Map<string, AttendanceAggRow>();
    for (const row of totalsAgg) {
      totalsMap.set(String(row._id), row);
    }

    // Build monthly map: studentId → month → breakdown
    const monthlyMap = new Map<string, Map<string, IMonthlyBreakdown>>();
    for (const row of monthlyAgg) {
      const sid = String(row._id.studentId);
      const month = row._id.month;
      if (!monthlyMap.has(sid)) monthlyMap.set(sid, new Map());
      const pct =
        row.totalDays > 0
          ? Math.round(((row.present + row.late) / row.totalDays) * 10000) / 100
          : 0;
      monthlyMap.get(sid)!.set(month, {
        month,
        totalDays: row.totalDays,
        present: row.present,
        absent: row.absent,
        late: row.late,
        percentage: pct,
      });
    }

    // Fetch recent daily records for streak calculation (all students, sorted asc)
    const dailyRecords = await Attendance.find({
      studentId: { $in: studentOids },
      schoolId: schoolOid,
      isDeleted: false,
      period: 1,
      date: { $gte: termStart },
    })
      .sort({ studentId: 1, date: 1 })
      .select('studentId date status')
      .lean();

    // Group daily records by studentId
    const dailyByStudent = new Map<string, Array<{ date: Date; status: string }>>();
    for (const rec of dailyRecords) {
      const sid = String(rec.studentId);
      if (!dailyByStudent.has(sid)) dailyByStudent.set(sid, []);
      dailyByStudent.get(sid)!.push({ date: rec.date, status: rec.status });
    }

    // Build upsert operations
    const ops = students.map((student) => {
      const sid = String(student._id);
      const totals = totalsMap.get(sid) ?? {
        totalDays: 0, present: 0, absent: 0, late: 0, excused: 0,
      };

      const percentage =
        totals.totalDays > 0
          ? Math.round(((totals.present + totals.late) / totals.totalDays) * 10000) / 100
          : 0;

      const monthlyEntries = Array.from(monthlyMap.get(sid)?.values() ?? []).sort(
        (a, b) => a.month.localeCompare(b.month),
      );

      // Streak calculation
      const studentDailyRecs = dailyByStudent.get(sid) ?? [];
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (const rec of studentDailyRecs) {
        const isPresent = rec.status === 'present' || rec.status === 'late';
        if (isPresent) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Current streak from most recent backwards
      for (let i = studentDailyRecs.length - 1; i >= 0; i--) {
        const rec = studentDailyRecs[i];
        const isPresent = rec.status === 'present' || rec.status === 'late';
        if (isPresent) {
          currentStreak++;
        } else {
          break;
        }
      }

      const lastRecord = studentDailyRecs.at(-1);
      const lastAttendanceDate = lastRecord
        ? toLocalDateString(new Date(lastRecord.date))
        : '';
      const lastStatus = lastRecord?.status ?? '';

      return {
        updateOne: {
          filter: { studentId: student._id },
          update: {
            $set: {
              studentId: student._id,
              schoolId: schoolOid,
              classId: student.classId,
              gradeId: student.gradeId,
              totalDays: totals.totalDays,
              present: totals.present,
              absent: totals.absent,
              late: totals.late,
              excused: totals.excused,
              percentage,
              monthly: monthlyEntries,
              currentStreak,
              longestStreak,
              lastAttendanceDate,
              lastStatus,
              isChronicAbsentee: totals.totalDays > 0 && percentage < CHRONIC_THRESHOLD,
            },
          },
          upsert: true,
        },
      };
    });

    if (ops.length > 0) {
      await AttendanceStats.bulkWrite(ops);
    }
  }

  /**
   * Get precomputed stats for a single student.
   */
  static async getStudentStats(
    studentId: string,
    schoolId: string,
  ): Promise<IAttendanceStats | null> {
    return AttendanceStats.findOne({ studentId, schoolId }).lean();
  }

  /**
   * Get precomputed stats for all students in a class.
   */
  static async getClassStats(
    classId: string,
    schoolId: string,
  ): Promise<IAttendanceStats[]> {
    return AttendanceStats.find({ classId, schoolId })
      .sort({ percentage: 1 })
      .lean();
  }

  /**
   * Get all chronic absentees for a school (percentage < 80%).
   */
  static async getChronicAbsentees(schoolId: string): Promise<IAttendanceStats[]> {
    return AttendanceStats.find({ schoolId, isChronicAbsentee: true })
      .populate('studentId', 'admissionNumber userId gradeId classId')
      .sort({ percentage: 1 })
      .lean();
  }
}
