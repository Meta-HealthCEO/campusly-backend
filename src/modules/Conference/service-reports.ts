import mongoose from 'mongoose';
import { ConferenceEvent, ConferenceTeacherAvailability, ConferenceBooking, ConferenceWaitlist } from './model.js';
import { NotFoundError } from '../../common/errors.js';

// ─── Report Service ───────────────────────────────────────────────────────────

export class ConferenceReportService {
  static async getEventReport(eventId: string, schoolId: string) {
    const event = await ConferenceEvent.findOne({
      _id: eventId,
      schoolId,
      isDeleted: false,
    }).lean();
    if (!event) throw new NotFoundError('Conference event not found');

    const eventOid = new mongoose.Types.ObjectId(eventId);
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    // Get all availabilities for the event
    const availabilities = await ConferenceTeacherAvailability.find({
      eventId,
      schoolId,
      isDeleted: false,
    })
      .populate('teacherId', 'firstName lastName')
      .lean();

    const teachersWithAvailability = availabilities.length;

    // Count participating teachers (from event or those who set availability)
    const totalTeachers = event.participatingTeacherIds.length || teachersWithAvailability;

    // Total slots across all teachers
    let totalSlots = 0;
    let bookedSlots = 0;

    const teacherUtilization = availabilities.map((a) => {
      const tTotal = a.generatedSlots.length;
      const tBooked = a.generatedSlots.filter((s) => s.status === 'booked').length;
      totalSlots += tTotal;
      bookedSlots += tBooked;

      const teacher = a.teacherId as unknown as { _id: string; firstName: string; lastName: string };
      return {
        teacherId: teacher._id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        totalSlots: tTotal,
        bookedSlots: tBooked,
        utilizationRate: tTotal > 0 ? Math.round((tBooked / tTotal) * 10000) / 100 : 0,
      };
    });

    // Booking stats
    const [bookingStats] = await ConferenceBooking.aggregate([
      {
        $match: {
          eventId: eventOid,
          schoolId: schoolOid,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          noShows: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] },
          },
          uniqueParents: { $addToSet: '$parentId' },
        },
      },
    ]);

    const stats = bookingStats ?? {
      total: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
      noShows: 0,
      uniqueParents: [],
    };

    const totalBookings = (stats.confirmed as number) + (stats.completed as number) + (stats.noShows as number);
    const cancelledBookings = stats.cancelled as number;
    const noShows = stats.noShows as number;
    const bookingRate = totalSlots > 0
      ? Math.round((bookedSlots / totalSlots) * 10000) / 100
      : 0;
    const noShowRate = totalBookings > 0
      ? Math.round((noShows / totalBookings) * 10000) / 100
      : 0;

    const uniqueParentCount = (stats.uniqueParents as unknown[]).length;
    const averageBookingsPerParent = uniqueParentCount > 0
      ? Math.round((totalBookings / uniqueParentCount) * 10) / 10
      : 0;

    // Waitlist count
    const waitlistEntries = await ConferenceWaitlist.countDocuments({
      eventId,
      schoolId,
      isDeleted: false,
    });

    // Bookings by hour
    const bookingsByHour = await ConferenceBooking.aggregate([
      {
        $match: {
          eventId: eventOid,
          schoolId: schoolOid,
          isDeleted: false,
          status: { $in: ['confirmed', 'completed', 'no_show'] },
        },
      },
      {
        $group: {
          _id: {
            $substr: ['$slotStartTime', 0, 2],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedBookingsByHour = bookingsByHour.map((b: { _id: string; count: number }) => ({
      hour: `${b._id}:00`,
      count: b.count,
    }));

    return {
      totalTeachers,
      teachersWithAvailability,
      totalSlots,
      bookedSlots,
      bookingRate,
      cancelledBookings,
      noShows,
      noShowRate,
      waitlistEntries,
      averageBookingsPerParent,
      teacherUtilization,
      bookingsByHour: formattedBookingsByHour,
    };
  }
}
