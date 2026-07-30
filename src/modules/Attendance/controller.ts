import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { AttendanceService } from './service.js';
import { DisciplineService } from './service-discipline.js';
import { MeritService } from './service-merit.js';
import { SubstituteService } from './service-substitute.js';
import { AttendanceStatsService } from './service-stats.js';
import { ChronicAbsenceService } from './chronic-absence.service.js';
import { apiResponse } from '../../common/utils.js';
import { requireSchoolScope } from '../../common/school-scope.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import { Student } from '../Student/model.js';
import { Class, Timetable } from '../Academic/model.js';
import type { ISubstituteTeacher } from './model.js';

function firstQueryValue(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

async function assertCanReadStudentAttendance(
  user: AuthenticatedUser,
  studentId: string,
  schoolId: string,
): Promise<void> {
  const student = await Student.findOne({
    _id: studentId,
    schoolId,
    isDeleted: false,
  })
    .select('_id userId classId')
    .lean();

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  if (user.role === 'school_admin' || user.role === 'super_admin' || user.role === 'parent') {
    return;
  }

  if (user.role === 'student') {
    if (student.userId?.toString() === user.id) return;
    throw new ForbiddenError('You can only access your own attendance');
  }

  if (user.role === 'teacher') {
    const classId = student.classId.toString();
    const [homeroom, timetableEntry] = await Promise.all([
      Class.findOne({ _id: classId, schoolId, teacherId: user.id, isDeleted: false }).lean(),
      Timetable.findOne({ schoolId, teacherId: user.id, classId, isDeleted: false }).lean(),
    ]);

    if (homeroom || timetableEntry) return;
    throw new ForbiddenError('You can only access attendance for learners in your classes');
  }

  throw new ForbiddenError('You do not have access to this attendance data');
}

function requireTeacherScopedQuery(user: AuthenticatedUser, classId?: string, studentId?: string): void {
  if (user.role === 'teacher' && !classId && !studentId) {
    throw new BadRequestError('classId or studentId is required for teacher attendance queries');
  }
}

function queueAttendanceAlerts(schoolId: string, date: Date | string, period: number): void {
  const alertDate = new Date(date);
  if (Number.isNaN(alertDate.getTime())) return;
  alertDate.setUTCHours(0, 0, 0, 0);

  void import('../../jobs/attendance-alert.job.js')
    .then(({ addAttendanceAlertJob }) => addAttendanceAlertJob({
      schoolId,
      date: alertDate.toISOString(),
      period,
    }))
    .catch((err: unknown) => {
      console.error('Failed to queue attendance alerts:', err);
    });
}

export class AttendanceController {
  static async record(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const attendance = await AttendanceService.record({ ...req.body, schoolId: user.schoolId }, user.id);
    if (attendance.status === 'absent' && user.schoolId) {
      queueAttendanceAlerts(user.schoolId, attendance.date, attendance.period);
    }
    res.status(201).json(apiResponse(true, attendance, 'Attendance recorded successfully'));
  }

  static async bulkRecord(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await AttendanceService.bulkRecord({ ...req.body, schoolId: user.schoolId }, user.id);
    const hasPartialFailure = result.failed.length > 0 && result.saved.length > 0;
    const allFailed = result.failed.length > 0 && result.saved.length === 0;
    const status = allFailed ? 500 : hasPartialFailure ? 207 : 201;
    const message = allFailed
      ? 'All attendance records failed to save'
      : hasPartialFailure
        ? `Bulk attendance partially recorded: ${result.saved.length} saved, ${result.failed.length} failed`
        : 'Bulk attendance recorded successfully';
    if (!allFailed && user.schoolId && result.saved.some((record) => record.status === 'absent')) {
      queueAttendanceAlerts(user.schoolId, req.body.date as string, req.body.period as number);
    }
    res.status(status).json(apiResponse(!allFailed, result, message));
  }

  static async getByStudent(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const studentId = req.params.studentId as string;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('startDate and endDate are required');
    }

    await assertCanReadStudentAttendance(user, studentId, schoolId);

    const records = await AttendanceService.getByStudent(
      studentId,
      startDate as string,
      endDate as string,
      schoolId,
    );
    res.json(apiResponse(true, records, 'Student attendance retrieved successfully'));
  }

  static async getByClass(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const classId = req.params.classId as string;
    const date = firstQueryValue(req.query.date);
    const dateFrom = firstQueryValue(req.query.dateFrom);
    const dateTo = firstQueryValue(req.query.dateTo);
    const periodValue = firstQueryValue(req.query.period);

    if (date) {
      const records = await AttendanceService.getByClass(classId, date, schoolId);
      res.json(apiResponse(true, records, 'Class attendance retrieved successfully'));
      return;
    }

    if (dateFrom && dateTo) {
      const parsedPeriod = periodValue ? Number(periodValue) : undefined;
      if (parsedPeriod !== undefined && (!Number.isInteger(parsedPeriod) || parsedPeriod <= 0)) {
        throw new BadRequestError('period must be a positive integer');
      }
      const records = await AttendanceService.getByClass(
        classId,
        { dateFrom, dateTo, period: parsedPeriod },
        schoolId,
      );
      res.json(apiResponse(true, records, 'Class attendance retrieved successfully'));
      return;
    }

    throw new BadRequestError('Either `date` or `dateFrom`+`dateTo` is required');
  }

  static async getReport(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const { startDate, endDate } = req.query;
    const studentId = firstQueryValue(req.query.studentId);
    const classId = firstQueryValue(req.query.classId);

    if (!startDate || !endDate) {
      throw new BadRequestError('startDate and endDate are required');
    }

    requireTeacherScopedQuery(user, classId, studentId);
    if (studentId) {
      await assertCanReadStudentAttendance(user, studentId, schoolId);
    }

    const report = await AttendanceService.getReport({
      schoolId,
      studentId,
      classId,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(apiResponse(true, report, 'Attendance report retrieved successfully'));
  }

  static async getAbsentees(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const { date } = req.query;
    const periodValue = firstQueryValue(req.query.period);
    const classId = firstQueryValue(req.query.classId);

    if (!date) {
      throw new BadRequestError('date is required');
    }
    const parsedPeriod = periodValue ? Number(periodValue) : undefined;
    if (parsedPeriod !== undefined && (!Number.isInteger(parsedPeriod) || parsedPeriod <= 0)) {
      throw new BadRequestError('period must be a positive integer');
    }

    requireTeacherScopedQuery(user, classId);

    const absentees = await AttendanceService.getAbsentees(
      schoolId,
      date as string,
      parsedPeriod,
      classId,
    );
    res.json(apiResponse(true, absentees, 'Absentees retrieved successfully'));
  }

  static async getDailyReport(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const date = req.params.date as string;
    const report = await AttendanceService.getDailyReport(schoolId, date);
    res.json(apiResponse(true, report, 'Daily report retrieved successfully'));
  }

  // ─── Chronic Absence ────────────────────────────────────────────────────────

  static async getChronicAbsentees(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const threshold = req.query.threshold ? Number(req.query.threshold) : 80;
    if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 100) {
      throw new BadRequestError('threshold must be between 1 and 100');
    }
    const classId = firstQueryValue(req.query.classId);
    requireTeacherScopedQuery(user, classId);
    const absentees = await ChronicAbsenceService.getChronicAbsentees(schoolId, threshold, classId);
    res.json(apiResponse(true, absentees, 'Chronic absentees retrieved successfully'));
  }

  static async getStudentPatterns(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const studentId = req.params.studentId as string;
    await assertCanReadStudentAttendance(user, studentId, schoolId);
    const patterns = await ChronicAbsenceService.getStudentPatterns(studentId, schoolId);
    res.json(apiResponse(true, patterns, 'Attendance patterns retrieved successfully'));
  }

  // ─── Discipline ─────────────────────────────────────────────────────────────

  static async createDiscipline(req: Request, res: Response): Promise<void> {
    const record = await DisciplineService.createDiscipline(req.body, getUser(req));
    res.status(201).json(apiResponse(true, record, 'Discipline record created successfully'));
  }

  static async listDiscipline(req: Request, res: Response): Promise<void> {
    const result = await DisciplineService.listDiscipline(
      getUser(req),
      { studentId: req.query.studentId as string, status: req.query.status as string, type: req.query.type as string },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'Discipline records retrieved successfully'));
  }

  static async getDiscipline(req: Request, res: Response): Promise<void> {
    const record = await DisciplineService.getDisciplineById(req.params.id as string, getUser(req));
    res.json(apiResponse(true, record, 'Discipline record retrieved successfully'));
  }

  static async updateDiscipline(req: Request, res: Response): Promise<void> {
    const record = await DisciplineService.updateDiscipline(req.params.id as string, getUser(req), req.body);
    res.json(apiResponse(true, record, 'Discipline record updated successfully'));
  }

  static async deleteDiscipline(req: Request, res: Response): Promise<void> {
    await DisciplineService.deleteDiscipline(req.params.id as string, getUser(req));
    res.json(apiResponse(true, undefined, 'Discipline record deleted successfully'));
  }

  // ─── Merit / Demerit ────────────────────────────────────────────────────────

  static async createMerit(req: Request, res: Response): Promise<void> {
    // Tenant from the JWT — a body-supplied schoolId previously let a teacher
    // write merit/demerit records into another school.
    const merit = await MeritService.createMerit(
      { ...req.body, schoolId: requireSchoolScope(req) },
      getUser(req).id,
    );
    res.status(201).json(apiResponse(true, merit, 'Merit/demerit recorded successfully'));
  }

  static async listMerits(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await MeritService.listMerits(
      schoolId,
      { studentId: req.query.studentId as string, type: req.query.type as string, category: req.query.category as string },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'Merits retrieved successfully'));
  }

  static async getMeritBalance(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const balance = await MeritService.getStudentMeritBalance(req.params.studentId as string, schoolId);
    res.json(apiResponse(true, balance, 'Merit balance retrieved successfully'));
  }

  // ─── Substitute Teacher ───────────────────────────────────────────────────

  static async createSubstitute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sub = await SubstituteService.createSubstitute({ ...req.body, schoolId });
    res.status(201).json(apiResponse(true, sub, 'Substitute teacher recorded successfully'));
  }

  static async listSubstitutes(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await SubstituteService.listSubstitutes(
      schoolId,
      {
        date: req.query.date as string,
        originalTeacherId: req.query.originalTeacherId as string,
        status: req.query.status as string,
      },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'Substitutes retrieved successfully'));
  }

  static async getSubstitute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sub = await SubstituteService.getSubstituteById(req.params.id as string, schoolId);
    res.json(apiResponse(true, sub, 'Substitute record retrieved successfully'));
  }

  static async updateSubstitute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const patch = { ...(req.body as Record<string, unknown>) };
    delete patch.schoolId;
    const sub = await SubstituteService.updateSubstitute(
      req.params.id as string,
      schoolId,
      patch as Partial<ISubstituteTeacher>,
    );
    res.json(apiResponse(true, sub, 'Substitute record updated successfully'));
  }

  static async deleteSubstitute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await SubstituteService.deleteSubstitute(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Substitute record deleted successfully'));
  }

  static async approveSubstitute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sub = await SubstituteService.approveSubstitute(req.params.id as string, schoolId, req.user!.id);
    res.json(apiResponse(true, sub, 'Substitute approved'));
  }

  static async declineSubstitute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sub = await SubstituteService.declineSubstitute(
      req.params.id as string,
      schoolId,
      req.body.reason as string,
    );
    res.json(apiResponse(true, sub, 'Substitute declined'));
  }

  static async getSubstituteSuggestions(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    if (!req.query.date || !req.query.periods || !req.query.originalTeacherId) {
      throw new BadRequestError('date, periods, and originalTeacherId are required');
    }
    const date = new Date(req.query.date as string);
    const periods = (req.query.periods as string)
      .split(',')
      .map((p) => Number(p.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (periods.length === 0) {
      throw new BadRequestError('At least one valid period is required');
    }
    const originalTeacherId = req.query.originalTeacherId as string;
    const suggestions = await SubstituteService.suggestAvailableTeachers(schoolId, date, periods, originalTeacherId);
    res.json(apiResponse(true, suggestions, 'Suggestions retrieved'));
  }

  static async getTeacherSubstituteHistory(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const schoolId = user.schoolId!;
    const teacherId = user.role === 'teacher' ? user.id : (req.params.teacherId as string);
    const history = await SubstituteService.listTeacherHistory(teacherId, schoolId);
    res.json(apiResponse(true, history, 'History retrieved'));
  }

  // ─── Attendance Stats ────────────────────────────────────────────────────────

  static async getStudentStats(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const studentId = req.params.studentId as string;
    await assertCanReadStudentAttendance(user, studentId, schoolId);
    const stats = await AttendanceStatsService.getStudentStats(studentId, schoolId);
    res.json(apiResponse(true, stats, 'Student attendance stats retrieved successfully'));
  }

  static async getClassStats(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const classId = req.params.classId as string;
    const stats = await AttendanceStatsService.getClassStats(classId, schoolId);
    res.json(apiResponse(true, stats, 'Class attendance stats retrieved successfully'));
  }

  static async getStatsChronicAbsentees(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const absentees = await AttendanceStatsService.getChronicAbsentees(schoolId);
    res.json(apiResponse(true, absentees, 'Chronic absentees retrieved successfully'));
  }
}
