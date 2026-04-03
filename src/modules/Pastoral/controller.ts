import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';

// Extended user type — includes JWT permission flags set by authenticate middleware
interface PastoralUser extends AuthenticatedUser {
  isCounselor?: boolean;
  isSchoolPrincipal?: boolean;
}
import { ReferralService } from './service-referrals.js';
import { SessionService } from './service-sessions.js';
import { WellbeingService } from './service-wellbeing.js';
import { CaseloadService } from './service-caseload.js';
import { ReportService } from './service-reports.js';

export class PastoralController {
  // ─── Referrals ───────────────────────────────────────────────────────────

  static async createReferral(req: Request, res: Response): Promise<void> {
    const user = getUser(req) as PastoralUser;
    const referral = await ReferralService.createReferral(user, req.body);
    res.status(201).json(apiResponse(true, referral, 'Referral created successfully'));
  }

  static async listReferrals(req: Request, res: Response): Promise<void> {
    const user = getUser(req) as PastoralUser;
    const result = await ReferralService.listReferrals(user, {
      status: req.query.status as string | undefined,
      reason: req.query.reason as string | undefined,
      urgency: req.query.urgency as string | undefined,
      studentId: req.query.studentId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async updateReferral(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const referral = await ReferralService.updateReferral(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.json(apiResponse(true, referral, 'Referral updated successfully'));
  }

  static async resolveReferral(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const referral = await ReferralService.resolveReferral(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.json(apiResponse(true, referral, 'Referral resolved successfully'));
  }

  // ─── Sessions ────────────────────────────────────────────────────────────

  static async createSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req) as PastoralUser;
    const session = await SessionService.createSession(user, req.body);
    res.status(201).json(apiResponse(true, session, 'Session recorded successfully'));
  }

  static async listSessions(req: Request, res: Response): Promise<void> {
    const user = getUser(req) as PastoralUser;
    const result = await SessionService.listSessions(user, {
      studentId: req.query.studentId as string | undefined,
      referralId: req.query.referralId as string | undefined,
      sessionType: req.query.sessionType as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async updateSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const session = await SessionService.updateSession(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, session, 'Session updated successfully'));
  }

  // ─── Wellbeing ───────────────────────────────────────────────────────────

  static async getWellbeingProfile(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const profile = await WellbeingService.getWellbeingProfile(
      req.params.studentId as string,
      user.schoolId!,
    );
    res.json(apiResponse(true, profile));
  }

  // ─── Caseload ────────────────────────────────────────────────────────────

  static async getCaseload(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const caseload = await CaseloadService.getCaseload(user.id, user.schoolId!);
    res.json(apiResponse(true, caseload));
  }

  // ─── Reports ─────────────────────────────────────────────────────────────

  static async getReport(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const reportType = req.query.reportType as
      | 'referral_reasons'
      | 'sessions_monthly'
      | 'outcomes';
    const year = req.query.year ? Number(req.query.year) : undefined;
    const report = await ReportService.getReport(user.schoolId!, reportType, year);
    res.json(apiResponse(true, report));
  }
}
