import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { ModerationService } from '../services/index.js';

export class ModerationController {
  private static requireSchoolId(req: Request, res: Response): string | null {
    const user = getUser(req);
    if (!user.schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return null;
    }
    return user.schoolId;
  }

  static async submitForModeration(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = ModerationController.requireSchoolId(req, res);
    if (!schoolId) return;
    const moderation = await ModerationService.submitForModeration(
      req.params.paperId as string,
      user.id,
      schoolId,
    );
    res.status(201).json(apiResponse(true, moderation, 'Paper submitted for moderation'));
  }

  static async getModerationQueue(req: Request, res: Response): Promise<void> {
    const schoolId = ModerationController.requireSchoolId(req, res);
    if (!schoolId) return;
    const queue = await ModerationService.getModerationQueue(schoolId);
    res.json(apiResponse(true, queue, 'Moderation queue retrieved'));
  }

  static async getModerationStatus(req: Request, res: Response): Promise<void> {
    const schoolId = ModerationController.requireSchoolId(req, res);
    if (!schoolId) return;
    const moderation = await ModerationService.getModerationStatus(
      req.params.paperId as string,
      schoolId,
    );
    res.json(apiResponse(true, moderation, 'Moderation status retrieved'));
  }

  static async reviewPaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = ModerationController.requireSchoolId(req, res);
    if (!schoolId) return;
    const { status, comments } = req.body as { status: string; comments: string };
    const moderation = await ModerationService.reviewPaper(
      req.params.paperId as string,
      user.id,
      status,
      comments ?? '',
      schoolId,
    );
    res.json(apiResponse(true, moderation, 'Review submitted'));
  }
}
