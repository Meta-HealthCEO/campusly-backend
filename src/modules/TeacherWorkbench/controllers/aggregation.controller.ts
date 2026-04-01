import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { AggregationService } from '../services/index.js';

export class AggregationController {
  static async getDashboard(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const dashboard = await AggregationService.getDashboard(user.id, schoolId);
    res.json(apiResponse(true, dashboard, 'Dashboard retrieved'));
  }

  static async getPendingMarking(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const items = await AggregationService.getPendingMarking(user.id, schoolId);
    res.json(apiResponse(true, items, 'Pending marking items retrieved'));
  }

  static async getStudent360(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const data = await AggregationService.getStudent360(req.params.studentId as string, schoolId);
    res.json(apiResponse(true, data, 'Student 360 data retrieved'));
  }
}
