import { Request, Response } from 'express';
import { ReportService } from './service.js';
import { apiResponse } from '../../common/utils.js';
import { getUser } from '../../types/authenticated-request.js';
import { assertCanAccessStudentReport } from './helpers.js';

function getScopedSchoolId(req: Request): string | undefined {
  const user = getUser(req);
  if (user.role === 'super_admin') {
    return (req.query.schoolId as string | undefined) ?? user.schoolId;
  }
  return user.schoolId;
}

export class ReportController {
  // ─── Dashboard Stats ────────────────────────────────────────────────────────

  static async getDashboardStats(req: Request, res: Response): Promise<void> {
    const schoolId = getScopedSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const stats = await ReportService.getDashboardStats(schoolId);
    res.json(apiResponse(true, stats, 'Dashboard stats retrieved successfully'));
  }

  // ─── Revenue Report ─────────────────────────────────────────────────────────

  static async getRevenueReport(req: Request, res: Response): Promise<void> {
    const schoolId = getScopedSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const report = await ReportService.getRevenueReport(
      schoolId,
      req.query.startDate as string | undefined,
      req.query.endDate as string | undefined,
    );
    res.json(apiResponse(true, report, 'Revenue report retrieved successfully'));
  }

  // ─── Attendance Report ──────────────────────────────────────────────────────

  static async getAttendanceReport(req: Request, res: Response): Promise<void> {
    const schoolId = getScopedSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const report = await ReportService.getAttendanceReport(
      schoolId,
      req.query.startDate as string | undefined,
      req.query.endDate as string | undefined,
      req.query.gradeId as string | undefined,
      req.query.classId as string | undefined,
    );
    res.json(apiResponse(true, report, 'Attendance report retrieved successfully'));
  }

  // ─── Academic Performance Report ────────────────────────────────────────────

  static async getAcademicPerformanceReport(req: Request, res: Response): Promise<void> {
    const schoolId = getScopedSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const report = await ReportService.getAcademicPerformanceReport(
      schoolId,
      req.query.term ? Number(req.query.term) : undefined,
      req.query.academicYear ? Number(req.query.academicYear) : undefined,
    );
    res.json(apiResponse(true, report, 'Academic performance report retrieved successfully'));
  }

  // ─── Student Report Card ────────────────────────────────────────────────────

  static async getStudentReportCard(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const term = Number(req.query.term);
    const academicYear = Number(req.query.academicYear);
    const user = getUser(req);

    if (!term || !academicYear) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'term and academicYear are required'));
      return;
    }

    const access = await assertCanAccessStudentReport(user, studentId);
    const reportCard = await ReportService.getStudentReportCard(studentId, term, academicYear, access.schoolId);
    res.json(apiResponse(true, reportCard, 'Student report card retrieved successfully'));
  }

  // ─── Student 360 View ───────────────────────────────────────────────────────

  static async getStudent360(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const user = getUser(req);
    const access = await assertCanAccessStudentReport(user, studentId);
    const data = await ReportService.getStudent360(access.schoolId, studentId);
    if (!data) {
      res.status(404).json(apiResponse(false, undefined, undefined, 'Student not found'));
      return;
    }
    res.json(apiResponse(true, data, 'Student 360 view retrieved successfully'));
  }

  // ─── Debtors Report ─────────────────────────────────────────────────────────

  static async getDebtorsReport(req: Request, res: Response): Promise<void> {
    const schoolId = getScopedSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const debtors = await ReportService.getDebtorsReport(schoolId, page, limit);
    res.json(apiResponse(true, debtors, 'Debtors report retrieved successfully'));
  }

  // ─── Tuck Shop Sales Report ─────────────────────────────────────────────────

  static async getTuckShopSalesReport(req: Request, res: Response): Promise<void> {
    const schoolId = getScopedSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'daily';
    const report = await ReportService.getTuckShopSalesReport(
      schoolId,
      period,
      req.query.startDate as string | undefined,
      req.query.endDate as string | undefined,
    );
    res.json(apiResponse(true, report, 'Tuck shop sales report retrieved successfully'));
  }
}
