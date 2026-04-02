import type { Request, Response, NextFunction } from 'express';
import { TranscriptService } from './transcript.service.js';
import { apiResponse } from '../../common/utils.js';

export class TranscriptController {
  static async getTranscript(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user!.schoolId! as string;
      const studentId = req.params.id as string;

      const transcript = await TranscriptService.generateTranscript(schoolId, studentId);
      res.json(apiResponse(true, transcript, 'Transcript generated successfully'));
    } catch (err: unknown) {
      next(err);
    }
  }
}
