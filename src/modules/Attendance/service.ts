import mongoose, { AnyBulkWriteOperation } from 'mongoose';
import { Attendance, IAttendance, AttendanceStatus } from './model.js';
import { NotFoundError } from '../../common/errors.js';

interface AttendanceReportFilters {
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
      status: string;
      notes?: string;
    },
    recordedBy: string,
  ): Promise<IAttendance> {
    const attendance = await Attendance.findOneAndUpdate(
      {
        studentId: data.studentId,
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
      records: Array<{ studentId: string; status: string; notes?: string }>;
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
        status: record.status as AttendanceStatus,
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
    });

    return records;
  }

  static async getByStudent(
    studentId: string,
    startDate: string,
    endDate: string,
  ): Promise<IAttendance[]> {
    const records = await Attendance.find({
      studentId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isDeleted: false,
    })
      .sort({ date: 1, period: 1 })
      .populate('classId');

    return records;
  }

  static async getByClass(classId: string, date: string): Promise<IAttendance[]> {
    const records = await Attendance.find({
      classId,
      date: new Date(date),
      isDeleted: false,
    })
      .sort({ period: 1 })
      .populate('studentId');

    return records;
  }

  static async getReport(filters: AttendanceReportFilters): Promise<AttendanceStats> {
    const query: Record<string, unknown> = {
      date: { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) },
      isDeleted: false,
    };

    if (filters.studentId) {
      query.studentId = filters.studentId;
    }

    if (filters.classId) {
      query.classId = filters.classId;
    }

    const records = await Attendance.find(query);

    const totalDays = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const attendancePercentage =
      totalDays > 0 ? Math.round(((present + late) / totalDays) * 10000) / 100 : 0;

    return {
      totalDays,
      present,
      absent,
      late,
      excused,
      attendancePercentage,
    };
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
      .populate('studentId')
      .populate('classId');

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
