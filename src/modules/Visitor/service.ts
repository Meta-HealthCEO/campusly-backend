import mongoose from 'mongoose';
import { VisitorRecord, PreRegistration } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper, escapeRegex } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import type {
  RegisterVisitorInput,
  CheckoutVisitorInput,
  ListVisitorsInput,
  CreatePreRegistrationInput,
  ListPreRegistrationsInput,
} from './validation.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generatePassNumber(schoolId: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const count = await VisitorRecord.countDocuments({
    schoolId,
    checkInTime: { $gte: yearStart, $lt: yearEnd },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `V-${year}-${seq}`;
}

function calculateDuration(checkIn: Date, checkOut: Date): string {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

// ─── Visitor Service ──────────────────────────────────────────────────────────

export class VisitorService {
  // ─── Register ─────────────────────────────────────────────────────────────

  static async register(
    schoolId: string,
    userId: string,
    data: RegisterVisitorInput,
  ) {
    const passNumber = await generatePassNumber(schoolId);

    const record = await VisitorRecord.create({
      schoolId,
      passNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      idNumber: data.idNumber ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      company: data.company ?? null,
      purpose: data.purpose,
      purposeDetail: data.purposeDetail ?? null,
      hostId: data.hostId ?? null,
      hostName: data.hostName ?? null,
      vehicleRegistration: data.vehicleRegistration ?? null,
      numberOfVisitors: data.numberOfVisitors ?? 1,
      photoUrl: data.photoUrl ?? null,
      checkInTime: new Date(),
      preRegistrationId: data.preRegistrationId ?? null,
      registeredBy: new mongoose.Types.ObjectId(userId),
    });

    // Link pre-registration if provided
    if (data.preRegistrationId) {
      await PreRegistration.findOneAndUpdate(
        { _id: data.preRegistrationId, schoolId, isDeleted: false },
        { $set: { status: 'arrived' } },
      );
    }

    logger.info({ passNumber, schoolId }, 'Visitor registered');
    return record.toObject();
  }

  // ─── Checkout ─────────────────────────────────────────────────────────────

  static async checkout(
    id: string,
    schoolId: string,
    data: CheckoutVisitorInput,
  ) {
    const record = await VisitorRecord.findOne({
      _id: id,
      schoolId,
      isDeleted: false,
    });

    if (!record) throw new NotFoundError('Visitor record not found');
    if (record.status === 'checked_out') {
      throw new BadRequestError('Visitor is already checked out');
    }

    record.checkOutTime = new Date();
    record.status = 'checked_out';
    record.checkOutNotes = data.notes ?? null;
    await record.save();

    const duration = calculateDuration(record.checkInTime, record.checkOutTime);
    logger.info({ id, schoolId, duration }, 'Visitor checked out');

    return {
      _id: record._id,
      checkOutTime: record.checkOutTime,
      status: record.status,
      duration,
    };
  }

  // ─── List ─────────────────────────────────────────────────────────────────

  static async list(schoolId: string, query: ListVisitorsInput) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }
    if (query.purpose) filter.purpose = query.purpose;
    if (query.hostId) filter.hostId = query.hostId;

    if (query.date) {
      const dayStart = new Date(query.date);
      const dayEnd = new Date(query.date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filter.checkInTime = { $gte: dayStart, $lt: dayEnd };
    } else {
      if (query.startDate) {
        filter.checkInTime = { ...(filter.checkInTime as Record<string, unknown> ?? {}), $gte: new Date(query.startDate) };
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setDate(end.getDate() + 1);
        filter.checkInTime = { ...(filter.checkInTime as Record<string, unknown> ?? {}), $lt: end };
      }
    }

    if (query.search) {
      const escaped = escapeRegex(query.search);
      filter.$or = [
        { firstName: { $regex: escaped, $options: 'i' } },
        { lastName: { $regex: escaped, $options: 'i' } },
        { company: { $regex: escaped, $options: 'i' } },
        { passNumber: { $regex: escaped, $options: 'i' } },
        { idNumber: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [visitors, total] = await Promise.all([
      VisitorRecord.find(filter)
        .populate('hostId', 'firstName lastName')
        .populate('registeredBy', 'firstName lastName')
        .sort({ checkInTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      VisitorRecord.countDocuments(filter),
    ]);

    return {
      visitors,
      total,
      page: query.page ?? 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Get Single ───────────────────────────────────────────────────────────

  static async getById(id: string, schoolId: string) {
    const record = await VisitorRecord.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('hostId', 'firstName lastName email')
      .populate('registeredBy', 'firstName lastName')
      .populate('preRegistrationId')
      .lean();

    if (!record) throw new NotFoundError('Visitor record not found');
    return record;
  }

  // ─── On-Premises ──────────────────────────────────────────────────────────

  static async getOnPremises(schoolId: string) {
    const visitors = await VisitorRecord.find({
      schoolId,
      isDeleted: false,
      status: 'checked_in',
    })
      .populate('hostId', 'firstName lastName')
      .sort({ checkInTime: -1 })
      .lean();

    const now = new Date();
    const withDuration = visitors.map((v) => ({
      ...v,
      duration: calculateDuration(v.checkInTime, now),
    }));

    return {
      visitors: withDuration,
      totalOnPremises: visitors.length,
    };
  }

  // ─── On-Premises Export (CSV) ─────────────────────────────────────────────

  static async exportOnPremises(schoolId: string): Promise<string> {
    const visitors = await VisitorRecord.find({
      schoolId,
      isDeleted: false,
      status: 'checked_in',
    })
      .populate('hostId', 'firstName lastName')
      .sort({ checkInTime: -1 })
      .lean();

    const header = 'Pass Number,Name,ID Number,Company,Purpose,Host,Check-In Time,Vehicle Reg';
    const rows = visitors.map((v) => {
      const hostObj = v.hostId as unknown as { firstName: string; lastName: string } | null;
      const host = hostObj ? `${hostObj.firstName} ${hostObj.lastName}` : (v.hostName ?? '');
      return [
        v.passNumber,
        `${v.firstName} ${v.lastName}`,
        v.idNumber ?? '',
        v.company ?? '',
        v.purpose,
        host,
        v.checkInTime.toISOString(),
        v.vehicleRegistration ?? '',
      ].map((f) => `"${String(f).replace(/"/g, '""')}"`).join(',');
    });

    return [header, ...rows].join('\n');
  }
}

// ─── Pre-Registration Service ─────────────────────────────────────────────────

export class PreRegistrationService {
  static async create(
    schoolId: string,
    userId: string,
    data: CreatePreRegistrationInput,
  ) {
    const record = await PreRegistration.create({
      schoolId,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company ?? null,
      purpose: data.purpose,
      purposeDetail: data.purposeDetail ?? null,
      expectedDate: new Date(data.expectedDate),
      expectedTime: data.expectedTime ?? null,
      hostId: data.hostId ?? null,
      vehicleRegistration: data.vehicleRegistration ?? null,
      notes: data.notes ?? null,
      registeredBy: new mongoose.Types.ObjectId(userId),
    });

    logger.info({ id: record._id, schoolId }, 'Visitor pre-registered');
    return record.toObject();
  }

  static async list(schoolId: string, query: ListPreRegistrationsInput) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (query.status) filter.status = query.status;
    if (query.expectedDate) {
      const dayStart = new Date(query.expectedDate);
      const dayEnd = new Date(query.expectedDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filter.expectedDate = { $gte: dayStart, $lt: dayEnd };
    }

    const [records, total] = await Promise.all([
      PreRegistration.find(filter)
        .populate('hostId', 'firstName lastName')
        .populate('registeredBy', 'firstName lastName')
        .sort({ expectedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PreRegistration.countDocuments(filter),
    ]);

    return { preRegistrations: records, total, page: query.page ?? 1, limit };
  }

  static async cancel(id: string, schoolId: string, userId: string, role: string) {
    const record = await PreRegistration.findOne({ _id: id, schoolId, isDeleted: false });
    if (!record) throw new NotFoundError('Pre-registration not found');

    // Teachers can only cancel their own
    if (role === 'teacher' && record.registeredBy.toString() !== userId) {
      throw new BadRequestError('You can only cancel your own pre-registrations');
    }

    if (record.status === 'cancelled') {
      throw new BadRequestError('Pre-registration is already cancelled');
    }

    record.status = 'cancelled';
    await record.save();

    logger.info({ id, schoolId }, 'Pre-registration cancelled');
    return record.toObject();
  }
}
