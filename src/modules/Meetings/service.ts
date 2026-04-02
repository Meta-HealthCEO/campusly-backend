import { MeetingDay, IMeetingDay, MeetingSlot, IMeetingSlot } from './model.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import type { CreateMeetingDayInput } from './validation.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const { hours, minutes } = parseTime(time);
  return hours * 60 + minutes;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MeetingService {
  static async createMeetingDay(
    schoolId: string,
    data: CreateMeetingDayInput,
  ): Promise<IMeetingDay> {
    const meetingDay = await MeetingDay.create({ ...data, schoolId });
    return meetingDay;
  }

  static async listMeetingDays(schoolId: string): Promise<IMeetingDay[]> {
    const days = await MeetingDay.find({
      schoolId,
      isActive: true,
      isDeleted: false,
    }).sort({ date: 1 });
    return days;
  }

  static async generateSlots(
    schoolId: string,
    meetingDayId: string,
    teacherId: string,
    teacherName: string,
  ): Promise<IMeetingSlot[]> {
    const meetingDay = await MeetingDay.findOne({
      _id: meetingDayId,
      schoolId,
      isDeleted: false,
    });

    if (!meetingDay) {
      throw new NotFoundError('Meeting day not found');
    }

    // Check if slots already exist for this teacher on this meeting day
    const existing = await MeetingSlot.countDocuments({
      schoolId,
      meetingDayId,
      teacherId,
      isDeleted: false,
    });

    if (existing > 0) {
      throw new BadRequestError(
        'Slots already generated for this teacher on this meeting day',
      );
    }

    const startMinutes = timeToMinutes(meetingDay.startTime);
    const endMinutes = timeToMinutes(meetingDay.endTime);
    const duration = meetingDay.slotDuration;

    const slots: {
      schoolId: string;
      meetingDayId: string;
      teacherId: string;
      teacherName: string;
      date: Date;
      startTime: string;
      endTime: string;
      status: 'available';
      meetingType: 'in_person' | 'virtual';
    }[] = [];

    for (let t = startMinutes; t + duration <= endMinutes; t += duration) {
      const slotStart = formatTime(Math.floor(t / 60), t % 60);
      const slotEnd = formatTime(
        Math.floor((t + duration) / 60),
        (t + duration) % 60,
      );

      slots.push({
        schoolId,
        meetingDayId,
        teacherId,
        teacherName,
        date: meetingDay.date,
        startTime: slotStart,
        endTime: slotEnd,
        status: 'available',
        meetingType: meetingDay.virtualMeetingEnabled ? 'virtual' : 'in_person',
      });
    }

    const created = await MeetingSlot.insertMany(slots);
    return created as unknown as IMeetingSlot[];
  }

  static async getTeacherSlots(
    schoolId: string,
    teacherId: string,
    meetingDayId?: string,
  ): Promise<IMeetingSlot[]> {
    const filter: Record<string, unknown> = {
      schoolId,
      teacherId,
      isDeleted: false,
    };

    if (meetingDayId) {
      filter.meetingDayId = meetingDayId;
    }

    const slots = await MeetingSlot.find(filter)
      .populate('meetingDayId', 'name date location')
      .sort({ date: 1, startTime: 1 });
    return slots;
  }

  static async getAvailableSlots(
    schoolId: string,
    meetingDayId: string,
    teacherId?: string,
  ): Promise<IMeetingSlot[]> {
    const filter: Record<string, unknown> = {
      schoolId,
      meetingDayId,
      status: 'available',
      isDeleted: false,
    };

    if (teacherId) {
      filter.teacherId = teacherId;
    }

    const slots = await MeetingSlot.find(filter)
      .populate('meetingDayId', 'name date location')
      .sort({ startTime: 1 });
    return slots;
  }

  static async bookSlot(
    userId: string,
    userName: string,
    schoolId: string,
    slotId: string,
    studentId: string,
    studentName: string,
  ): Promise<IMeetingSlot> {
    const slot = await MeetingSlot.findOne({
      _id: slotId,
      schoolId,
      isDeleted: false,
    });

    if (!slot) {
      throw new NotFoundError('Meeting slot not found');
    }

    if (slot.status !== 'available') {
      throw new BadRequestError('This slot is no longer available');
    }

    // Prevent duplicate: parent can only book one slot per teacher per meeting day
    const duplicate = await MeetingSlot.findOne({
      schoolId,
      meetingDayId: slot.meetingDayId,
      teacherId: slot.teacherId,
      'bookedBy.parentId': userId,
      status: 'booked',
      isDeleted: false,
    });

    if (duplicate) {
      throw new BadRequestError(
        'You already have a booking with this teacher for this meeting day',
      );
    }

    const updated = await MeetingSlot.findOneAndUpdate(
      { _id: slotId, schoolId, status: 'available', isDeleted: false },
      {
        $set: {
          status: 'booked',
          bookedBy: {
            parentId: userId,
            parentName: userName,
            studentId,
            studentName,
          },
        },
      },
      { new: true, runValidators: true },
    ).populate('meetingDayId', 'name date location');

    if (!updated) {
      throw new BadRequestError('Slot was booked by someone else');
    }

    return updated;
  }

  static async cancelBooking(
    userId: string,
    schoolId: string,
    slotId: string,
    role: string,
  ): Promise<IMeetingSlot> {
    const slot = await MeetingSlot.findOne({
      _id: slotId,
      schoolId,
      isDeleted: false,
    });

    if (!slot) {
      throw new NotFoundError('Meeting slot not found');
    }

    if (slot.status !== 'booked') {
      throw new BadRequestError('This slot is not currently booked');
    }

    const isAdmin = role === 'school_admin' || role === 'super_admin';
    const isBooker =
      slot.bookedBy?.parentId?.toString() === userId;

    if (!isAdmin && !isBooker) {
      throw new ForbiddenError('You can only cancel your own bookings');
    }

    const updated = await MeetingSlot.findOneAndUpdate(
      { _id: slotId, schoolId, status: 'booked', isDeleted: false },
      {
        $set: { status: 'available' },
        $unset: { bookedBy: 1 },
      },
      { new: true, runValidators: true },
    ).populate('meetingDayId', 'name date location');

    if (!updated) {
      throw new NotFoundError('Meeting slot not found');
    }

    return updated;
  }

  static async getParentBookings(
    userId: string,
    schoolId: string,
  ): Promise<IMeetingSlot[]> {
    const slots = await MeetingSlot.find({
      schoolId,
      'bookedBy.parentId': userId,
      status: { $in: ['booked', 'completed'] },
      isDeleted: false,
    })
      .populate('meetingDayId', 'name date location')
      .sort({ date: 1, startTime: 1 });
    return slots;
  }

  static async markComplete(
    teacherId: string,
    schoolId: string,
    slotId: string,
    notes?: string,
  ): Promise<IMeetingSlot> {
    const filter: Record<string, unknown> = {
      _id: slotId,
      schoolId,
      teacherId,
      status: 'booked',
      isDeleted: false,
    };

    const update: Record<string, unknown> = { status: 'completed' };
    if (notes) {
      update.notes = notes;
    }

    const slot = await MeetingSlot.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, runValidators: true },
    ).populate('meetingDayId', 'name date location');

    if (!slot) {
      throw new NotFoundError(
        'Meeting slot not found or not assigned to you',
      );
    }

    return slot;
  }

  static async getMeetingDayStats(
    schoolId: string,
    meetingDayId: string,
  ): Promise<{
    total: number;
    available: number;
    booked: number;
    completed: number;
    cancelled: number;
  }> {
    const baseFilter = {
      schoolId,
      meetingDayId,
      isDeleted: false,
    };

    const [total, available, booked, completed, cancelled] = await Promise.all([
      MeetingSlot.countDocuments(baseFilter),
      MeetingSlot.countDocuments({ ...baseFilter, status: 'available' }),
      MeetingSlot.countDocuments({ ...baseFilter, status: 'booked' }),
      MeetingSlot.countDocuments({ ...baseFilter, status: 'completed' }),
      MeetingSlot.countDocuments({ ...baseFilter, status: 'cancelled' }),
    ]);

    return { total, available, booked, completed, cancelled };
  }
}
