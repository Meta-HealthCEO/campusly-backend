import mongoose, { AnyBulkWriteOperation } from 'mongoose';
import {
  Attendance, IAttendance, AttendanceStatus,
  Discipline, IDiscipline,
  Merit, IMerit,
  LessonPlan, ILessonPlan,
  SubstituteTeacher, ISubstituteTeacher,
} from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

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
    }).lean();

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
      .populate('classId', 'name gradeId')
      .lean();

    return records;
  }

  static async getByClass(classId: string, date: string): Promise<IAttendance[]> {
    const records = await Attendance.find({
      classId,
      date: new Date(date),
      isDeleted: false,
    })
      .sort({ period: 1 })
      .populate('studentId', 'admissionNumber userId gradeId classId')
      .lean();

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

    const records = await Attendance.find(query).lean();

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

  // ─── Discipline CRUD ────────────────────────────────────────────────────────

  static async createDiscipline(data: Partial<IDiscipline>, reportedBy: string): Promise<IDiscipline> {
    const discipline = new Discipline({ ...data, reportedBy });
    return discipline.save();
  }

  static async listDiscipline(
    schoolId: string,
    filters: { studentId?: string; status?: string; type?: string },
    page = 1,
    limit = 20,
  ) {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.maxLimit);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.studentId) filter.studentId = filters.studentId;
    if (filters.status) filter.status = filters.status;
    if (filters.type) filter.type = filters.type;

    const [data, total] = await Promise.all([
      Discipline.find(filter)
        .populate('studentId', 'admissionNumber userId gradeId classId')
        .populate('reportedBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      Discipline.countDocuments(filter),
    ]);

    return { data, total, page: sanitizedPage, limit: sanitizedLimit, totalPages: Math.ceil(total / sanitizedLimit) };
  }

  static async getDisciplineById(id: string): Promise<IDiscipline> {
    const record = await Discipline.findOne({ _id: id, isDeleted: false })
      .populate('studentId', 'admissionNumber userId gradeId classId')
      .populate('reportedBy', 'firstName lastName email')
      .lean();
    if (!record) throw new NotFoundError('Discipline record not found');
    return record;
  }

  static async updateDiscipline(id: string, data: Partial<IDiscipline>): Promise<IDiscipline> {
    const record = await Discipline.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('studentId', 'admissionNumber userId gradeId classId').populate('reportedBy', 'firstName lastName email');
    if (!record) throw new NotFoundError('Discipline record not found');
    return record;
  }

  static async deleteDiscipline(id: string): Promise<IDiscipline> {
    const record = await Discipline.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!record) throw new NotFoundError('Discipline record not found');
    return record;
  }

  // ─── Merit / Demerit CRUD ─────────────────────────────────────────────────

  static async createMerit(data: Partial<IMerit>, awardedBy: string): Promise<IMerit> {
    const merit = new Merit({ ...data, awardedBy });
    return merit.save();
  }

  static async listMerits(
    schoolId: string,
    filters: { studentId?: string; type?: string; category?: string },
    page = 1,
    limit = 20,
  ) {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.maxLimit);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.studentId) filter.studentId = filters.studentId;
    if (filters.type) filter.type = filters.type;
    if (filters.category) filter.category = filters.category;

    const [data, total] = await Promise.all([
      Merit.find(filter)
        .populate('studentId', 'admissionNumber userId gradeId classId')
        .populate('awardedBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      Merit.countDocuments(filter),
    ]);

    return { data, total, page: sanitizedPage, limit: sanitizedLimit, totalPages: Math.ceil(total / sanitizedLimit) };
  }

  static async getStudentMeritBalance(studentId: string, schoolId: string) {
    const merits = await Merit.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId), schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false } },
      {
        $group: {
          _id: '$type',
          totalPoints: { $sum: '$points' },
          count: { $sum: 1 },
        },
      },
    ]);

    const meritPoints = merits.find((m) => m._id === 'merit')?.totalPoints ?? 0;
    const demeritPoints = merits.find((m) => m._id === 'demerit')?.totalPoints ?? 0;

    return { meritPoints, demeritPoints, netPoints: meritPoints - demeritPoints };
  }

  // ─── Lesson Plan CRUD ─────────────────────────────────────────────────────

  static async createLessonPlan(data: Partial<ILessonPlan>, teacherId: string): Promise<ILessonPlan> {
    const plan = new LessonPlan({ ...data, teacherId });
    return plan.save();
  }

  static async listLessonPlans(
    filters: { schoolId?: string; teacherId?: string; classId?: string; subjectId?: string },
    page = 1,
    limit = 20,
  ) {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.maxLimit);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const filter: Record<string, unknown> = { isDeleted: false };
    if (filters.schoolId) filter.schoolId = filters.schoolId;
    if (filters.teacherId) filter.teacherId = filters.teacherId;
    if (filters.classId) filter.classId = filters.classId;
    if (filters.subjectId) filter.subjectId = filters.subjectId;

    const [data, total] = await Promise.all([
      LessonPlan.find(filter)
        .populate('subjectId', 'name code')
        .populate('classId', 'name')
        .sort('-date')
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      LessonPlan.countDocuments(filter),
    ]);

    return { data, total, page: sanitizedPage, limit: sanitizedLimit, totalPages: Math.ceil(total / sanitizedLimit) };
  }

  static async getLessonPlanById(id: string): Promise<ILessonPlan> {
    const plan = await LessonPlan.findOne({ _id: id, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .lean();
    if (!plan) throw new NotFoundError('Lesson plan not found');
    return plan;
  }

  static async updateLessonPlan(id: string, data: Partial<ILessonPlan>): Promise<ILessonPlan> {
    const plan = await LessonPlan.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('subjectId', 'name code').populate('classId', 'name');
    if (!plan) throw new NotFoundError('Lesson plan not found');
    return plan;
  }

  static async deleteLessonPlan(id: string): Promise<ILessonPlan> {
    const plan = await LessonPlan.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!plan) throw new NotFoundError('Lesson plan not found');
    return plan;
  }

  // ─── Substitute Teacher CRUD ──────────────────────────────────────────────

  static async createSubstitute(data: Partial<ISubstituteTeacher>): Promise<ISubstituteTeacher> {
    const sub = new SubstituteTeacher(data);
    return sub.save();
  }

  static async listSubstitutes(
    schoolId: string,
    filters: { date?: string; originalTeacherId?: string },
    page = 1,
    limit = 20,
  ) {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.maxLimit);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.date) filter.date = new Date(filters.date);
    if (filters.originalTeacherId) filter.originalTeacherId = filters.originalTeacherId;

    const [data, total] = await Promise.all([
      SubstituteTeacher.find(filter)
        .populate('originalTeacherId', 'firstName lastName email')
        .populate('substituteTeacherId', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email')
        .populate('classIds', 'name')
        .sort('-date')
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      SubstituteTeacher.countDocuments(filter),
    ]);

    return { data, total, page: sanitizedPage, limit: sanitizedLimit, totalPages: Math.ceil(total / sanitizedLimit) };
  }

  static async getSubstituteById(id: string): Promise<ISubstituteTeacher> {
    const sub = await SubstituteTeacher.findOne({ _id: id, isDeleted: false })
      .populate('originalTeacherId', 'firstName lastName email')
      .populate('substituteTeacherId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('classIds', 'name')
      .lean();
    if (!sub) throw new NotFoundError('Substitute record not found');
    return sub;
  }

  static async updateSubstitute(id: string, data: Partial<ISubstituteTeacher>): Promise<ISubstituteTeacher> {
    const sub = await SubstituteTeacher.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('originalTeacherId', 'firstName lastName email')
      .populate('substituteTeacherId', 'firstName lastName email');
    if (!sub) throw new NotFoundError('Substitute record not found');
    return sub;
  }

  static async deleteSubstitute(id: string): Promise<ISubstituteTeacher> {
    const sub = await SubstituteTeacher.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!sub) throw new NotFoundError('Substitute record not found');
    return sub;
  }
}
