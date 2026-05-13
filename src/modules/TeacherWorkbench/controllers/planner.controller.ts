import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { PlannerService } from '../services/index.js';

function getScopedSchoolId(req: Request): string {
  const user = getUser(req);
  if (user.role === 'super_admin') {
    return String(req.query.schoolId ?? user.schoolId ?? '');
  }
  return String(user.schoolId ?? '');
}

export class PlannerController {
  static async getPlan(req: Request, res: Response): Promise<void> {
    const schoolId = getScopedSchoolId(req);
    const classId = req.params.classId as string;
    const term = parseInt(req.params.term as string, 10);
    const year = parseInt(req.params.year as string, 10);
    const subjectId = req.query.subjectId ? String(req.query.subjectId) : undefined;
    const plan = await PlannerService.getPlan(classId, term, year, schoolId, subjectId);
    res.json(apiResponse(true, plan, 'Assessment plan retrieved'));
  }

  static async createOrUpdatePlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const plan = await PlannerService.createOrUpdatePlan({ ...req.body, schoolId }, user.id);
    res.json(apiResponse(true, plan, 'Assessment plan saved'));
  }

  static async checkClashes(req: Request, res: Response): Promise<void> {
    const schoolId = getScopedSchoolId(req);
    const classId = req.params.classId as string;
    const date = req.params.date as string;
    const clashes = await PlannerService.checkClashes(classId, date, schoolId);
    res.json(apiResponse(true, clashes, 'Clash check complete'));
  }

  static async getWeightings(req: Request, res: Response): Promise<void> {
    const schoolId = getScopedSchoolId(req);
    const classId = req.query.classId ? String(req.query.classId) : undefined;
    const term = req.query.term ? Number(req.query.term) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const weightings = await PlannerService.getWeightings(req.params.subjectId as string, schoolId, {
      classId,
      term,
      year,
    });
    res.json(apiResponse(true, weightings, 'Weightings retrieved'));
  }
}
