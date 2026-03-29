import {
  AfterCareRegistration,
  IAfterCareRegistration,
  AfterCareAttendance,
  IAfterCareAttendance,
  PickupAuthorization,
  IPickupAuthorization,
  SignOutLog,
  ISignOutLog,
  AfterCareActivity,
  IAfterCareActivity,
  AfterCareInvoice,
  IAfterCareInvoice,
} from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateRegistrationInput,
  UpdateRegistrationInput,
  CheckInInput,
  CheckOutInput,
  CreatePickupAuthInput,
  UpdatePickupAuthInput,
  CreateSignOutLogInput,
  CreateActivityInput,
  UpdateActivityInput,
  GenerateInvoicesInput,
} from './validation.js';

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

interface ListPickupAuthQuery {
  page?: number;
  limit?: number;
  studentId?: string;
  schoolId?: string;
}

interface ListSignOutLogQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  studentId?: string;
  date?: string;
}

interface ListActivityQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  date?: string;
}

interface ListInvoiceQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  studentId?: string;
  month?: number;
  year?: number;
  status?: string;
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

  // ─── Pickup Authorization CRUD ─────────────────────────────────────────────

  static async createPickupAuth(data: CreatePickupAuthInput): Promise<IPickupAuthorization> {
    const auth = await PickupAuthorization.create(data);
    return auth;
  }

  static async listPickupAuths(
    query: ListPickupAuthQuery,
  ): Promise<{
    authorizations: IPickupAuthorization[];
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

    if (query.studentId) {
      filter.studentId = query.studentId;
    }

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    const [authorizations, total] = await Promise.all([
      PickupAuthorization.find(filter)
        .populate('studentId')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      PickupAuthorization.countDocuments(filter),
    ]);

    return {
      authorizations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async updatePickupAuth(id: string, data: UpdatePickupAuthInput): Promise<IPickupAuthorization> {
    const auth = await PickupAuthorization.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('studentId');

    if (!auth) {
      throw new NotFoundError('Pickup authorization not found');
    }

    return auth;
  }

  static async deletePickupAuth(id: string): Promise<IPickupAuthorization> {
    const auth = await PickupAuthorization.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!auth) {
      throw new NotFoundError('Pickup authorization not found');
    }

    return auth;
  }

  // ─── Sign Out Log ──────────────────────────────────────────────────────────

  static async createSignOutLog(data: CreateSignOutLogInput): Promise<ISignOutLog> {
    const log = await SignOutLog.create(data);
    return log;
  }

  static async listSignOutLogs(
    query: ListSignOutLogQuery,
  ): Promise<{
    signOutLogs: ISignOutLog[];
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
      filter.pickedUpAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const [signOutLogs, total] = await Promise.all([
      SignOutLog.find(filter)
        .populate('studentId')
        .populate('attendanceId')
        .populate('authorizationId')
        .sort('-pickedUpAt')
        .skip(skip)
        .limit(limit),
      SignOutLog.countDocuments(filter),
    ]);

    return {
      signOutLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getSignOutLog(id: string): Promise<ISignOutLog> {
    const log = await SignOutLog.findOne({ _id: id, isDeleted: false })
      .populate('studentId')
      .populate('attendanceId')
      .populate('authorizationId');

    if (!log) {
      throw new NotFoundError('Sign out log not found');
    }

    return log;
  }

  // ─── After Care Activity CRUD ──────────────────────────────────────────────

  static async createActivity(data: CreateActivityInput): Promise<IAfterCareActivity> {
    const activity = await AfterCareActivity.create(data);
    return activity;
  }

  static async listActivities(
    query: ListActivityQuery,
  ): Promise<{
    activities: IAfterCareActivity[];
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

    if (query.date) {
      const startOfDay = new Date(query.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(query.date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const [activities, total] = await Promise.all([
      AfterCareActivity.find(filter)
        .populate('supervisorId', 'firstName lastName email')
        .populate('studentIds')
        .sort('-date')
        .skip(skip)
        .limit(limit),
      AfterCareActivity.countDocuments(filter),
    ]);

    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getActivity(id: string): Promise<IAfterCareActivity> {
    const activity = await AfterCareActivity.findOne({ _id: id, isDeleted: false })
      .populate('supervisorId', 'firstName lastName email')
      .populate('studentIds');

    if (!activity) {
      throw new NotFoundError('After care activity not found');
    }

    return activity;
  }

  static async updateActivity(id: string, data: UpdateActivityInput): Promise<IAfterCareActivity> {
    const activity = await AfterCareActivity.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('supervisorId', 'firstName lastName email')
      .populate('studentIds');

    if (!activity) {
      throw new NotFoundError('After care activity not found');
    }

    return activity;
  }

  static async deleteActivity(id: string): Promise<IAfterCareActivity> {
    const activity = await AfterCareActivity.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!activity) {
      throw new NotFoundError('After care activity not found');
    }

    return activity;
  }

  // ─── After Care Invoice ────────────────────────────────────────────────────

  static async generateMonthlyInvoices(
    data: GenerateInvoicesInput,
  ): Promise<IAfterCareInvoice[]> {
    const { schoolId, month, year } = data;

    const activeRegistrations = await AfterCareRegistration.find({
      schoolId,
      isActive: true,
      isDeleted: false,
    });

    if (activeRegistrations.length === 0) {
      throw new BadRequestError('No active after care registrations found for this school');
    }

    const invoices: IAfterCareInvoice[] = [];

    for (const registration of activeRegistrations) {
      const existing = await AfterCareInvoice.findOne({
        registrationId: registration._id,
        month,
        year,
        isDeleted: false,
      });

      if (existing) {
        continue;
      }

      const invoice = await AfterCareInvoice.create({
        schoolId,
        registrationId: registration._id,
        studentId: registration.studentId,
        month,
        year,
        amount: registration.monthlyFee,
        status: 'pending',
        generatedAt: new Date(),
      });

      invoices.push(invoice);
    }

    return invoices;
  }

  static async listInvoices(
    query: ListInvoiceQuery,
  ): Promise<{
    invoices: IAfterCareInvoice[];
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

    if (query.month) {
      filter.month = query.month;
    }

    if (query.year) {
      filter.year = query.year;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const [invoices, total] = await Promise.all([
      AfterCareInvoice.find(filter)
        .populate('studentId')
        .populate('registrationId')
        .sort('-generatedAt')
        .skip(skip)
        .limit(limit),
      AfterCareInvoice.countDocuments(filter),
    ]);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async markInvoicePaid(id: string): Promise<IAfterCareInvoice> {
    const invoice = await AfterCareInvoice.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status: 'paid' } },
      { new: true, runValidators: true },
    )
      .populate('studentId')
      .populate('registrationId');

    if (!invoice) {
      throw new NotFoundError('After care invoice not found');
    }

    return invoice;
  }
}
