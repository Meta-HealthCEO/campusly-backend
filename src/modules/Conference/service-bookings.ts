import { ConferenceEvent, ConferenceTeacherAvailability, ConferenceBooking } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import { ConferenceWaitlistService } from './service-waitlist.js';
import type {
  CreateBookingInput,
  ListBookingsInput,
  UpdateBookingStatusInput,
  CancelBookingInput,
} from './validation.js';

// ─── Booking Service ──────────────────────────────────────────────────────────

export class ConferenceBookingService {
  static async createBooking(
    schoolId: string,
    parentId: string,
    data: CreateBookingInput,
  ) {
    const event = await ConferenceEvent.findOne({
      _id: data.eventId,
      schoolId,
      isDeleted: false,
    }).lean();
    if (!event) throw new NotFoundError('Conference event not found');

    if (event.status !== 'published') {
      throw new BadRequestError('Event is not open for booking');
    }

    // Check booking window
    const now = new Date();
    if (event.bookingOpensAt && now < event.bookingOpensAt) {
      throw new BadRequestError('Booking has not opened yet');
    }
    if (event.bookingClosesAt && now > event.bookingClosesAt) {
      throw new BadRequestError('Booking window has closed');
    }

    // Check max bookings per parent
    if (event.maxBookingsPerParent !== null) {
      const existingCount = await ConferenceBooking.countDocuments({
        eventId: data.eventId,
        parentId,
        schoolId,
        status: 'confirmed',
        isDeleted: false,
      });
      if (existingCount >= event.maxBookingsPerParent) {
        throw new BadRequestError(
          `Maximum ${event.maxBookingsPerParent} bookings per parent reached`,
        );
      }
    }

    // Find the availability and slot
    const availability = await ConferenceTeacherAvailability.findOne({
      eventId: data.eventId,
      teacherId: data.teacherId,
      schoolId,
      isDeleted: false,
    });
    if (!availability) throw new NotFoundError('Teacher has no availability for this event');

    const slotIndex = availability.generatedSlots.findIndex(
      (s) => s.slotId === data.slotId,
    );
    if (slotIndex === -1) throw new NotFoundError('Slot not found');

    const slot = availability.generatedSlots[slotIndex];
    if (!slot || slot.status !== 'available') {
      throw new BadRequestError('Slot is not available');
    }

    // Mark slot as booked
    availability.generatedSlots[slotIndex] = { ...slot, status: 'booked' };
    await availability.save();

    const booking = await ConferenceBooking.create({
      eventId: data.eventId,
      teacherId: data.teacherId,
      parentId,
      studentId: data.studentId,
      schoolId,
      slotId: data.slotId,
      slotStartTime: slot.startTime,
      slotEndTime: slot.endTime,
      location: slot.location ?? null,
      notes: data.notes ?? null,
    });

    logger.info(
      { bookingId: booking._id, eventId: data.eventId, teacherId: data.teacherId },
      'Conference booking created',
    );

    const populated = await ConferenceBooking.findById(booking._id)
      .populate('teacherId', 'firstName lastName')
      .populate('studentId', 'firstName lastName')
      .lean();

    return populated;
  }

  static async listBookings(
    schoolId: string,
    query: ListBookingsInput,
    userId: string,
    role: string,
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = {
      eventId: query.eventId,
      schoolId,
      isDeleted: false,
    };

    // Role-based filtering
    if (role === 'parent') {
      filter.parentId = userId;
    } else if (role === 'teacher') {
      filter.teacherId = userId;
    }

    if (query.teacherId && role !== 'teacher') filter.teacherId = query.teacherId;
    if (query.parentId && role !== 'parent') filter.parentId = query.parentId;
    if (query.status) filter.status = query.status;

    const [bookings, total] = await Promise.all([
      ConferenceBooking.find(filter)
        .populate('teacherId', 'firstName lastName')
        .populate('parentId', 'firstName lastName')
        .populate('studentId', 'firstName lastName')
        .sort({ slotStartTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ConferenceBooking.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { bookings, total, page: query.page ?? 1, limit, totalPages };
  }

  static async getMySchedule(
    schoolId: string,
    eventId: string,
    userId: string,
    role: string,
  ) {
    const filter: Record<string, unknown> = {
      eventId,
      schoolId,
      isDeleted: false,
      status: { $in: ['confirmed', 'completed', 'no_show'] },
    };

    if (role === 'teacher') {
      filter.teacherId = userId;
    } else if (role === 'parent') {
      filter.parentId = userId;
    }

    const bookings = await ConferenceBooking.find(filter)
      .populate('teacherId', 'firstName lastName')
      .populate('parentId', 'firstName lastName')
      .populate('studentId', 'firstName lastName')
      .sort({ slotStartTime: 1 })
      .lean();

    return bookings;
  }

  static async cancelBooking(
    id: string,
    schoolId: string,
    userId: string,
    role: string,
    data: CancelBookingInput,
  ) {
    const booking = await ConferenceBooking.findOne({
      _id: id,
      schoolId,
      isDeleted: false,
    });
    if (!booking) throw new NotFoundError('Booking not found');

    if (booking.status !== 'confirmed') {
      throw new BadRequestError('Only confirmed bookings can be cancelled');
    }

    // Parents can only cancel their own
    if (role === 'parent' && booking.parentId.toString() !== userId) {
      throw new BadRequestError('You can only cancel your own bookings');
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelReason = data.cancelReason ?? null;
    await booking.save();

    // Revert slot to available
    await ConferenceTeacherAvailability.findOneAndUpdate(
      {
        eventId: booking.eventId,
        teacherId: booking.teacherId,
        schoolId,
        isDeleted: false,
        'generatedSlots.slotId': booking.slotId,
      },
      { $set: { 'generatedSlots.$.status': 'available' } },
    );

    // Auto-offer to waitlist
    await ConferenceWaitlistService.offerSlotToWaitlist(
      booking.eventId.toString(),
      booking.teacherId.toString(),
      schoolId,
      booking.slotId,
    );

    logger.info({ bookingId: id }, 'Conference booking cancelled');
    return booking.toObject();
  }

  static async updateBookingStatus(
    id: string,
    schoolId: string,
    userId: string,
    role: string,
    data: UpdateBookingStatusInput,
  ) {
    const booking = await ConferenceBooking.findOne({
      _id: id,
      schoolId,
      isDeleted: false,
    });
    if (!booking) throw new NotFoundError('Booking not found');

    if (booking.status !== 'confirmed') {
      throw new BadRequestError('Only confirmed bookings can be updated');
    }

    // Teachers can only update their own bookings
    if (role === 'teacher' && booking.teacherId.toString() !== userId) {
      throw new BadRequestError('You can only update your own bookings');
    }

    booking.status = data.status;
    await booking.save();

    logger.info({ bookingId: id, status: data.status }, 'Booking status updated');
    return booking.toObject();
  }
}
