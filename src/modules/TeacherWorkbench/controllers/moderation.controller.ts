import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { ModerationService } from '../services/index.js';

export class ModerationController {
  static async submitForModeration(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const moderation = await ModerationService.submitForModeration(
      req.params.paperId as string,
      user.id,
      schoolId,
    );
    res.status(201).json(apiResponse(true, moderation, 'Paper submitted for moderation'));
  }

  static async getModerationQueue(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const queue = await ModerationService.getModerationQueue(schoolId);
    res.json(apiResponse(true, queue, 'Moderation queue retrieved'));
  }

  static async getModerationStatus(req: Request, res: Response): Promise<void> {
    const moderation = await ModerationService.getModerationStatus(req.params.paperId as string);
    res.json(apiResponse(true, moderation, 'Moderation status retrieved'));
  }

  static async reviewPaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { status, comments } = req.body as { status: string; comments: string };
    const moderation = await ModerationService.reviewPaper(
      req.params.paperId as string,
      user.id,
      status,
      comments ?? '',
    );
    res.json(apiResponse(true, moderation, 'Review submitted'));
  }
}
