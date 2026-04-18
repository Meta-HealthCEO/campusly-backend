import mongoose, { AnyBulkWriteOperation } from 'mongoose';
import { Attendance, IAttendance, AttendanceStatus } from './model.js';
import { AttendanceStatsService } from './service-stats.js';


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

export class AttendanceService {
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
    const attendance = await Attendance.findOneAndUpdate(
      {
        studentId: data.studentId,
        schoolId: data.schoolId,
        date: new Date(data.date),
        period: data.period,
      },
      {
        $set: {
          studentId: data.studentId,
          classId: data.classId,
          schoolId: data.schoolId,
          date: new Date(data.date),
          period: data.period,
          status: data.status,
          recordedBy,
          notes: data.notes,
          isDeleted: false,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    return attendance;
  }

  static async bulkRecord(
    data: {
      classId: string;
      schoolId: string;
      date: string;
      period: number;
      records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>;
    },
    recordedBy: string,
  ): Promise<IAttendance[]> {
    const operations: AnyBulkWriteOperation<IAttendance>[] = data.records.map((record) => {
      const setFields: Record<string, unknown> = {
        studentId: record.studentId,
        classId: data.classId,
        schoolId: data.schoolId,
        date: new Date(data.date),
        period: data.period,
        status: record.status,
        recordedBy,
        isDeleted: false,
      };

      if (record.notes !== undefined) {
        setFields.notes = record.notes;
      }

      return {
        updateOne: {
          filter: {
            studentId: record.studentId,
            schoolId: data.schoolId,
            date: new Date(data.date),
            period: data.period,
          },
          update: { $set: setFields },
          upsert: true,
        },
      };
    });

    await Attendance.bulkWrite(operations);

    const records = await Attendance.find({
      classId: data.classId,
      date: new Date(data.date),
      period: data.period,
      isDeleted: false,
    }).lean();

    // Fire-and-forget stats update — does not block the response
    const studentIds = data.records.map((r) => r.studentId);
    AttendanceStatsService.updateStatsForStudents(studentIds, data.schoolId).catch((err: unknown) => {
      console.error('Failed to update attendance stats:', err);
    });

    return records;
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
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
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
      date: new Date(date),
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
      date: { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) },
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
  ): Promise<IAttendance[]> {
    const query: Record<string, unknown> = {
      schoolId,
      date: new Date(date),
      status: 'absent',
      isDeleted: false,
    };

    if (period !== undefined) {
      query.period = period;
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
          date: new Date(date),
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
