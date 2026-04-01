import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { PlannerService } from '../services/index.js';

export class PlannerController {
  static async getPlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const classId = req.params.classId as string;
    const term = parseInt(req.params.term as string, 10);
    const year = parseInt(req.params.year as string, 10);
    const plan = await PlannerService.getPlan(classId, term, year, schoolId);
    res.json(apiResponse(true, plan, 'Assessment plan retrieved'));
  }

  static async createOrUpdatePlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const plan = await PlannerService.createOrUpdatePlan(req.body, user.id);
    res.json(apiResponse(true, plan, 'Assessment plan saved'));
  }

  static async checkClashes(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const classId = req.params.classId as string;
    const date = req.params.date as string;
    const clashes = await PlannerService.checkClashes(classId, date, schoolId);
    res.json(apiResponse(true, clashes, 'Clash check complete'));
  }

  static async getWeightings(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const weightings = await PlannerService.getWeightings(req.params.subjectId as string, schoolId);
    res.json(apiResponse(true, weightings, 'Weightings retrieved'));
  }
}
