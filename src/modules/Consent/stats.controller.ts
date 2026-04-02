import type { Request } from 'express';
import { Response } from 'express';
import { ConsentStatsService } from './stats.service.js';
import { apiResponse } from '../../common/utils.js';

export class ConsentStatsController {
  static async getCompletionStats(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const stats = await ConsentStatsService.getCompletionStats(
      schoolId,
      req.params.id as string,
    );
    res.json(apiResponse(true, stats, 'Completion stats retrieved successfully'));
  }

  static async getPendingParents(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const pending = await ConsentStatsService.getPendingParents(
      schoolId,
      req.params.id as string,
    );
    res.json(apiResponse(true, pending, 'Pending parents retrieved successfully'));
  }

  static async exportSignedForm(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const formId = req.query.formId as string;
    const responseId = req.params.id as string;

    const text = await ConsentStatsService.exportSignedForm(
      schoolId,
      formId,
      responseId,
    );

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="consent-response-${responseId}.txt"`,
    );
    res.send(text);
  }
}
