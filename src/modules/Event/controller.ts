import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { EventService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class EventController {
  // ─── Event CRUD ───────────────────────────────────────────────────────────

  static async create(req: Request, res: Response): Promise<void> {
    const event = await EventService.create(req.body, getUser(req).id);
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
    const schoolId = req.user!.schoolId!;
    const event = await EventService.getById(req.params.id as string, schoolId);
    res.json(apiResponse(true, event, 'Event retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const event = await EventService.update(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, event, 'Event updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await EventService.delete(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Event deleted successfully'));
  }

  // ─── RSVP ────────────────────────────────────────────────────────────────

  static async createRsvp(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const rsvp = await EventService.createRsvp(req.body, getUser(req).id, schoolId);
    res.status(201).json(apiResponse(true, rsvp, 'RSVP submitted successfully'));
  }

  static async updateRsvp(req: Request, res: Response): Promise<void> {
    const rsvp = await EventService.updateRsvp(
      req.params.eventId as string,
      getUser(req).id,
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
    const schoolId = req.user!.schoolId!;
    await EventService.deleteRsvp(req.params.eventId as string, getUser(req).id, schoolId);
    res.json(apiResponse(true, undefined, 'RSVP deleted successfully'));
  }

  // ─── Tickets ──────────────────────────────────────────────────────────────

  static async purchaseTicket(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const ticket = await EventService.purchaseTicket(
      req.params.eventId as string,
      getUser(req).id,
      req.body,
      schoolId,
    );
    res.status(201).json(apiResponse(true, ticket, 'Ticket purchased successfully'));
  }

  static async listTicketsByEvent(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await EventService.listTicketsByEvent(req.params.eventId as string, query);
    res.json(apiResponse(true, result, 'Tickets retrieved successfully'));
  }

  static async getTicketByQrCode(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const ticket = await EventService.getTicketByQrCode(req.params.qrCode as string, schoolId);
    res.json(apiResponse(true, ticket, 'Ticket retrieved successfully'));
  }

  static async cancelTicket(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const ticket = await EventService.cancelTicket(
      req.params.eventId as string,
      req.params.ticketId as string,
      schoolId,
    );
    res.json(apiResponse(true, ticket, 'Ticket cancelled successfully'));
  }

  // ─── Seats ────────────────────────────────────────────────────────────────

  static async createSeats(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const seats = await EventService.createSeats(req.params.eventId as string, req.body, schoolId);
    res.status(201).json(apiResponse(true, seats, 'Seats created successfully'));
  }

  static async listSeatsByEvent(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await EventService.listSeatsByEvent(req.params.eventId as string, query);
    res.json(apiResponse(true, result, 'Seats retrieved successfully'));
  }

  static async reserveSeat(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const seat = await EventService.reserveSeat(
      req.params.eventId as string,
      req.params.seatId as string,
      req.body.ticketId,
      schoolId,
    );
    res.json(apiResponse(true, seat, 'Seat reserved successfully'));
  }

  static async releaseSeat(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const seat = await EventService.releaseSeat(
      req.params.eventId as string,
      req.params.seatId as string,
      schoolId,
    );
    res.json(apiResponse(true, seat, 'Seat released successfully'));
  }

  // ─── Check-In ─────────────────────────────────────────────────────────────

  static async checkIn(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const checkIn = await EventService.checkIn(
      req.params.eventId as string,
      req.body,
      getUser(req).id,
      schoolId,
    );
    res.status(201).json(apiResponse(true, checkIn, 'Check-in successful'));
  }

  static async listCheckInsByEvent(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await EventService.listCheckInsByEvent(req.params.eventId as string, query);
    res.json(apiResponse(true, result, 'Check-ins retrieved successfully'));
  }

  static async checkInStats(req: Request, res: Response): Promise<void> {
    const stats = await EventService.checkInStats(req.params.eventId as string);
    res.json(apiResponse(true, stats, 'Check-in stats retrieved successfully'));
  }

  // ─── Gallery ──────────────────────────────────────────────────────────────

  static async uploadGalleryImage(req: Request, res: Response): Promise<void> {
    const image = await EventService.uploadGalleryImage(
      req.params.eventId as string,
      getUser(req).id,
      req.body,
    );
    res.status(201).json(apiResponse(true, image, 'Gallery image uploaded successfully'));
  }

  static async listGalleryByEvent(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await EventService.listGalleryByEvent(req.params.eventId as string, query);
    res.json(apiResponse(true, result, 'Gallery images retrieved successfully'));
  }

  static async deleteGalleryImage(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await EventService.deleteGalleryImage(
      req.params.eventId as string,
      req.params.imageId as string,
      schoolId,
    );
    res.json(apiResponse(true, undefined, 'Gallery image deleted successfully'));
  }
}
