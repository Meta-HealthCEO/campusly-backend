import mongoose from 'mongoose';
import { Attendance } from './model.js';
import { Student } from '../Student/model.js';
import type { PopulatedUser } from '../../types/populated.js';
import { getPopulated } from '../../types/populated.js';

interface PopulatedGrade {
  _id: string;
  name: string;
}

interface PopulatedClass {
  _id: string;
  name: string;
}

export interface ChronicAbsentee {
  studentId: string;
  studentName: string;
  gradeName: string;
  className: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  percentage: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface AttendancePattern {
  mostMissedDay: string | null;
  mostMissedPeriod: number | null;
  longestAbsenceStreak: number;
  currentStreak: number;
  monthlyBreakdown: Array<{
    month: string;
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
  }>;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export class ChronicAbsenceService {
  /**
   * Find students below attendance threshold for the current term.
   * Defaults to 80% threshold.
   */
  static async getChronicAbsentees(
    schoolId: string,
    threshold = 80,
    classId?: string,
  ): Promise<ChronicAbsentee[]> {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    // Get active students with their enrollment dates
    const students = await Student.find({
      schoolId,
      ...(classId ? { classId } : {}),
      isDeleted: false,
      enrollmentStatus: 'active',
    })
      .populate('userId', 'firstName lastName')
      .populate('gradeId', 'name')
      .populate('classId', 'name')
      .lean();

    if (students.length === 0) return [];
    const studentObjectIds = students.map((student) => student._id);

    // Get term start — use start of current year as a reasonable approximation
    const now = new Date();
    const termStart = new Date(now.getFullYear(), 0, 1);

    // Calculate trend window cutoffs
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    // Single aggregation computes both term stats and trend data via $facet
    const [facetResult] = await Attendance.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          studentId: { $in: studentObjectIds },
          isDeleted: false,
          date: { $gte: termStart },
          period: 1,
        },
      },
      {
        $facet: {
          termStats: [
            {
              $group: {
                _id: '$studentId',
                totalDays: { $sum: 1 },
                presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                absentDays: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
                lateDays: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
                excusedDays: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
              },
            },
          ],
          trendStats: [
            { $match: { date: { $gte: fourWeeksAgo } } },
            {
              $group: {
                _id: {
                  studentId: '$studentId',
                  recentWindow: { $cond: [{ $gte: ['$date', twoWeeksAgo] }, 'recent', 'previous'] },
                },
                total: { $sum: 1 },
                present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
              },
            },
          ],
        },
      },
    ]);

    const stats = (facetResult?.termStats ?? []) as Array<{
      _id: mongoose.Types.ObjectId;
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      excusedDays: number;
    }>;
    const recentStats = (facetResult?.trendStats ?? []) as Array<{
      _id: { studentId: mongoose.Types.ObjectId; recentWindow: 'recent' | 'previous' };
      total: number;
      present: number;
    }>;

    const statsMap = new Map<string, typeof stats[0]>();
    for (const s of stats) {
      statsMap.set(String(s._id), s);
    }

    const trendMap = new Map<string, { recentPct: number; previousPct: number }>();
    for (const r of recentStats) {
      const sid = String(r._id.studentId);
      const existing = trendMap.get(sid) ?? { recentPct: 0, previousPct: 0 };
      const pct = r.total > 0 ? (r.present / r.total) * 100 : 0;
      if (r._id.recentWindow === 'recent') {
        existing.recentPct = pct;
      } else {
        existing.previousPct = pct;
      }
      trendMap.set(sid, existing);
    }

    const results: ChronicAbsentee[] = [];

    for (const student of students) {
      const sid = String(student._id);
      const stat = statsMap.get(sid);
      if (!stat || stat.totalDays === 0) continue;

      // Don't count days before enrollment
      const enrolledAfterTermStart = student.enrollmentDate > termStart;
      if (enrolledAfterTermStart && stat.totalDays === 0) continue;

      const percentage = Math.round(
        ((stat.presentDays + stat.lateDays) / stat.totalDays) * 10000,
      ) / 100;

      if (percentage >= threshold) continue;

      const user = getPopulated<PopulatedUser | undefined>(student.userId);
      const grade = getPopulated<PopulatedGrade | undefined>(student.gradeId);
      const cls = getPopulated<PopulatedClass | undefined>(student.classId);

      // Determine trend
      const trendData = trendMap.get(sid);
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (trendData) {
        const diff = trendData.recentPct - trendData.previousPct;
        if (diff > 5) trend = 'improving';
        else if (diff < -5) trend = 'declining';
      }

      results.push({
        studentId: sid,
        studentName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        gradeName: grade?.name ?? '',
        className: cls?.name ?? '',
        totalDays: stat.totalDays,
        presentDays: stat.presentDays,
        absentDays: stat.absentDays,
        lateDays: stat.lateDays,
        excusedDays: stat.excusedDays,
        percentage,
        trend,
      });
    }

    // Sort by percentage ascending (worst first)
    results.sort((a, b) => a.percentage - b.percentage);

    return results;
  }

  /**
   * Analyse attendance patterns for a specific student.
   */
  static async getStudentPatterns(
    studentId: string,
    schoolId: string,
  ): Promise<AttendancePattern> {
    const now = new Date();
    const termStart = new Date(now.getFullYear(), 0, 1);

    const records = await Attendance.find({
      studentId,
      schoolId,
      isDeleted: false,
      date: { $gte: termStart },
    })
      .sort({ date: 1, period: 1 })
      .lean();

    // Most missed day of week
    const dayAbsences: Record<number, number> = {};
    for (const r of records) {
      if (r.status === 'absent') {
        const dayOfWeek = new Date(r.date).getDay();
        dayAbsences[dayOfWeek] = (dayAbsences[dayOfWeek] ?? 0) + 1;
      }
    }

    let mostMissedDay: string | null = null;
    let maxDayAbsences = 0;
    for (const [day, count] of Object.entries(dayAbsences)) {
      if (count > maxDayAbsences) {
        maxDayAbsences = count;
        mostMissedDay = DAY_NAMES[Number(day)] ?? null;
      }
    }

    // Most missed period
    const periodAbsences: Record<number, number> = {};
    for (const r of records) {
      if (r.status === 'absent') {
        periodAbsences[r.period] = (periodAbsences[r.period] ?? 0) + 1;
      }
    }

    let mostMissedPeriod: number | null = null;
    let maxPeriodAbsences = 0;
    for (const [period, count] of Object.entries(periodAbsences)) {
      if (count > maxPeriodAbsences) {
        maxPeriodAbsences = count;
        mostMissedPeriod = Number(period);
      }
    }

    // Streak calculation (using period 1 records only for daily streaks)
    const dailyRecords = records
      .filter((r) => r.period === 1)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let longestAbsenceStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    for (const r of dailyRecords) {
      if (r.status === 'absent') {
        tempStreak++;
        longestAbsenceStreak = Math.max(longestAbsenceStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Current streak (from most recent)
    for (let i = dailyRecords.length - 1; i >= 0; i--) {
      if (dailyRecords[i].status === 'absent') {
        currentStreak++;
      } else {
        break;
      }
    }

    // Monthly breakdown
    const monthlyMap = new Map<string, { present: number; absent: number; late: number; total: number }>();
    for (const r of records.filter((rec) => rec.period === 1)) {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = monthlyMap.get(key) ?? { present: 0, absent: 0, late: 0, total: 0 };
      bucket.total++;
      if (r.status === 'present') bucket.present++;
      else if (r.status === 'absent') bucket.absent++;
      else if (r.status === 'late') bucket.late++;
      monthlyMap.set(key, bucket);
    }

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        ...data,
        percentage: data.total > 0
          ? Math.round(((data.present + data.late) / data.total) * 10000) / 100
          : 0,
      }));

    return {
      mostMissedDay,
      mostMissedPeriod,
      longestAbsenceStreak,
      currentStreak,
      monthlyBreakdown,
    };
  }
}
