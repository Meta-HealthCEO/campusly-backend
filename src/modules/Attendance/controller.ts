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
import { BadRequestError } from '../../common/errors.js';

export class AttendanceController {
  static async record(req: Request, res: Response): Promise<void> {
    const attendance = await AttendanceService.record(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, attendance, 'Attendance recorded successfully'));
  }

  static async bulkRecord(req: Request, res: Response): Promise<void> {
    const result = await AttendanceService.bulkRecord(req.body, getUser(req).id);
    const hasPartialFailure = result.failed.length > 0 && result.saved.length > 0;
    const allFailed = result.failed.length > 0 && result.saved.length === 0;
    const status = allFailed ? 500 : hasPartialFailure ? 207 : 201;
    const message = allFailed
      ? 'All attendance records failed to save'
      : hasPartialFailure
        ? `Bulk attendance partially recorded: ${result.saved.length} saved, ${result.failed.length} failed`
        : 'Bulk attendance recorded successfully';
    res.status(status).json(apiResponse(!allFailed, result, message));
  }

  static async getByStudent(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.params.studentId as string;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('startDate and endDate are required');
    }

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
    const { date } = req.query;

    if (!date) {
      throw new BadRequestError('date is required');
    }

    const records = await AttendanceService.getByClass(classId, date as string, schoolId);
    res.json(apiResponse(true, records, 'Class attendance retrieved successfully'));
  }

  static async getReport(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { studentId, classId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('startDate and endDate are required');
    }

    const report = await AttendanceService.getReport({
      schoolId,
      studentId: studentId as string | undefined,
      classId: classId as string | undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(apiResponse(true, report, 'Attendance report retrieved successfully'));
  }

  static async getAbsentees(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { date, period } = req.query;

    if (!date) {
      throw new BadRequestError('date is required');
    }

    const absentees = await AttendanceService.getAbsentees(
      schoolId,
      date as string,
      period ? Number(period) : undefined,
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
    const schoolId = req.user!.schoolId!;
    const threshold = req.query.threshold ? Number(req.query.threshold) : 80;
    const absentees = await ChronicAbsenceService.getChronicAbsentees(schoolId, threshold);
    res.json(apiResponse(true, absentees, 'Chronic absentees retrieved successfully'));
  }

  static async getStudentPatterns(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.params.studentId as string;
    const patterns = await ChronicAbsenceService.getStudentPatterns(studentId, schoolId);
    res.json(apiResponse(true, patterns, 'Attendance patterns retrieved successfully'));
  }

  // ─── Discipline ─────────────────────────────────────────────────────────────

  static async createDiscipline(req: Request, res: Response): Promise<void> {
    const record = await DisciplineService.createDiscipline(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, record, 'Discipline record created successfully'));
  }

  static async listDiscipline(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await DisciplineService.listDiscipline(
      schoolId,
      { studentId: req.query.studentId as string, status: req.query.status as string, type: req.query.type as string },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'Discipline records retrieved successfully'));
  }

  static async getDiscipline(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const record = await DisciplineService.getDisciplineById(req.params.id as string, schoolId);
    res.json(apiResponse(true, record, 'Discipline record retrieved successfully'));
  }

  static async updateDiscipline(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const record = await DisciplineService.updateDiscipline(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, record, 'Discipline record updated successfully'));
  }

  static async deleteDiscipline(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await DisciplineService.deleteDiscipline(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Discipline record deleted successfully'));
  }

  // ─── Merit / Demerit ────────────────────────────────────────────────────────

  static async createMerit(req: Request, res: Response): Promise<void> {
    const merit = await MeritService.createMerit(req.body, getUser(req).id);
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
    const sub = await SubstituteService.createSubstitute(req.body);
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
    const sub = await SubstituteService.updateSubstitute(req.params.id as string, schoolId, req.body);
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
    const schoolId = req.user!.schoolId!;
    const studentId = req.params.studentId as string;
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
