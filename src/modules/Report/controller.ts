import { Request, Response } from 'express';
import { ReportService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class ReportController {
  // ─── Dashboard Stats ────────────────────────────────────────────────────────

  static async getDashboardStats(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const stats = await ReportService.getDashboardStats(schoolId as string);
    res.json(apiResponse(true, stats, 'Dashboard stats retrieved successfully'));
  }

  // ─── Revenue Report ─────────────────────────────────────────────────────────

  static async getRevenueReport(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const report = await ReportService.getRevenueReport(
      schoolId as string,
      req.query.startDate as string | undefined,
      req.query.endDate as string | undefined,
    );
    res.json(apiResponse(true, report, 'Revenue report retrieved successfully'));
  }

  // ─── Attendance Report ──────────────────────────────────────────────────────

  static async getAttendanceReport(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const report = await ReportService.getAttendanceReport(
      schoolId as string,
      req.query.startDate as string | undefined,
      req.query.endDate as string | undefined,
      req.query.gradeId as string | undefined,
      req.query.classId as string | undefined,
    );
    res.json(apiResponse(true, report, 'Attendance report retrieved successfully'));
  }

  // ─── Academic Performance Report ────────────────────────────────────────────

  static async getAcademicPerformanceReport(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const report = await ReportService.getAcademicPerformanceReport(
      schoolId as string,
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

    if (!term || !academicYear) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'term and academicYear are required'));
      return;
    }

    const reportCard = await ReportService.getStudentReportCard(studentId, term, academicYear);
    res.json(apiResponse(true, reportCard, 'Student report card retrieved successfully'));
  }

  // ─── Debtors Report ─────────────────────────────────────────────────────────

  static async getDebtorsReport(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const debtors = await ReportService.getDebtorsReport(schoolId as string);
    res.json(apiResponse(true, debtors, 'Debtors report retrieved successfully'));
  }

  // ─── Tuck Shop Sales Report ─────────────────────────────────────────────────

  static async getTuckShopSalesReport(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'daily';
    const report = await ReportService.getTuckShopSalesReport(
      schoolId as string,
      period,
      req.query.startDate as string | undefined,
      req.query.endDate as string | undefined,
    );
    res.json(apiResponse(true, report, 'Tuck shop sales report retrieved successfully'));
  }
}
