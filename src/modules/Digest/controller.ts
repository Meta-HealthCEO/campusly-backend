import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { DigestService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class DigestController {
  static async getPreferences(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const prefs = await DigestService.getPreferences(user.id, schoolId);
    res.json(apiResponse(true, prefs, 'Preferences retrieved successfully'));
  }

  static async updatePreferences(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const prefs = await DigestService.updatePreferences(user.id, schoolId, req.body);
    res.json(apiResponse(true, prefs, 'Preferences updated successfully'));
  }

  static async previewMorningDigest(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.query.studentId as string;
    if (!studentId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'studentId query param is required'));
      return;
    }
    const digest = await DigestService.generateMorningDigest(schoolId, studentId);
    res.json(apiResponse(true, digest, 'Morning digest generated'));
  }

  static async previewEveningDigest(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.query.studentId as string;
    if (!studentId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'studentId query param is required'));
      return;
    }
    const digest = await DigestService.generateEveningDigest(schoolId, studentId);
    res.json(apiResponse(true, digest, 'Evening digest generated'));
  }

  static async previewWeeklyDigest(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.query.studentId as string;
    if (!studentId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'studentId query param is required'));
      return;
    }
    const digest = await DigestService.generateWeeklyDigest(schoolId, studentId);
    res.json(apiResponse(true, digest, 'Weekly digest generated'));
  }
}
