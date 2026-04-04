import mongoose from 'mongoose';
import {
  LateArrival,
  EarlyDeparture,
  VisitorRecord,
  PreRegistration,
} from './model.js';
import { paginationHelper } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import type {
  CreateLateArrivalInput,
  ListLateArrivalsInput,
  CreateEarlyDepartureInput,
  ListEarlyDeparturesInput,
} from './validation.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Default school start time: 07:30. Override per school if needed. */
const DEFAULT_SCHOOL_START_HOUR = 7;
const DEFAULT_SCHOOL_START_MINUTE = 30;

function calculateMinutesLate(arrivalTime: Date): number {
  const startMinutes = DEFAULT_SCHOOL_START_HOUR * 60 + DEFAULT_SCHOOL_START_MINUTE;
  const arrivalMinutes = arrivalTime.getHours() * 60 + arrivalTime.getMinutes();
  return Math.max(0, arrivalMinutes - startMinutes);
}

function buildDateFilter(
  query: { date?: string; startDate?: string; endDate?: string },
  fieldName: string,
): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (query.date) {
    const dayStart = new Date(query.date);
    const dayEnd = new Date(query.date);
    dayEnd.setDate(dayEnd.getDate() + 1);
    filter[fieldName] = { $gte: dayStart, $lt: dayEnd };
  } else {
    const range: Record<string, unknown> = {};
    if (query.startDate) range.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setDate(end.getDate() + 1);
      range.$lt = end;
    }
    if (Object.keys(range).length > 0) filter[fieldName] = range;
  }

  return filter;
}

// ─── Late Arrival Service ─────────────────────────────────────────────────────

export class LateArrivalService {
  static async create(
    schoolId: string,
    userId: string,
    data: CreateLateArrivalInput,
  ) {
    const arrivalTime = new Date(data.arrivalTime);
    const minutesLate = calculateMinutesLate(arrivalTime);

    const record = await LateArrival.create({
      schoolId,
      studentId: new mongoose.Types.ObjectId(data.studentId),
      arrivalTime,
      minutesLate,
      reason: data.reason,
      reasonDetail: data.reasonDetail ?? null,
      parentNotified: data.parentNotified ?? true,
      accompaniedBy: data.accompaniedBy ?? null,
      registeredBy: new mongoose.Types.ObjectId(userId),
    });

    // Populate for response
    const populated = await LateArrival.findById(record._id)
      .populate('studentId', 'firstName lastName classId')
      .populate('registeredBy', 'firstName lastName')
      .lean();

    logger.info({ id: record._id, schoolId, minutesLate }, 'Late arrival recorded');
    return populated;
  }

  static async list(schoolId: string, query: ListLateArrivalsInput) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    Object.assign(filter, buildDateFilter(query, 'arrivalTime'));

    if (query.studentId) filter.studentId = query.studentId;
    if (query.reason) filter.reason = query.reason;

    // classId filter requires a sub-pipeline; for simplicity, post-filter
    const [records, total] = await Promise.all([
      LateArrival.find(filter)
        .populate({
          path: 'studentId',
          select: 'firstName lastName classId',
          populate: { path: 'classId', select: 'name' },
        })
        .populate('registeredBy', 'firstName lastName')
        .sort({ arrivalTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LateArrival.countDocuments(filter),
    ]);

    return { lateArrivals: records, total, page: query.page ?? 1, limit };
  }
}

// ─── Early Departure Service ──────────────────────────────────────────────────

export class EarlyDepartureService {
  static async create(
    schoolId: string,
    userId: string,
    data: CreateEarlyDepartureInput,
  ) {
    const record = await EarlyDeparture.create({
      schoolId,
      studentId: new mongoose.Types.ObjectId(data.studentId),
      departureTime: new Date(data.departureTime),
      reason: data.reason,
      reasonDetail: data.reasonDetail ?? null,
      authorizedById: data.authorizedById
        ? new mongoose.Types.ObjectId(data.authorizedById)
        : null,
      collectedBy: data.collectedBy,
      collectedByIdNumber: data.collectedByIdNumber ?? null,
      collectedByRelation: data.collectedByRelation ?? null,
      parentNotified: data.parentNotified ?? true,
      guardianMismatchFlag: false, // Could be enhanced with guardian lookup
      registeredBy: new mongoose.Types.ObjectId(userId),
    });

    const populated = await EarlyDeparture.findById(record._id)
      .populate('studentId', 'firstName lastName')
      .populate('authorizedById', 'firstName lastName')
      .populate('registeredBy', 'firstName lastName')
      .lean();

    logger.info({ id: record._id, schoolId }, 'Early departure recorded');
    return populated;
  }

  static async list(schoolId: string, query: ListEarlyDeparturesInput) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    Object.assign(filter, buildDateFilter(query, 'departureTime'));

    if (query.studentId) filter.studentId = query.studentId;
    if (query.reason) filter.reason = query.reason;

    const [records, total] = await Promise.all([
      EarlyDeparture.find(filter)
        .populate({
          path: 'studentId',
          select: 'firstName lastName classId',
          populate: { path: 'classId', select: 'name' },
        })
        .populate('authorizedById', 'firstName lastName')
        .populate('registeredBy', 'firstName lastName')
        .sort({ departureTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EarlyDeparture.countDocuments(filter),
    ]);

    return { earlyDepartures: records, total, page: query.page ?? 1, limit };
  }
}

// ─── Daily Report Service ─────────────────────────────────────────────────────

export class DailyReportService {
  static async getReport(schoolId: string, date?: string) {
    const reportDate = date ? new Date(date) : new Date();
    const dayStart = new Date(reportDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    const [
      visitorsByPurpose,
      currentlyOnPremises,
      totalCheckedOut,
      lateArrivalsData,
      earlyDeparturesData,
      preRegData,
    ] = await Promise.all([
      VisitorRecord.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            checkInTime: { $gte: dayStart, $lt: dayEnd },
          },
        },
        { $group: { _id: '$purpose', count: { $sum: 1 } } },
      ]),
      VisitorRecord.countDocuments({
        schoolId,
        isDeleted: false,
        status: 'checked_in',
        checkInTime: { $gte: dayStart, $lt: dayEnd },
      }),
      VisitorRecord.countDocuments({
        schoolId,
        isDeleted: false,
        status: 'checked_out',
        checkInTime: { $gte: dayStart, $lt: dayEnd },
      }),
      LateArrival.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            arrivalTime: { $gte: dayStart, $lt: dayEnd },
          },
        },
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 },
            totalMinutes: { $sum: '$minutesLate' },
          },
        },
      ]),
      EarlyDeparture.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            departureTime: { $gte: dayStart, $lt: dayEnd },
          },
        },
        { $group: { _id: '$reason', count: { $sum: 1 } } },
      ]),
      PreRegistration.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            expectedDate: { $gte: dayStart, $lt: dayEnd },
          },
        },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalCheckedIn = currentlyOnPremises + totalCheckedOut;
    const totalLate = lateArrivalsData.reduce(
      (sum: number, r: { count: number }) => sum + r.count,
      0,
    );
    const totalLateMinutes = lateArrivalsData.reduce(
      (sum: number, r: { totalMinutes: number }) => sum + r.totalMinutes,
      0,
    );

    const y = reportDate.getFullYear();
    const m = String(reportDate.getMonth() + 1).padStart(2, '0');
    const d = String(reportDate.getDate()).padStart(2, '0');

    return {
      date: `${y}-${m}-${d}`,
      visitors: {
        totalCheckedIn,
        currentlyOnPremises,
        checkedOut: totalCheckedOut,
        byPurpose: visitorsByPurpose.map(
          (r: { _id: string; count: number }) => ({ purpose: r._id, count: r.count }),
        ),
      },
      lateArrivals: {
        total: totalLate,
        averageMinutesLate: totalLate > 0 ? Math.round(totalLateMinutes / totalLate) : 0,
        byReason: lateArrivalsData.map(
          (r: { _id: string; count: number }) => ({ reason: r._id, count: r.count }),
        ),
      },
      earlyDepartures: {
        total: earlyDeparturesData.reduce(
          (sum: number, r: { count: number }) => sum + r.count,
          0,
        ),
        byReason: earlyDeparturesData.map(
          (r: { _id: string; count: number }) => ({ reason: r._id, count: r.count }),
        ),
      },
      preRegistrations: {
        expected: preRegData.find((r: { _id: string }) => r._id === 'expected')?.count ?? 0,
        arrived: preRegData.find((r: { _id: string }) => r._id === 'arrived')?.count ?? 0,
        noShow: preRegData.find((r: { _id: string }) => r._id === 'no_show')?.count ?? 0,
      },
    };
  }
}
