import { ConferenceEvent, ConferenceWaitlist } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type { JoinWaitlistInput, ListWaitlistInput } from './validation.js';

// ─── Waitlist Service ─────────────────────────────────────────────────────────

export class ConferenceWaitlistService {
  static async joinWaitlist(schoolId: string, parentId: string, data: JoinWaitlistInput) {
    const event = await ConferenceEvent.findOne({
      _id: data.eventId,
      schoolId,
      isDeleted: false,
    }).lean();
    if (!event) throw new NotFoundError('Conference event not found');

    if (!event.allowWaitlist) {
      throw new BadRequestError('Waitlist is not enabled for this event');
    }

    // Check if already on waitlist for this teacher
    const existing = await ConferenceWaitlist.findOne({
      eventId: data.eventId,
      teacherId: data.teacherId,
      parentId,
      schoolId,
      status: 'waiting',
      isDeleted: false,
    }).lean();
    if (existing) {
      throw new BadRequestError('Already on the waitlist for this teacher');
    }

    // Get next position
    const lastEntry = await ConferenceWaitlist.findOne({
      eventId: data.eventId,
      teacherId: data.teacherId,
      schoolId,
      isDeleted: false,
    })
      .sort({ position: -1 })
      .lean();

    const position = (lastEntry?.position ?? 0) + 1;

    const entry = await ConferenceWaitlist.create({
      eventId: data.eventId,
      teacherId: data.teacherId,
      parentId,
      studentId: data.studentId,
      schoolId,
      position,
      preferredTimes: data.preferredTimes ?? [],
    });

    logger.info(
      { waitlistId: entry._id, position, eventId: data.eventId },
      'Parent joined waitlist',
    );

    return entry.toObject();
  }

  static async listWaitlist(
    schoolId: string,
    query: ListWaitlistInput,
    userId: string,
    role: string,
  ) {
    const filter: Record<string, unknown> = {
      eventId: query.eventId,
      schoolId,
      isDeleted: false,
    };

    if (role === 'parent') filter.parentId = userId;
    if (query.teacherId) filter.teacherId = query.teacherId;

    const entries = await ConferenceWaitlist.find(filter)
      .populate('teacherId', 'firstName lastName')
      .populate('parentId', 'firstName lastName')
      .populate('studentId', 'firstName lastName')
      .sort({ position: 1 })
      .lean();

    return entries;
  }

  static async removeFromWaitlist(id: string, schoolId: string, userId: string, role: string) {
    const entry = await ConferenceWaitlist.findOne({
      _id: id,
      schoolId,
      isDeleted: false,
    });
    if (!entry) throw new NotFoundError('Waitlist entry not found');

    if (role === 'parent' && entry.parentId.toString() !== userId) {
      throw new BadRequestError('You can only remove yourself from the waitlist');
    }

    entry.isDeleted = true;
    await entry.save();

    logger.info({ waitlistId: id }, 'Removed from waitlist');
  }

  /** Auto-offer a freed slot to the next waitlisted parent. */
  static async offerSlotToWaitlist(
    eventId: string,
    teacherId: string,
    schoolId: string,
    slotId: string,
  ) {
    const nextEntry = await ConferenceWaitlist.findOne({
      eventId,
      teacherId,
      schoolId,
      status: 'waiting',
      isDeleted: false,
    }).sort({ position: 1 });

    if (!nextEntry) return;

    nextEntry.status = 'offered';
    nextEntry.offeredSlotId = slotId;
    nextEntry.offeredAt = new Date();
    await nextEntry.save();

    logger.info(
      { waitlistId: nextEntry._id, slotId, parentId: nextEntry.parentId },
      'Slot offered to waitlisted parent',
    );
  }
}
