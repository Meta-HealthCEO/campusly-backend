import { Request, Response } from 'express';
import { EventService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class EventController {
  // ─── Event CRUD ───────────────────────────────────────────────────────────

  static async create(req: Request, res: Response): Promise<void> {
    const event = await EventService.create(req.body, req.user!.id);
    res.status(201).json(apiResponse(true, event, 'Event created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      eventType: req.query.eventType as string | undefined,
    };

    const result = await EventService.list(query);
    res.json(apiResponse(true, result, 'Events retrieved successfully'));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const event = await EventService.getById(req.params.id as string);
    res.json(apiResponse(true, event, 'Event retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const event = await EventService.update(req.params.id as string, req.body);
    res.json(apiResponse(true, event, 'Event updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    await EventService.delete(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Event deleted successfully'));
  }

  // ─── RSVP ────────────────────────────────────────────────────────────────

  static async createRsvp(req: Request, res: Response): Promise<void> {
    const rsvp = await EventService.createRsvp(req.body, req.user!.id);
    res.status(201).json(apiResponse(true, rsvp, 'RSVP submitted successfully'));
  }

  static async updateRsvp(req: Request, res: Response): Promise<void> {
    const rsvp = await EventService.updateRsvp(
      req.params.eventId as string,
      req.user!.id,
      req.body,
    );
    res.json(apiResponse(true, rsvp, 'RSVP updated successfully'));
  }

  static async getEventRsvps(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await EventService.getEventRsvps(req.params.eventId as string, query);
    res.json(apiResponse(true, result, 'RSVPs retrieved successfully'));
  }

  static async deleteRsvp(req: Request, res: Response): Promise<void> {
    await EventService.deleteRsvp(req.params.eventId as string, req.user!.id);
    res.json(apiResponse(true, undefined, 'RSVP deleted successfully'));
  }
}
