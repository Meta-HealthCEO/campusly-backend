import { v4 as uuidv4 } from 'uuid';
import {
  Event, IEvent,
  EventRsvp, IEventRsvp,
  EventTicket, IEventTicket,
  EventSeat, IEventSeat,
  EventCheckIn, IEventCheckIn,
  EventGallery, IEventGallery,
} from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateEventInput, UpdateEventInput,
  CreateRsvpInput, UpdateRsvpInput,
  PurchaseTicketInput, CreateSeatsInput,
  ReserveSeatInput, CheckInInput,
  UploadGalleryInput,
} from './validation.js';

interface ListEventQuery {
  page?: number;
  limit?: number;
  sort?: string;
  schoolId?: string;
  eventType?: string;
}

interface ListRsvpQuery {
  page?: number;
  limit?: number;
}

interface PaginatedQuery {
  page?: number;
  limit?: number;
}

export class EventService {
  // ─── Event CRUD ───────────────────────────────────────────────────────────

  static async create(data: CreateEventInput, organizerId: string): Promise<IEvent> {
    const event = await Event.create({
      ...data,
      organizerId,
    });

    return event;
  }

  static async list(
    query: ListEventQuery,
  ): Promise<{
    events: IEvent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);
    const sortField = query.sort ?? '-date';

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.eventType) {
      filter.eventType = query.eventType;
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizerId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter),
    ]);

    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: string): Promise<IEvent> {
    const event = await Event.findOne({ _id: id, isDeleted: false })
      .populate('organizerId', 'firstName lastName email');

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return event;
  }

  static async update(id: string, data: UpdateEventInput): Promise<IEvent> {
    const event = await Event.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('organizerId', 'firstName lastName email');

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return event;
  }

  static async delete(id: string): Promise<IEvent> {
    const event = await Event.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return event;
  }

  // ─── RSVP ────────────────────────────────────────────────────────────────

  static async createRsvp(data: CreateRsvpInput, userId: string): Promise<IEventRsvp> {
    const event = await Event.findOne({ _id: data.eventId, isDeleted: false });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const rsvp = await EventRsvp.findOneAndUpdate(
      { eventId: data.eventId, userId, isDeleted: false },
      { $set: { status: data.status, notes: data.notes, headcount: data.headcount ?? 1 } },
      { new: true, upsert: true, runValidators: true },
    ).populate('userId', 'firstName lastName email');

    return rsvp!;
  }

  static async updateRsvp(eventId: string, userId: string, data: UpdateRsvpInput): Promise<IEventRsvp> {
    const rsvp = await EventRsvp.findOneAndUpdate(
      { eventId, userId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('userId', 'firstName lastName email');

    if (!rsvp) {
      throw new NotFoundError('RSVP not found');
    }

    return rsvp;
  }

  static async getEventRsvps(
    eventId: string,
    query: ListRsvpQuery,
  ): Promise<{
    rsvps: IEventRsvp[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter = { eventId, isDeleted: false };

    const [rsvps, total] = await Promise.all([
      EventRsvp.find(filter)
        .populate('userId', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      EventRsvp.countDocuments(filter),
    ]);

    return {
      rsvps,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async deleteRsvp(eventId: string, userId: string): Promise<IEventRsvp> {
    const rsvp = await EventRsvp.findOneAndUpdate(
      { eventId, userId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!rsvp) {
      throw new NotFoundError('RSVP not found');
    }

    return rsvp;
  }

  // ─── Tickets ──────────────────────────────────────────────────────────────

  static async purchaseTicket(
    eventId: string,
    userId: string,
    data: PurchaseTicketInput,
  ): Promise<IEventTicket> {
    const event = await Event.findOne({ _id: eventId, isDeleted: false });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const ticket = await EventTicket.create({
      eventId,
      schoolId: data.schoolId,
      userId,
      ticketType: data.ticketType ?? 'standard',
      price: data.price ?? event.ticketPrice ?? 0,
      qrCode: uuidv4(),
    });

    return ticket;
  }

  static async listTicketsByEvent(
    eventId: string,
    query: PaginatedQuery,
  ): Promise<{
    tickets: IEventTicket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter = { eventId, isDeleted: false };

    const [tickets, total] = await Promise.all([
      EventTicket.find(filter)
        .populate('userId', 'firstName lastName email')
        .sort('-purchasedAt')
        .skip(skip)
        .limit(limit),
      EventTicket.countDocuments(filter),
    ]);

    return {
      tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getTicketByQrCode(qrCode: string): Promise<IEventTicket> {
    const ticket = await EventTicket.findOne({ qrCode, isDeleted: false })
      .populate('eventId', 'title date venue')
      .populate('userId', 'firstName lastName email');

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    return ticket;
  }

  static async cancelTicket(eventId: string, ticketId: string): Promise<IEventTicket> {
    const ticket = await EventTicket.findOneAndUpdate(
      { _id: ticketId, eventId, isDeleted: false, status: 'active' },
      { $set: { status: 'cancelled' } },
      { new: true },
    );

    if (!ticket) {
      throw new NotFoundError('Ticket not found or already cancelled/used');
    }

    return ticket;
  }

  // ─── Seats ────────────────────────────────────────────────────────────────

  static async createSeats(
    eventId: string,
    data: CreateSeatsInput,
  ): Promise<IEventSeat[]> {
    const event = await Event.findOne({ _id: eventId, isDeleted: false });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const seatDocs = data.seats.map((seat) => ({
      eventId,
      row: seat.row,
      seatNumber: seat.seatNumber,
      label: seat.label,
      status: 'available' as const,
    }));

    const seats = await EventSeat.insertMany(seatDocs);
    return seats as unknown as IEventSeat[];
  }

  static async listSeatsByEvent(
    eventId: string,
    query: PaginatedQuery,
  ): Promise<{
    seats: IEventSeat[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter = { eventId, isDeleted: false };

    const [seats, total] = await Promise.all([
      EventSeat.find(filter)
        .populate('ticketId')
        .sort({ row: 1, seatNumber: 1 })
        .skip(skip)
        .limit(limit),
      EventSeat.countDocuments(filter),
    ]);

    return {
      seats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async reserveSeat(
    eventId: string,
    seatId: string,
    ticketId: string,
  ): Promise<IEventSeat> {
    const seat = await EventSeat.findOneAndUpdate(
      { _id: seatId, eventId, isDeleted: false, status: 'available' },
      { $set: { status: 'reserved', ticketId } },
      { new: true },
    );

    if (!seat) {
      throw new NotFoundError('Seat not found or not available');
    }

    return seat;
  }

  static async releaseSeat(
    eventId: string,
    seatId: string,
  ): Promise<IEventSeat> {
    const seat = await EventSeat.findOneAndUpdate(
      { _id: seatId, eventId, isDeleted: false, status: { $in: ['reserved', 'sold'] } },
      { $set: { status: 'available', ticketId: undefined } },
      { new: true },
    );

    if (!seat) {
      throw new NotFoundError('Seat not found or already available');
    }

    return seat;
  }

  // ─── Check-In ─────────────────────────────────────────────────────────────

  static async checkIn(
    eventId: string,
    data: CheckInInput,
    checkedInBy: string,
  ): Promise<IEventCheckIn> {
    const ticket = await EventTicket.findOne({
      qrCode: data.qrCode,
      eventId,
      isDeleted: false,
    });

    if (!ticket) {
      throw new NotFoundError('Ticket not found for this event');
    }

    if (ticket.status === 'used') {
      throw new BadRequestError('Ticket has already been used');
    }

    if (ticket.status === 'cancelled') {
      throw new BadRequestError('Ticket has been cancelled');
    }

    // Mark ticket as used
    ticket.status = 'used';
    await ticket.save();

    // Create check-in record
    const checkIn = await EventCheckIn.create({
      eventId,
      ticketId: ticket._id,
      checkedInBy,
    });

    return checkIn;
  }

  static async listCheckInsByEvent(
    eventId: string,
    query: PaginatedQuery,
  ): Promise<{
    checkIns: IEventCheckIn[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter = { eventId, isDeleted: false };

    const [checkIns, total] = await Promise.all([
      EventCheckIn.find(filter)
        .populate('ticketId')
        .populate('checkedInBy', 'firstName lastName email')
        .sort('-checkedInAt')
        .skip(skip)
        .limit(limit),
      EventCheckIn.countDocuments(filter),
    ]);

    return {
      checkIns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async checkInStats(
    eventId: string,
  ): Promise<{
    totalTickets: number;
    checkedIn: number;
    activeTickets: number;
    cancelledTickets: number;
  }> {
    const [totalTickets, checkedIn, activeTickets, cancelledTickets] = await Promise.all([
      EventTicket.countDocuments({ eventId, isDeleted: false }),
      EventCheckIn.countDocuments({ eventId, isDeleted: false }),
      EventTicket.countDocuments({ eventId, isDeleted: false, status: 'active' }),
      EventTicket.countDocuments({ eventId, isDeleted: false, status: 'cancelled' }),
    ]);

    return {
      totalTickets,
      checkedIn,
      activeTickets,
      cancelledTickets,
    };
  }

  // ─── Gallery ──────────────────────────────────────────────────────────────

  static async uploadGalleryImage(
    eventId: string,
    uploadedBy: string,
    data: UploadGalleryInput,
  ): Promise<IEventGallery> {
    const event = await Event.findOne({ _id: eventId, isDeleted: false });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const image = await EventGallery.create({
      eventId,
      schoolId: data.schoolId,
      imageUrl: data.imageUrl,
      caption: data.caption,
      uploadedBy,
    });

    return image;
  }

  static async listGalleryByEvent(
    eventId: string,
    query: PaginatedQuery,
  ): Promise<{
    images: IEventGallery[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter = { eventId, isDeleted: false };

    const [images, total] = await Promise.all([
      EventGallery.find(filter)
        .populate('uploadedBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      EventGallery.countDocuments(filter),
    ]);

    return {
      images,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async deleteGalleryImage(eventId: string, imageId: string): Promise<IEventGallery> {
    const image = await EventGallery.findOneAndUpdate(
      { _id: imageId, eventId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!image) {
      throw new NotFoundError('Gallery image not found');
    }

    return image;
  }
}
