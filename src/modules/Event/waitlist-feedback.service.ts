import { Event } from './model.js';
import {
  EventWaitlist, IEventWaitlist,
  EventFeedback, IEventFeedback,
} from './waitlist-feedback.model.js';
import { EventRsvp } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import type {
  JoinWaitlistInput,
  SubmitFeedbackInput,
} from './waitlist-feedback.validation.js';

export class EventWaitlistFeedbackService {
  // ─── Waitlist ──────────────────────────────────────────────────────────────

  static async joinWaitlist(
    userId: string,
    schoolId: string,
    data: JoinWaitlistInput,
  ): Promise<IEventWaitlist> {
    const event = await Event.findOne({
      _id: data.eventId,
      schoolId,
      isDeleted: false,
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check if already on waitlist
    const existing = await EventWaitlist.findOne({
      eventId: data.eventId,
      parentId: userId,
      isDeleted: false,
    });

    if (existing) {
      throw new BadRequestError('Already on the waitlist for this event');
    }

    // Calculate next position
    const lastEntry = await EventWaitlist.findOne({
      eventId: data.eventId,
      isDeleted: false,
    }).sort({ position: -1 });

    const position = lastEntry ? lastEntry.position + 1 : 1;

    const entry = await EventWaitlist.create({
      schoolId,
      eventId: data.eventId,
      parentId: userId,
      studentId: data.studentId,
      position,
      status: 'waiting',
    });

    return entry;
  }

  static async getWaitlist(
    schoolId: string,
    eventId: string,
  ): Promise<IEventWaitlist[]> {
    const event = await Event.findOne({
      _id: eventId,
      schoolId,
      isDeleted: false,
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const entries = await EventWaitlist.find({
      eventId,
      schoolId,
      isDeleted: false,
    })
      .populate('parentId', 'firstName lastName email')
      .populate('studentId', 'firstName lastName')
      .sort({ position: 1 })
      .lean();

    return entries;
  }

  static async processWaitlist(
    schoolId: string,
    eventId: string,
  ): Promise<IEventWaitlist | null> {
    const event = await Event.findOne({
      _id: eventId,
      schoolId,
      isDeleted: false,
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Expire stale offers
    await EventWaitlist.updateMany(
      {
        eventId,
        schoolId,
        status: 'offered',
        expiresAt: { $lt: new Date() },
        isDeleted: false,
      },
      { $set: { status: 'expired' } },
    );

    // Find the next waiting entry
    const nextEntry = await EventWaitlist.findOneAndUpdate(
      { eventId, schoolId, status: 'waiting', isDeleted: false },
      {
        $set: {
          status: 'offered',
          offeredAt: new Date(),
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
        },
      },
      { new: true, sort: { position: 1 } },
    )
      .populate('parentId', 'firstName lastName email')
      .populate('studentId', 'firstName lastName');

    return nextEntry;
  }

  // ─── Feedback ──────────────────────────────────────────────────────────────

  static async submitFeedback(
    userId: string,
    schoolId: string,
    data: SubmitFeedbackInput,
  ): Promise<IEventFeedback> {
    const event = await Event.findOne({
      _id: data.eventId,
      schoolId,
      isDeleted: false,
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Event must be in the past
    if (new Date(event.date) > new Date()) {
      throw new BadRequestError('Cannot leave feedback before the event date');
    }

    const feedback = await EventFeedback.findOneAndUpdate(
      { eventId: data.eventId, parentId: userId, isDeleted: false },
      {
        $set: {
          schoolId,
          rating: data.rating,
          comment: data.comment,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    return feedback!;
  }

  static async getEventFeedback(
    schoolId: string,
    eventId: string,
  ): Promise<{
    feedback: IEventFeedback[];
    averageRating: number;
    totalReviews: number;
  }> {
    const event = await Event.findOne({
      _id: eventId,
      schoolId,
      isDeleted: false,
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const feedback = await EventFeedback.find({
      eventId,
      isDeleted: false,
    })
      .populate('parentId', 'firstName lastName')
      .sort('-createdAt')
      .lean();

    const totalReviews = feedback.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (feedback.reduce((sum, f) => sum + f.rating, 0) / totalReviews) *
              10,
          ) / 10
        : 0;

    return { feedback, averageRating, totalReviews };
  }

  // ─── iCal ──────────────────────────────────────────────────────────────────

  static async generateICal(
    schoolId: string,
    eventId: string,
  ): Promise<string> {
    const event = await Event.findOne({
      _id: eventId,
      schoolId,
      isDeleted: false,
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const eventDate = new Date(event.date);
    const dateStr = formatICalDate(eventDate);

    const startTimeStr = formatICalTime(eventDate, event.startTime);
    const endTimeStr = formatICalTime(eventDate, event.endTime);

    const uid = `${eventId}@campusly`;
    const now = formatICalTimestamp(new Date());

    const description = (event.description ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');

    const summary = (event.title ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');

    const location = (event.venue ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Campusly//Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${startTimeStr}`,
      `DTEND:${endTimeStr}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    return lines.join('\r\n');
  }
}

// ─── iCal Helpers ──────────────────────────────────────────────────────────

function formatICalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function formatICalTime(date: Date, timeStr: string): string {
  const dateStr = formatICalDate(date);
  const [hours, minutes] = timeStr.split(':');
  return `${dateStr}T${(hours ?? '00').padStart(2, '0')}${(minutes ?? '00').padStart(2, '0')}00`;
}

function formatICalTimestamp(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}Z`;
}
