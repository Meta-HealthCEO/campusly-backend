import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { ConferenceEventService } from './service-events.js';
import { ConferenceBookingService } from './service-bookings.js';
import { ConferenceWaitlistService } from './service-waitlist.js';
import { ConferenceReportService } from './service-reports.js';
import type {
  CreateEventInput,
  UpdateEventInput,
  ChangeEventStatusInput,
  ListEventsInput,
  SetAvailabilityInput,
  CreateBookingInput,
  ListBookingsInput,
  UpdateBookingStatusInput,
  CancelBookingInput,
  JoinWaitlistInput,
  ListWaitlistInput,
} from './validation.js';

export class ConferenceController {
  // ─── Events ─────────────────────────────────────────────────────────────

  static async createEvent(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateEventInput = req.body;
    const event = await ConferenceEventService.createEvent(
      user.schoolId as string,
      user.id,
      data,
    );
    res.status(201).json(apiResponse(true, event, 'Conference event created successfully'));
  }

  static async listEvents(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const query: ListEventsInput = {
      status: req.query.status as ListEventsInput['status'],
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await ConferenceEventService.listEvents(schoolId as string, query);
    res.json(apiResponse(true, result, 'Conference events listed'));
  }

  static async getEvent(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    const event = await ConferenceEventService.getEvent(id as string, schoolId as string);
    res.json(apiResponse(true, event, 'Conference event retrieved'));
  }

  static async updateEvent(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    const data: UpdateEventInput = req.body;
    const event = await ConferenceEventService.updateEvent(
      id as string,
      schoolId as string,
      data,
    );
    res.json(apiResponse(true, event, 'Conference event updated'));
  }

  static async changeEventStatus(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    const data: ChangeEventStatusInput = req.body;
    const event = await ConferenceEventService.changeEventStatus(
      id as string,
      schoolId as string,
      data,
    );
    res.json(apiResponse(true, event, `Event status changed to ${data.status}`));
  }

  static async deleteEvent(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    await ConferenceEventService.deleteEvent(id as string, schoolId as string);
    res.json(apiResponse(true, null, 'Conference event deleted successfully'));
  }

  // ─── Availability ───────────────────────────────────────────────────────

  static async setAvailability(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { eventId } = req.params;
    const data: SetAvailabilityInput = req.body;
    const availability = await ConferenceEventService.setAvailability(
      eventId as string,
      user.id,
      user.schoolId as string,
      data,
    );
    const slotCount = availability.generatedSlots.length;
    res.json(
      apiResponse(true, availability, `Availability set successfully. ${slotCount} slots generated.`),
    );
  }

  static async getAvailability(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { eventId } = req.params;
    const teacherId = req.query.teacherId as string | undefined;
    const result = await ConferenceEventService.getAvailability(
      eventId as string,
      schoolId as string,
      teacherId,
    );
    res.json(apiResponse(true, result, 'Availability retrieved'));
  }

  // ─── Bookings ───────────────────────────────────────────────────────────

  static async createBooking(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateBookingInput = req.body;
    const booking = await ConferenceBookingService.createBooking(
      user.schoolId as string,
      user.id,
      data,
    );
    res.status(201).json(apiResponse(true, booking, 'Booking confirmed'));
  }

  static async listBookings(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const query: ListBookingsInput = {
      eventId: req.query.eventId as string,
      teacherId: req.query.teacherId as string | undefined,
      parentId: req.query.parentId as string | undefined,
      status: req.query.status as ListBookingsInput['status'],
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await ConferenceBookingService.listBookings(
      user.schoolId as string,
      query,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, result, 'Bookings listed'));
  }

  static async getMySchedule(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const eventId = req.query.eventId as string;
    const bookings = await ConferenceBookingService.getMySchedule(
      user.schoolId as string,
      eventId,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, bookings, 'Schedule retrieved'));
  }

  static async cancelBooking(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { id } = req.params;
    const data: CancelBookingInput = req.body ?? {};
    const booking = await ConferenceBookingService.cancelBooking(
      id as string,
      user.schoolId as string,
      user.id,
      user.role,
      data,
    );
    res.json(apiResponse(true, booking, 'Booking cancelled'));
  }

  static async updateBookingStatus(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { id } = req.params;
    const data: UpdateBookingStatusInput = req.body;
    const booking = await ConferenceBookingService.updateBookingStatus(
      id as string,
      user.schoolId as string,
      user.id,
      user.role,
      data,
    );
    res.json(apiResponse(true, booking, `Booking marked as ${data.status}`));
  }

  // ─── Waitlist ───────────────────────────────────────────────────────────

  static async joinWaitlist(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: JoinWaitlistInput = req.body;
    const entry = await ConferenceWaitlistService.joinWaitlist(
      user.schoolId as string,
      user.id,
      data,
    );
    res.status(201).json(
      apiResponse(true, entry, `Added to waitlist (position ${entry.position})`),
    );
  }

  static async listWaitlist(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const query: ListWaitlistInput = {
      eventId: req.query.eventId as string,
      teacherId: req.query.teacherId as string | undefined,
    };
    const entries = await ConferenceWaitlistService.listWaitlist(
      user.schoolId as string,
      query,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, entries, 'Waitlist retrieved'));
  }

  static async removeFromWaitlist(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { id } = req.params;
    await ConferenceWaitlistService.removeFromWaitlist(
      id as string,
      user.schoolId as string,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, null, 'Removed from waitlist'));
  }

  // ─── Reports ────────────────────────────────────────────────────────────

  static async getEventReport(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { eventId } = req.params;
    const report = await ConferenceReportService.getEventReport(
      eventId as string,
      schoolId as string,
    );
    res.json(apiResponse(true, report, 'Event report retrieved'));
  }
}
