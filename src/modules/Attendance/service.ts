import mongoose from 'mongoose';
import { Attendance, IAttendance, AttendanceStatus } from './model.js';
import { AttendanceStatsService } from './service-stats.js';
import { Student } from '../Student/model.js';
import { Class } from '../Academic/model.js';
import { BadRequestError } from '../../common/errors.js';

interface AttendanceReportFilters {
  schoolId: string;
  studentId?: string;
  classId?: string;
  startDate: string;
  endDate: string;
}

interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

interface DailyClassSummary {
  classId: string;
  className?: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

function normalizeAttendanceDate(date: string | Date): Date {
  const normalized = new Date(date);
  if (Number.isNaN(normalized.getTime())) {
    throw new BadRequestError('Invalid attendance date');
  }
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
}

function endOfAttendanceDate(date: string | Date): Date {
  const normalized = normalizeAttendanceDate(date);
  normalized.setUTCHours(23, 59, 59, 999);
  return normalized;
}

function hasOwnProperty<T extends object>(value: T, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

export class AttendanceService {
  private static async assertClassStudentsBelongToSchool(data: {
    schoolId: string;
    classId: string;
    studentIds: string[];
  }): Promise<void> {
    const uniqueStudentIds = Array.from(new Set(data.studentIds));

    const classExists = await Class.exists({
      _id: data.classId,
      schoolId: data.schoolId,
      isDeleted: false,
    });

    if (!classExists) {
      throw new BadRequestError('Class not found for this school');
    }

    const matchingStudents = await Student.find({
      _id: { $in: uniqueStudentIds },
      schoolId: data.schoolId,
      classId: data.classId,
      enrollmentStatus: 'active',
      isDeleted: false,
    })
      .select('_id')
      .lean();

    if (matchingStudents.length !== uniqueStudentIds.length) {
      throw new BadRequestError('All attendance students must be active learners in the selected class');
    }
  }

  static async record(
    data: {
      studentId: string;
      classId: string;
      schoolId: string;
      date: string;
      period: number;
      status: AttendanceStatus;
      notes?: string;
    },
    recordedBy: string,
  ): Promise<IAttendance> {
    const recordedByOid = new mongoose.Types.ObjectId(recordedBy);
    const dateObj = normalizeAttendanceDate(data.date);

    await AttendanceService.assertClassStudentsBelongToSchool({
      schoolId: data.schoolId,
      classId: data.classId,
      studentIds: [data.studentId],
    });

    const existing = await Attendance.findOne({
      studentId: data.studentId,
      schoolId: data.schoolId,
      date: dateObj,
      period: data.period,
      isDeleted: false,
    });

    if (existing) {
      if (existing.status !== data.status) {
        existing.editHistory.push({ at: new Date(), by: recordedByOid, prevStatus: existing.status });
      }
      existing.status = data.status;
      existing.classId = new mongoose.Types.ObjectId(data.classId);
      if (hasOwnProperty(data, 'notes')) existing.notes = data.notes;
      existing.lastModifiedBy = recordedByOid;
      existing.lastModifiedAt = new Date();
      await existing.save();
      return existing;
    }

    const attendance = await Attendance.create({
      studentId: data.studentId,
      classId: data.classId,
      schoolId: data.schoolId,
      date: dateObj,
      period: data.period,
      status: data.status,
      recordedBy,
      notes: data.notes,
      lastModifiedBy: recordedByOid,
      lastModifiedAt: new Date(),
      isDeleted: false,
    });

    return attendance;
  }

  static async bulkRecord(
    data: {
      classId: string;
      schoolId: string;
      date: string | Date;
      period: number;
      records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>;
    },
    recordedBy: string,
  ): Promise<{ saved: Array<{ studentId: string; status: string }>; failed: Array<{ studentId: string; error: string }> }> {
    const teacherOid = new mongoose.Types.ObjectId(recordedBy);
    const dateObj = normalizeAttendanceDate(data.date);
    const saved: Array<{ studentId: string; status: string }> = [];
    const failed: Array<{ studentId: string; error: string }> = [];
    const studentIds = data.records.map((r) => r.studentId);

    await AttendanceService.assertClassStudentsBelongToSchool({
      schoolId: data.schoolId,
      classId: data.classId,
      studentIds,
    });

    for (const record of data.records) {
      try {
        const existing = await Attendance.findOne({
          studentId: record.studentId,
          schoolId: data.schoolId,
          date: dateObj,
          period: data.period,
          isDeleted: false,
        });

        if (existing) {
          if (existing.status !== record.status) {
            existing.editHistory.push({ at: new Date(), by: teacherOid, prevStatus: existing.status });
          }
          existing.status = record.status;
          existing.lastModifiedBy = teacherOid;
          existing.lastModifiedAt = new Date();
          if (record.notes !== undefined) existing.notes = record.notes;
          await existing.save();
        } else {
          await Attendance.create({
            studentId: record.studentId,
            classId: data.classId,
            schoolId: data.schoolId,
            date: dateObj,
            period: data.period,
            status: record.status,
            notes: record.notes,
            recordedBy,
            lastModifiedBy: teacherOid,
            lastModifiedAt: new Date(),
          });
        }

        saved.push({ studentId: record.studentId, status: record.status });
      } catch (err: unknown) {
        failed.push({
          studentId: record.studentId,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Fire-and-forget stats update — does not block the response
    AttendanceStatsService.updateStatsForStudents(studentIds, data.schoolId).catch((err: unknown) => {
      console.error('Failed to update attendance stats:', err);
    });

    return { saved, failed };
  }

  static async getByStudent(
    studentId: string,
    startDate: string,
    endDate: string,
    schoolId: string,
  ): Promise<IAttendance[]> {
    const records = await Attendance.find({
      studentId,
      schoolId,
      date: { $gte: normalizeAttendanceDate(startDate), $lte: endOfAttendanceDate(endDate) },
      isDeleted: false,
    })
      .sort({ date: 1, period: 1 })
      .populate('classId', 'name gradeId')
      .lean();

    return records;
  }

  static async getByClass(classId: string, date: string, schoolId: string): Promise<IAttendance[]> {
    const records = await Attendance.find({
      classId,
      schoolId,
      date: normalizeAttendanceDate(date),
      isDeleted: false,
    })
      .sort({ period: 1 })
      .populate('studentId', 'admissionNumber userId gradeId classId')
      .lean();

    return records;
  }

  static async getReport(filters: AttendanceReportFilters): Promise<AttendanceStats> {
    const match: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(filters.schoolId),
      date: {
        $gte: normalizeAttendanceDate(filters.startDate),
        $lte: endOfAttendanceDate(filters.endDate),
      },
      isDeleted: false,
    };

    if (filters.studentId) {
      match.studentId = new mongoose.Types.ObjectId(filters.studentId);
    }

    if (filters.classId) {
      match.classId = new mongoose.Types.ObjectId(filters.classId);
    }

    const result = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
        },
      },
    ]);

    const stats = result[0] ?? { totalDays: 0, present: 0, absent: 0, late: 0, excused: 0 };
    const { totalDays, present, absent, late, excused } = stats as {
      totalDays: number; present: number; absent: number; late: number; excused: number;
    };
    const attendancePercentage =
      totalDays > 0 ? Math.round(((present + late) / totalDays) * 10000) / 100 : 0;

    return { totalDays, present, absent, late, excused, attendancePercentage };
  }

  static async getAbsentees(
    schoolId: string,
    date: string,
    period?: number,
    classId?: string,
  ): Promise<IAttendance[]> {
    const query: Record<string, unknown> = {
      schoolId,
      date: normalizeAttendanceDate(date),
      status: 'absent',
      isDeleted: false,
    };

    if (period !== undefined) {
      query.period = period;
    }

    if (classId) {
      query.classId = classId;
    }

    const absentees = await Attendance.find(query)
      .populate('studentId', 'admissionNumber userId gradeId classId')
      .populate('classId', 'name gradeId')
      .lean();

    return absentees;
  }

  static async getDailyReport(
    schoolId: string,
    date: string,
  ): Promise<DailyClassSummary[]> {
    const summaries = await Attendance.aggregate([
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          date: normalizeAttendanceDate(date),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$classId',
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] },
          },
          excused: {
            $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      {
        $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          classId: '$_id',
          className: '$classInfo.name',
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          excused: 1,
          _id: 0,
        },
      },
    ]);

    return summaries;
  }
}
