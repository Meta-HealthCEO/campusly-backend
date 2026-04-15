import mongoose from 'mongoose';
import { LeavePolicy, LeaveRequest, LeaveBalance } from './model.js';
import type { ILeaveRequest, ILeaveTypeConfig } from './model.js';
import { SubstituteTeacher } from '../Attendance/model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper, escapeRegex } from '../../common/utils.js';
import type {
  CreateLeaveRequestInput,
  ReviewLeaveRequestInput,
  ListLeaveRequestsInput,
  LeavePolicyInput,
} from './validation.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  isHalfDay: boolean,
): number {
  if (isHalfDay) return 0.5;

  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

function defaultLeaveTypes(): ILeaveTypeConfig[] {
  return [
    { type: 'annual', label: 'Annual Leave', defaultEntitlement: 21, unit: 'days', cycleLength: 1, requiresDocument: false, requiresDocumentAfterDays: null, isPaid: true, isActive: true },
    { type: 'sick', label: 'Sick Leave', defaultEntitlement: 30, unit: 'days', cycleLength: 3, requiresDocument: false, requiresDocumentAfterDays: 2, isPaid: true, isActive: true },
    { type: 'family_responsibility', label: 'Family Responsibility', defaultEntitlement: 3, unit: 'days', cycleLength: 1, requiresDocument: false, requiresDocumentAfterDays: null, isPaid: true, isActive: true },
    { type: 'maternity', label: 'Maternity Leave', defaultEntitlement: 120, unit: 'days', cycleLength: 1, requiresDocument: true, requiresDocumentAfterDays: null, isPaid: false, isActive: true },
    { type: 'paternity', label: 'Paternity Leave', defaultEntitlement: 10, unit: 'days', cycleLength: 1, requiresDocument: true, requiresDocumentAfterDays: null, isPaid: true, isActive: true },
    { type: 'unpaid', label: 'Unpaid Leave', defaultEntitlement: 0, unit: 'days', cycleLength: 1, requiresDocument: false, requiresDocumentAfterDays: null, isPaid: false, isActive: true },
    { type: 'study', label: 'Study Leave', defaultEntitlement: 5, unit: 'days', cycleLength: 1, requiresDocument: true, requiresDocumentAfterDays: null, isPaid: true, isActive: true },
  ];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class LeaveService {
  // ─── Policy ───────────────────────────────────────────────────────────────

  static async getPolicy(schoolId: string) {
    let policy = await LeavePolicy.findOne({ schoolId }).lean();
    if (!policy) {
      policy = await LeavePolicy.findOneAndUpdate(
        { schoolId },
        { $setOnInsert: { leaveTypes: defaultLeaveTypes() } },
        { upsert: true, new: true },
      ).lean();
    }
    return policy;
  }

  static async updatePolicy(schoolId: string, data: LeavePolicyInput) {
    const policy = await LeavePolicy.findOneAndUpdate(
      { schoolId },
      { $set: { leaveTypes: data.leaveTypes } },
      { upsert: true, new: true },
    ).lean();
    return policy;
  }

  // ─── Create Request ───────────────────────────────────────────────────────

  static async createRequest(
    schoolId: string,
    staffId: string,
    data: CreateLeaveRequestInput,
  ) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate < startDate) {
      throw new BadRequestError('End date must be on or after start date');
    }

    const workingDays = calculateWorkingDays(startDate, endDate, data.isHalfDay);
    if (workingDays <= 0) {
      throw new BadRequestError('Leave period must include at least one working day');
    }

    // Check for overlapping pending/approved requests
    const overlap = await LeaveRequest.findOne({
      schoolId,
      staffId,
      isDeleted: false,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    }).lean();

    if (overlap) {
      throw new BadRequestError('You have an overlapping leave request for this period');
    }

    // Check balance
    const year = startDate.getFullYear();
    const balance = await LeaveBalance.findOne({
      schoolId,
      staffId,
      year,
      isDeleted: false,
    });

    if (balance) {
      const entry = balance.balances.find((b) => b.leaveType === data.leaveType);
      if (entry) {
        const available = entry.entitlement - entry.used - entry.pending;
        if (workingDays > available && data.leaveType !== 'unpaid') {
          throw new BadRequestError(
            `Insufficient ${data.leaveType} leave balance. Available: ${available} days`,
          );
        }
      }
    }

    const request = await LeaveRequest.create({
      schoolId,
      staffId,
      leaveType: data.leaveType,
      startDate,
      endDate,
      reason: data.reason,
      isHalfDay: data.isHalfDay,
      halfDayPeriod: data.halfDayPeriod ?? null,
      documentUrl: data.documentUrl ?? null,
      substituteTeacherId: data.substituteTeacherId ?? null,
      workingDays,
    });

    // Update pending balance
    if (balance) {
      await LeaveBalance.findOneAndUpdate(
        { _id: balance._id, 'balances.leaveType': data.leaveType },
        { $inc: { 'balances.$.pending': workingDays } },
      );
    }

    return request.toObject();
  }

  // ─── List Requests ────────────────────────────────────────────────────────

  static async listRequests(
    schoolId: string,
    query: ListLeaveRequestsInput,
    userId: string,
    role: string,
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    // Teachers see only their own requests
    if (role === 'teacher') {
      filter.staffId = userId;
    } else if (query.staffId) {
      filter.staffId = query.staffId;
    }

    if (query.status) filter.status = query.status;
    if (query.leaveType) filter.leaveType = query.leaveType;

    if (query.startDate) filter.startDate = { $gte: new Date(query.startDate) };
    if (query.endDate) {
      filter.endDate = { ...(filter.endDate as Record<string, unknown> ?? {}), $lte: new Date(query.endDate) };
    }

    if (query.search) {
      const escaped = escapeRegex(query.search);
      filter.$or = [{ reason: { $regex: escaped, $options: 'i' } }];
    }

    const [requests, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('staffId', 'firstName lastName email')
        .populate('substituteTeacherId', 'firstName lastName')
        .populate('reviewedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeaveRequest.countDocuments(filter),
    ]);

    return { requests, total, page: query.page ?? 1, limit };
  }

  // ─── Get Single Request ───────────────────────────────────────────────────

  static async getRequest(id: string, schoolId: string) {
    const request = await LeaveRequest.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('staffId', 'firstName lastName email')
      .populate('substituteTeacherId', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .lean();

    if (!request) throw new NotFoundError('Leave request not found');
    return request;
  }

  // ─── Review Request ───────────────────────────────────────────────────────

  static async reviewRequest(
    id: string,
    schoolId: string,
    data: ReviewLeaveRequestInput,
    reviewerId: string,
  ) {
    const request = await LeaveRequest.findOne({ _id: id, schoolId, isDeleted: false });
    if (!request) throw new NotFoundError('Leave request not found');
    if (request.status !== 'pending') {
      throw new BadRequestError('Only pending requests can be reviewed');
    }

    request.status = data.status;
    request.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    request.reviewedAt = new Date();
    request.reviewComment = data.reviewComment ?? null;
    if (data.substituteTeacherId) {
      request.substituteTeacherId = new mongoose.Types.ObjectId(data.substituteTeacherId);
    }
    await request.save();

    // Update balance
    const year = request.startDate.getFullYear();
    const balance = await LeaveBalance.findOne({
      schoolId,
      staffId: request.staffId,
      year,
      isDeleted: false,
    });

    if (balance) {
      if (data.status === 'approved') {
        await LeaveBalance.findOneAndUpdate(
          { _id: balance._id, 'balances.leaveType': request.leaveType },
          {
            $inc: {
              'balances.$.pending': -request.workingDays,
              'balances.$.used': request.workingDays,
            },
          },
        );
      } else {
        // declined — remove from pending
        await LeaveBalance.findOneAndUpdate(
          { _id: balance._id, 'balances.leaveType': request.leaveType },
          { $inc: { 'balances.$.pending': -request.workingDays } },
        );
      }
    }

    return request.toObject();
  }

  // ─── Cancel Request ───────────────────────────────────────────────────────

  static async cancelRequest(id: string, schoolId: string, userId: string) {
    const request = await LeaveRequest.findOne({ _id: id, schoolId, isDeleted: false });
    if (!request) throw new NotFoundError('Leave request not found');

    const isOwner = request.staffId.toString() === userId;
    if (!isOwner) throw new BadRequestError('You can only cancel your own leave requests');
    if (request.status === 'cancelled') throw new BadRequestError('Request is already cancelled');

    const previousStatus = request.status;
    request.status = 'cancelled';
    await request.save();

    // Restore balance
    const year = request.startDate.getFullYear();
    const balance = await LeaveBalance.findOne({
      schoolId,
      staffId: request.staffId,
      year,
      isDeleted: false,
    });

    if (balance) {
      if (previousStatus === 'approved') {
        await LeaveBalance.findOneAndUpdate(
          { _id: balance._id, 'balances.leaveType': request.leaveType },
          { $inc: { 'balances.$.used': -request.workingDays } },
        );
      } else if (previousStatus === 'pending') {
        await LeaveBalance.findOneAndUpdate(
          { _id: balance._id, 'balances.leaveType': request.leaveType },
          { $inc: { 'balances.$.pending': -request.workingDays } },
        );
      }
    }

    return request.toObject();
  }

  // ─── Pending Substitute Coverage ──────────────────────────────────────────

  /** Find approved leaves with no linked substitute (current/future only). */
  static async findPendingSubstituteCoverage(schoolId: string): Promise<ILeaveRequest[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leaves = await LeaveRequest.find({
      schoolId,
      status: 'approved',
      isDeleted: false,
      endDate: { $gte: today },
    })
      .populate('staffId', 'firstName lastName email')
      .lean();

    const result: ILeaveRequest[] = [];
    for (const leave of leaves) {
      const sub = await SubstituteTeacher.findOne({
        schoolId,
        leaveRequestId: leave._id,
        isDeleted: false,
      }).lean();
      if (!sub) result.push(leave as unknown as ILeaveRequest);
    }
    return result;
  }

  // Balance methods are in service-balances.ts
}
