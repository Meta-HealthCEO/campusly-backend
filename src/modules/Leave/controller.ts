import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { LeaveService } from './service.js';
import { LeaveBalanceService } from './service-balances.js';
import { LeaveReportService } from './service-reports.js';
import type {
  CreateLeaveRequestInput,
  ReviewLeaveRequestInput,
  ListLeaveRequestsInput,
  LeavePolicyInput,
  LeaveBalanceInitInput,
  LeaveCalendarQueryInput,
  SubstituteQueryInput,
  ReportSummaryQueryInput,
} from './validation.js';

export class LeaveController {
  // ─── Policy ─────────────────────────────────────────────────────────────

  static async getPolicy(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const policy = await LeaveService.getPolicy(schoolId as string);
    res.json(apiResponse(true, policy, 'Leave policy retrieved'));
  }

  static async updatePolicy(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: LeavePolicyInput = req.body;
    const policy = await LeaveService.updatePolicy(schoolId as string, data);
    res.json(apiResponse(true, policy, 'Leave policy updated'));
  }

  // ─── Requests ───────────────────────────────────────────────────────────

  static async createRequest(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateLeaveRequestInput = req.body;
    const request = await LeaveService.createRequest(
      user.schoolId as string,
      user.id,
      data,
    );
    res.status(201).json(apiResponse(true, request, 'Leave request created'));
  }

  static async listRequests(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const query: ListLeaveRequestsInput = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      status: req.query.status as ListLeaveRequestsInput['status'],
      leaveType: req.query.leaveType as ListLeaveRequestsInput['leaveType'],
      staffId: req.query.staffId as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await LeaveService.listRequests(
      user.schoolId as string,
      query,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, result, 'Leave requests listed'));
  }

  static async getRequest(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    const request = await LeaveService.getRequest(id as string, schoolId as string);
    res.json(apiResponse(true, request, 'Leave request retrieved'));
  }

  static async reviewRequest(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { id } = req.params;
    const data: ReviewLeaveRequestInput = req.body;
    const request = await LeaveService.reviewRequest(
      id as string,
      user.schoolId as string,
      data,
      user.id,
    );
    res.json(apiResponse(true, request, `Leave request ${data.status}`));
  }

  static async cancelRequest(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { id } = req.params;
    const request = await LeaveService.cancelRequest(
      id as string,
      user.schoolId as string,
      user.id,
    );
    res.json(apiResponse(true, request, 'Leave request cancelled'));
  }

  // ─── Balances ───────────────────────────────────────────────────────────

  static async getBalances(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const query = {
      staffId: req.query.staffId as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
    };

    // Teachers see only their own balance
    if (user.role === 'teacher') {
      query.staffId = user.id;
    }

    const balances = await LeaveBalanceService.getBalances(user.schoolId as string, query);
    res.json(apiResponse(true, balances, 'Leave balances retrieved'));
  }

  static async initializeBalances(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: LeaveBalanceInitInput = req.body;
    const balances = await LeaveBalanceService.initializeBalances(schoolId as string, data);
    res.json(apiResponse(true, balances, 'Leave balances initialized'));
  }

  // ─── Calendar ───────────────────────────────────────────────────────────

  static async getCalendar(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const query: LeaveCalendarQueryInput = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      department: req.query.department as string | undefined,
    };
    const calendar = await LeaveReportService.getCalendar(schoolId as string, query);
    res.json(apiResponse(true, calendar, 'Leave calendar retrieved'));
  }

  // ─── Substitutes ──────────────────────────────────────────────────────

  static async getSuggestions(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const query: SubstituteQueryInput = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      subjectId: req.query.subjectId as string | undefined,
      excludeStaffId: req.query.excludeStaffId as string | undefined,
    };
    const suggestions = await LeaveReportService.getSuggestions(schoolId as string, query);
    res.json(apiResponse(true, suggestions, 'Substitute suggestions retrieved'));
  }

  // ─── Reports ──────────────────────────────────────────────────────────

  static async getReportSummary(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const query: ReportSummaryQueryInput = {
      year: req.query.year ? Number(req.query.year) : undefined,
      department: req.query.department as string | undefined,
      staffId: req.query.staffId as string | undefined,
    };
    const summary = await LeaveReportService.getReportSummary(schoolId as string, query);
    res.json(apiResponse(true, summary, 'Leave report summary retrieved'));
  }
}
