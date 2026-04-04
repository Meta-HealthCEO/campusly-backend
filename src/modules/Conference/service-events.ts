import crypto from 'node:crypto';
import { ConferenceEvent, ConferenceTeacherAvailability } from './model.js';
import type { IAvailabilityWindow, ITimeSlot } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import type {
  CreateEventInput,
  UpdateEventInput,
  ChangeEventStatusInput,
  ListEventsInput,
  SetAvailabilityInput,
} from './validation.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse "HH:MM" to total minutes since midnight. */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Convert total minutes to "HH:MM". */
function minutesToTime(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/** Generate time slots from availability windows. */
export function generateSlots(
  windows: IAvailabilityWindow[],
  slotDuration: number,
  breakBetween: number,
  maxSlots: number | null,
): ITimeSlot[] {
  const slots: ITimeSlot[] = [];

  for (const window of windows) {
    const windowStart = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);
    let current = windowStart;

    while (current + slotDuration <= windowEnd) {
      if (maxSlots !== null && slots.length >= maxSlots) break;

      slots.push({
        slotId: crypto.randomUUID(),
        startTime: minutesToTime(current),
        endTime: minutesToTime(current + slotDuration),
        status: 'available',
        location: window.location ?? null,
      });

      current += slotDuration + breakBetween;
    }

    if (maxSlots !== null && slots.length >= maxSlots) break;
  }

  return slots;
}

// ─── Valid Status Transitions ─────────────────────────────────────────────────

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['published'],
  published: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
};

// ─── Event Service ────────────────────────────────────────────────────────────

export class ConferenceEventService {
  static async createEvent(schoolId: string, userId: string, data: CreateEventInput) {
    const event = await ConferenceEvent.create({
      schoolId,
      title: data.title,
      description: data.description ?? null,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      venue: data.venue ?? null,
      slotDurationMinutes: data.slotDurationMinutes,
      breakBetweenMinutes: data.breakBetweenMinutes,
      maxSlotsPerTeacher: data.maxSlotsPerTeacher ?? null,
      maxBookingsPerParent: data.maxBookingsPerParent ?? null,
      allowWaitlist: data.allowWaitlist,
      bookingOpensAt: data.bookingOpensAt ? new Date(data.bookingOpensAt) : null,
      bookingClosesAt: data.bookingClosesAt ? new Date(data.bookingClosesAt) : null,
      participatingTeacherIds: data.participatingTeacherIds ?? [],
      createdBy: userId,
    });

    logger.info({ eventId: event._id, schoolId }, 'Conference event created');
    return event.toObject();
  }

  static async listEvents(schoolId: string, query: ListEventsInput) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.status) filter.status = query.status;

    const [events, total] = await Promise.all([
      ConferenceEvent.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ConferenceEvent.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { events, total, page: query.page ?? 1, limit, totalPages };
  }

  static async getEvent(id: string, schoolId: string) {
    const event = await ConferenceEvent.findOne({ _id: id, schoolId, isDeleted: false }).lean();
    if (!event) throw new NotFoundError('Conference event not found');
    return event;
  }

  static async updateEvent(id: string, schoolId: string, data: UpdateEventInput) {
    const event = await ConferenceEvent.findOne({ _id: id, schoolId, isDeleted: false });
    if (!event) throw new NotFoundError('Conference event not found');

    if (event.status !== 'draft' && event.status !== 'published') {
      throw new BadRequestError('Can only edit events in draft or published status');
    }

    const updates: Record<string, unknown> = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.date !== undefined) updates.date = new Date(data.date);
    if (data.startTime !== undefined) updates.startTime = data.startTime;
    if (data.endTime !== undefined) updates.endTime = data.endTime;
    if (data.venue !== undefined) updates.venue = data.venue;
    if (data.slotDurationMinutes !== undefined) updates.slotDurationMinutes = data.slotDurationMinutes;
    if (data.breakBetweenMinutes !== undefined) updates.breakBetweenMinutes = data.breakBetweenMinutes;
    if (data.maxSlotsPerTeacher !== undefined) updates.maxSlotsPerTeacher = data.maxSlotsPerTeacher;
    if (data.maxBookingsPerParent !== undefined) updates.maxBookingsPerParent = data.maxBookingsPerParent;
    if (data.allowWaitlist !== undefined) updates.allowWaitlist = data.allowWaitlist;
    if (data.bookingOpensAt !== undefined) {
      updates.bookingOpensAt = data.bookingOpensAt ? new Date(data.bookingOpensAt) : null;
    }
    if (data.bookingClosesAt !== undefined) {
      updates.bookingClosesAt = data.bookingClosesAt ? new Date(data.bookingClosesAt) : null;
    }
    if (data.participatingTeacherIds !== undefined) {
      updates.participatingTeacherIds = data.participatingTeacherIds;
    }

    const updated = await ConferenceEvent.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: updates },
      { new: true },
    ).lean();

    return updated;
  }

  static async changeEventStatus(
    id: string,
    schoolId: string,
    data: ChangeEventStatusInput,
  ) {
    const event = await ConferenceEvent.findOne({ _id: id, schoolId, isDeleted: false });
    if (!event) throw new NotFoundError('Conference event not found');

    const allowed = STATUS_TRANSITIONS[event.status];
    if (!allowed || !allowed.includes(data.status)) {
      throw new BadRequestError(
        `Cannot transition from '${event.status}' to '${data.status}'`,
      );
    }

    event.status = data.status;
    await event.save();

    logger.info({ eventId: id, status: data.status }, 'Conference event status changed');
    return event.toObject();
  }

  static async deleteEvent(id: string, schoolId: string) {
    const event = await ConferenceEvent.findOne({ _id: id, schoolId, isDeleted: false });
    if (!event) throw new NotFoundError('Conference event not found');

    if (event.status !== 'draft') {
      throw new BadRequestError('Can only delete events in draft status');
    }

    event.isDeleted = true;
    await event.save();

    logger.info({ eventId: id }, 'Conference event deleted');
  }

  // ─── Teacher Availability ─────────────────────────────────────────────────

  static async setAvailability(
    eventId: string,
    teacherId: string,
    schoolId: string,
    data: SetAvailabilityInput,
  ) {
    const event = await ConferenceEvent.findOne({
      _id: eventId,
      schoolId,
      isDeleted: false,
    }).lean();
    if (!event) throw new NotFoundError('Conference event not found');

    if (event.status !== 'draft' && event.status !== 'published') {
      throw new BadRequestError('Cannot set availability for this event status');
    }

    // Validate windows are within event bounds
    const eventStart = timeToMinutes(event.startTime);
    const eventEnd = timeToMinutes(event.endTime);

    for (const win of data.windows) {
      const wStart = timeToMinutes(win.startTime);
      const wEnd = timeToMinutes(win.endTime);
      if (wStart < eventStart || wEnd > eventEnd) {
        throw new BadRequestError(
          `Window ${win.startTime}-${win.endTime} is outside event time ${event.startTime}-${event.endTime}`,
        );
      }
      if (wStart >= wEnd) {
        throw new BadRequestError(`Window start must be before end: ${win.startTime}-${win.endTime}`);
      }
    }

    // Check for overlapping windows
    const sorted = [...data.windows].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev && curr && timeToMinutes(curr.startTime) < timeToMinutes(prev.endTime)) {
        throw new BadRequestError('Availability windows must not overlap');
      }
    }

    const windows: IAvailabilityWindow[] = data.windows.map((w) => ({
      startTime: w.startTime,
      endTime: w.endTime,
      location: w.location ?? null,
    }));

    const slots = generateSlots(
      windows,
      event.slotDurationMinutes,
      event.breakBetweenMinutes,
      event.maxSlotsPerTeacher,
    );

    const availability = await ConferenceTeacherAvailability.findOneAndUpdate(
      { eventId, teacherId, schoolId },
      {
        $set: { windows, generatedSlots: slots, isDeleted: false },
        $setOnInsert: { eventId, teacherId, schoolId },
      },
      { upsert: true, new: true },
    ).lean();

    logger.info(
      { eventId, teacherId, slotCount: slots.length },
      'Teacher availability set',
    );

    return availability;
  }

  static async getAvailability(eventId: string, schoolId: string, teacherId?: string) {
    const filter: Record<string, unknown> = { eventId, schoolId, isDeleted: false };
    if (teacherId) filter.teacherId = teacherId;

    const availabilities = await ConferenceTeacherAvailability.find(filter)
      .populate('teacherId', 'firstName lastName email')
      .lean();

    return availabilities.map((a) => {
      const totalSlots = a.generatedSlots.length;
      const bookedSlots = a.generatedSlots.filter((s) => s.status === 'booked').length;
      return {
        ...a,
        totalSlots,
        bookedSlots,
        availableSlots: totalSlots - bookedSlots,
      };
    });
  }
}
