import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { SIPService } from './service-sip.js';
import { PolicyService } from './service-policies.js';

export class GovernanceController {
  // ─── SIP Plans ──────────────────────────────────────────────────────────

  static async createPlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const plan = await SIPService.createPlan(user.schoolId!, user.id, req.body);
    res.status(201).json(apiResponse(true, plan, 'SIP plan created successfully'));
  }

  static async listPlans(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await SIPService.listPlans(user.schoolId!, {
      year: req.query.year ? Number(req.query.year) : undefined,
      status: req.query.status as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getPlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const plan = await SIPService.getPlan(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, plan));
  }

  static async updatePlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const plan = await SIPService.updatePlan(req.params.id as string, user.schoolId!, req.body);
    res.json(apiResponse(true, plan, 'SIP plan updated successfully'));
  }

  static async deletePlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await SIPService.deletePlan(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, undefined, 'SIP plan deleted successfully'));
  }

  // ─── SIP Goals ──────────────────────────────────────────────────────────

  static async createGoal(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const goal = await SIPService.createGoal(req.params.id as string, user.schoolId!, req.body);
    res.status(201).json(apiResponse(true, goal, 'SIP goal created successfully'));
  }

  static async updateGoal(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const goal = await SIPService.updateGoal(req.params.id as string, user.schoolId!, req.body);
    res.json(apiResponse(true, goal, 'SIP goal updated successfully'));
  }

  // ─── SIP Evidence ───────────────────────────────────────────────────────

  static async addEvidence(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const evidence = await SIPService.addEvidence(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, evidence, 'Evidence added successfully'));
  }

  static async listEvidence(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const evidence = await SIPService.listEvidence(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, evidence));
  }

  // ─── SIP Reviews ────────────────────────────────────────────────────────

  static async addReview(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const review = await SIPService.addReview(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, review, 'Review added successfully'));
  }

  static async listReviews(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const reviews = await SIPService.listReviews(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, reviews));
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────

  static async getDashboard(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data = await SIPService.getDashboard(user.schoolId!);
    res.json(apiResponse(true, data, 'SIP dashboard retrieved successfully'));
  }

  // ─── Policies ───────────────────────────────────────────────────────────

  static async createPolicy(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const policy = await PolicyService.createPolicy(user.schoolId!, user.id, req.body);
    res.status(201).json(apiResponse(true, policy, 'Policy created successfully'));
  }

  static async listPolicies(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await PolicyService.listPolicies(user.schoolId!, {
      category: req.query.category as string | undefined,
      status: req.query.status as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getPolicy(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const policy = await PolicyService.getPolicy(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, policy));
  }

  static async updatePolicy(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const policy = await PolicyService.updatePolicy(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, policy, 'Policy updated successfully'));
  }

  static async deletePolicy(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await PolicyService.deletePolicy(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, undefined, 'Policy deleted successfully'));
  }

  // ─── Acknowledgements ───────────────────────────────────────────────────

  static async acknowledgePolicy(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const ack = await PolicyService.acknowledgePolicy(
      req.params.id as string,
      user.schoolId!,
      user.id,
    );
    res.status(201).json(apiResponse(true, ack, 'Policy acknowledged successfully'));
  }

  static async getAcknowledgements(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const acks = await PolicyService.getAcknowledgements(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, acks));
  }

  static async getPendingAcknowledgements(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const pending = await PolicyService.getPendingAcknowledgements(user.schoolId!, user.id);
    res.json(apiResponse(true, pending, 'Pending acknowledgements retrieved successfully'));
  }
}
