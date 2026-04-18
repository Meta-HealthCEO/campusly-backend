import type { Request, Response } from 'express';
import { WebhookReceiver } from 'livekit-server-sdk';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import { RecordingService } from './service-recording.js';

export class RecordingController {
  static async startRecording(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await RecordingService.startRecording(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, undefined, 'Recording started'));
  }

  static async stopRecording(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await RecordingService.stopRecording(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, undefined, 'Recording stopped'));
  }

  static async handleEgressWebhook(req: Request, res: Response): Promise<void> {
    try {
      const receiver = new WebhookReceiver(
        process.env.LIVEKIT_API_KEY ?? '',
        process.env.LIVEKIT_API_SECRET ?? '',
      );

      const rawBody = Buffer.isBuffer(req.body)
        ? req.body.toString('utf-8')
        : typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body);

      const authHeader = req.get('Authorization');
      const event = await receiver.receive(rawBody, authHeader);

      if (event.event === 'egress_ended' && event.egressInfo) {
        const egressId = event.egressInfo.egressId;
        const fileResults = event.egressInfo.fileResults ?? [];
        const recordingUrl = fileResults[0]?.location;

        if (egressId && recordingUrl) {
          await RecordingService.handleEgressWebhook(egressId, recordingUrl);
        } else {
          logger.warn(
            `[RecordingController] Egress ended without file location (egressId=${egressId})`,
          );
        }
      }

      res.status(200).json({ received: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`[RecordingController] Webhook processing failed: ${message}`);
      res.status(400).json({ success: false, error: 'Webhook verification failed' });
    }
  }

  static async getLessonNotes(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const note = await RecordingService.getLessonNote(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, note));
  }

  static async getClassLessonNotes(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const notes = await RecordingService.getClassLessonNotes(
      req.params.classId as string,
      user.schoolId!,
    );
    res.json(apiResponse(true, notes));
  }

  static async retryLessonNotes(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await RecordingService.retryLessonNotes(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, undefined, 'Lesson notes retry queued'));
  }
}
