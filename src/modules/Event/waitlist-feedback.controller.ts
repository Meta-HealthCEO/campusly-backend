import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { EventWaitlistFeedbackService } from './waitlist-feedback.service.js';
import { apiResponse } from '../../common/utils.js';

export class EventWaitlistFeedbackController {
  // ─── Waitlist ──────────────────────────────────────────────────────────────

  static async joinWaitlist(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = getUser(req).id;
    const entry = await EventWaitlistFeedbackService.joinWaitlist(
      userId,
      schoolId,
      { ...req.body, eventId: req.params.eventId },
    );
    res.status(201).json(apiResponse(true, entry, 'Joined waitlist successfully'));
  }

  static async getWaitlist(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const entries = await EventWaitlistFeedbackService.getWaitlist(
      schoolId,
      req.params.eventId as string,
    );
    res.json(apiResponse(true, entries, 'Waitlist retrieved successfully'));
  }

  static async processWaitlist(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const offered = await EventWaitlistFeedbackService.processWaitlist(
      schoolId,
      req.params.eventId as string,
    );
    res.json(apiResponse(true, offered, 'Waitlist processed successfully'));
  }

  // ─── Feedback ──────────────────────────────────────────────────────────────

  static async submitFeedback(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = getUser(req).id;
    const feedback = await EventWaitlistFeedbackService.submitFeedback(
      userId,
      schoolId,
      { ...req.body, eventId: req.params.eventId },
    );
    res.status(201).json(apiResponse(true, feedback, 'Feedback submitted successfully'));
  }

  static async getEventFeedback(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await EventWaitlistFeedbackService.getEventFeedback(
      schoolId,
      req.params.eventId as string,
    );
    res.json(apiResponse(true, result, 'Feedback retrieved successfully'));
  }

  // ─── iCal ──────────────────────────────────────────────────────────────────

  static async generateICal(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const ical = await EventWaitlistFeedbackService.generateICal(
      schoolId,
      req.params.eventId as string,
    );

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="event-${req.params.eventId}.ics"`,
    );
    res.send(ical);
  }
}
