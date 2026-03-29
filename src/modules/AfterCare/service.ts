import {
  AfterCareRegistration,
  IAfterCareRegistration,
  AfterCareAttendance,
  IAfterCareAttendance,
} from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateRegistrationInput, UpdateRegistrationInput, CheckInInput, CheckOutInput } from './validation.js';

interface ListRegistrationQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  isActive?: boolean;
}

interface ListAttendanceQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  studentId?: string;
  date?: string;
}

export class AfterCareService {
  // ─── Registration CRUD ────────────────────────────────────────────────────

  static async createRegistration(data: CreateRegistrationInput): Promise<IAfterCareRegistration> {
    const registration = await AfterCareRegistration.create(data);
    return registration;
  }

  static async listRegistrations(
    query: ListRegistrationQuery,
  ): Promise<{
    registrations: IAfterCareRegistration[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [registrations, total] = await Promise.all([
      AfterCareRegistration.find(filter)
        .populate('studentId')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      AfterCareRegistration.countDocuments(filter),
    ]);

    return {
      registrations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getRegistration(id: string): Promise<IAfterCareRegistration> {
    const registration = await AfterCareRegistration.findOne({ _id: id, isDeleted: false })
      .populate('studentId');

    if (!registration) {
      throw new NotFoundError('After care registration not found');
    }

    return registration;
  }

  static async updateRegistration(id: string, data: UpdateRegistrationInput): Promise<IAfterCareRegistration> {
    const registration = await AfterCareRegistration.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('studentId');

    if (!registration) {
      throw new NotFoundError('After care registration not found');
    }

    return registration;
  }

  static async deleteRegistration(id: string): Promise<IAfterCareRegistration> {
    const registration = await AfterCareRegistration.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!registration) {
      throw new NotFoundError('After care registration not found');
    }

    return registration;
  }

  // ─── Attendance (Check-in / Check-out) ────────────────────────────────────

  static async checkIn(data: CheckInInput, checkedInBy: string): Promise<IAfterCareAttendance> {
    const attendance = await AfterCareAttendance.create({
      ...data,
      checkedInBy,
    });

    return attendance;
  }

  static async checkOut(id: string, data: CheckOutInput, checkedOutBy: string): Promise<IAfterCareAttendance> {
    const attendance = await AfterCareAttendance.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { checkOutTime: data.checkOutTime, checkedOutBy, notes: data.notes } },
      { new: true, runValidators: true },
    )
      .populate('studentId')
      .populate('checkedInBy', 'firstName lastName email')
      .populate('checkedOutBy', 'firstName lastName email');

    if (!attendance) {
      throw new NotFoundError('Attendance record not found');
    }

    return attendance;
  }

  static async listAttendance(
    query: ListAttendanceQuery,
  ): Promise<{
    attendance: IAfterCareAttendance[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.studentId) {
      filter.studentId = query.studentId;
    }

    if (query.date) {
      const startOfDay = new Date(query.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(query.date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const [attendance, total] = await Promise.all([
      AfterCareAttendance.find(filter)
        .populate('studentId')
        .populate('checkedInBy', 'firstName lastName email')
        .populate('checkedOutBy', 'firstName lastName email')
        .sort('-date')
        .skip(skip)
        .limit(limit),
      AfterCareAttendance.countDocuments(filter),
    ]);

    return {
      attendance,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getAttendance(id: string): Promise<IAfterCareAttendance> {
    const attendance = await AfterCareAttendance.findOne({ _id: id, isDeleted: false })
      .populate('studentId')
      .populate('checkedInBy', 'firstName lastName email')
      .populate('checkedOutBy', 'firstName lastName email');

    if (!attendance) {
      throw new NotFoundError('Attendance record not found');
    }

    return attendance;
  }

  static async deleteAttendance(id: string): Promise<IAfterCareAttendance> {
    const attendance = await AfterCareAttendance.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!attendance) {
      throw new NotFoundError('Attendance record not found');
    }

    return attendance;
  }
}
