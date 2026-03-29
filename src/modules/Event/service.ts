import { Event, IEvent, EventRsvp, IEventRsvp } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateEventInput, UpdateEventInput, CreateRsvpInput, UpdateRsvpInput } from './validation.js';

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
      { $set: { status: data.status, notes: data.notes } },
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
}
