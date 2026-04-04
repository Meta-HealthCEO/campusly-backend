import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { AttendanceService } from './service.js';
import { AttendanceStatsService } from './service-stats.js';
import { ChronicAbsenceService } from './chronic-absence.service.js';
import { apiResponse } from '../../common/utils.js';

export class AttendanceController {
  static async record(req: Request, res: Response): Promise<void> {
    const attendance = await AttendanceService.record(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, attendance, 'Attendance recorded successfully'));
  }

  static async bulkRecord(req: Request, res: Response): Promise<void> {
    const records = await AttendanceService.bulkRecord(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, records, 'Bulk attendance recorded successfully'));
  }

  static async getByStudent(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.params.studentId as string;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'startDate and endDate are required'));
      return;
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
      res.status(400).json(apiResponse(false, undefined, undefined, 'date is required'));
      return;
    }

    const records = await AttendanceService.getByClass(classId, date as string, schoolId);
    res.json(apiResponse(true, records, 'Class attendance retrieved successfully'));
  }

  static async getReport(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { studentId, classId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'startDate and endDate are required'));
      return;
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
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const { date, period } = req.query;

    if (!date) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'date is required'));
      return;
    }

    const absentees = await AttendanceService.getAbsentees(
      schoolId,
      date as string,
      period ? Number(period) : undefined,
    );
    res.json(apiResponse(true, absentees, 'Absentees retrieved successfully'));
  }

  static async getDailyReport(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

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
    const record = await AttendanceService.createDiscipline(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, record, 'Discipline record created successfully'));
  }

  static async listDiscipline(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await AttendanceService.listDiscipline(
      schoolId,
      { studentId: req.query.studentId as string, status: req.query.status as string, type: req.query.type as string },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'Discipline records retrieved successfully'));
  }

  static async getDiscipline(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const record = await AttendanceService.getDisciplineById(req.params.id as string, schoolId);
    res.json(apiResponse(true, record, 'Discipline record retrieved successfully'));
  }

  static async updateDiscipline(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const record = await AttendanceService.updateDiscipline(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, record, 'Discipline record updated successfully'));
  }

  static async deleteDiscipline(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AttendanceService.deleteDiscipline(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Discipline record deleted successfully'));
  }

  // ─── Merit / Demerit ────────────────────────────────────────────────────────

  static async createMerit(req: Request, res: Response): Promise<void> {
    const merit = await AttendanceService.createMerit(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, merit, 'Merit/demerit recorded successfully'));
  }

  static async listMerits(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await AttendanceService.listMerits(
      schoolId,
      { studentId: req.query.studentId as string, type: req.query.type as string, category: req.query.category as string },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'Merits retrieved successfully'));
  }

  static async getMeritBalance(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const balance = await AttendanceService.getStudentMeritBalance(req.params.studentId as string, schoolId);
    res.json(apiResponse(true, balance, 'Merit balance retrieved successfully'));
  }

  // ─── Lesson Plans ─────────────────────────────────────────────────────────

  static async createLessonPlan(req: Request, res: Response): Promise<void> {
    const plan = await AttendanceService.createLessonPlan(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, plan, 'Lesson plan created successfully'));
  }

  static async listLessonPlans(req: Request, res: Response): Promise<void> {
    const result = await AttendanceService.listLessonPlans(
      {
        schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
        teacherId: req.query.teacherId as string,
        classId: req.query.classId as string,
        subjectId: req.query.subjectId as string,
      },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'Lesson plans retrieved successfully'));
  }

  static async getLessonPlan(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const plan = await AttendanceService.getLessonPlanById(req.params.id as string, schoolId);
    res.json(apiResponse(true, plan, 'Lesson plan retrieved successfully'));
  }

  static async updateLessonPlan(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const plan = await AttendanceService.updateLessonPlan(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, plan, 'Lesson plan updated successfully'));
  }

  static async deleteLessonPlan(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AttendanceService.deleteLessonPlan(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Lesson plan deleted successfully'));
  }

  // ─── Substitute Teacher ───────────────────────────────────────────────────

  static async createSubstitute(req: Request, res: Response): Promise<void> {
    const sub = await AttendanceService.createSubstitute(req.body);
    res.status(201).json(apiResponse(true, sub, 'Substitute teacher recorded successfully'));
  }

  static async listSubstitutes(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await AttendanceService.listSubstitutes(
      schoolId,
      { date: req.query.date as string, originalTeacherId: req.query.originalTeacherId as string },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'Substitutes retrieved successfully'));
  }

  static async getSubstitute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sub = await AttendanceService.getSubstituteById(req.params.id as string, schoolId);
    res.json(apiResponse(true, sub, 'Substitute record retrieved successfully'));
  }

  static async updateSubstitute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sub = await AttendanceService.updateSubstitute(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, sub, 'Substitute record updated successfully'));
  }

  static async deleteSubstitute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AttendanceService.deleteSubstitute(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Substitute record deleted successfully'));
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
