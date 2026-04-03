import mongoose from 'mongoose';
import { PastoralReferral } from './model.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateReferralInput,
  UpdateReferralInput,
  ResolveReferralInput,
} from './validation.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';

// Extended user type — includes JWT permission flags set by authenticate middleware
interface PastoralUser extends AuthenticatedUser {
  isCounselor?: boolean;
  isSchoolPrincipal?: boolean;
}

// Valid workflow transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  referred: ['acknowledged'],
  acknowledged: ['in_progress'],
  in_progress: ['resolved', 'closed'],
  resolved: ['closed'],
  closed: [],
};

export class ReferralService {
  static async createReferral(user: PastoralUser, data: CreateReferralInput) {
    const schoolOid = new mongoose.Types.ObjectId(user.schoolId!);
    const referral = await PastoralReferral.create({
      studentId: new mongoose.Types.ObjectId(data.studentId),
      schoolId: schoolOid,
      referredBy: new mongoose.Types.ObjectId(user.id),
      reason: data.reason,
      description: data.description,
      urgency: data.urgency,
      referrerNotes: data.referrerNotes ?? '',
      status: 'referred',
    });
    return referral.toObject();
  }

  static async listReferrals(
    user: PastoralUser,
    filters: {
      status?: string;
      reason?: string;
      urgency?: string;
      studentId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const schoolOid = new mongoose.Types.ObjectId(user.schoolId!);
    const query: Record<string, unknown> = { schoolId: schoolOid, isDeleted: false };

    // Role-based visibility
    if (user.role === 'teacher' && !user.isCounselor && !user.isSchoolPrincipal) {
      // Regular teacher sees only their own referrals
      query.referredBy = new mongoose.Types.ObjectId(user.id);
    } else if (user.role === 'teacher' && user.isCounselor) {
      // Counselor sees assigned or unassigned referrals
      query.$or = [
        { assignedCounselorId: new mongoose.Types.ObjectId(user.id) },
        { assignedCounselorId: { $exists: false } },
        { assignedCounselorId: null },
      ];
    }
    // school_admin / principal / super_admin see all

    if (filters.status) query.status = filters.status;
    if (filters.reason) query.reason = filters.reason;
    if (filters.urgency) query.urgency = filters.urgency;
    if (filters.studentId) query.studentId = new mongoose.Types.ObjectId(filters.studentId);

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [referrals, total] = await Promise.all([
      PastoralReferral.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'firstName lastName grade')
        .populate('referredBy', 'firstName lastName')
        .populate('assignedCounselorId', 'firstName lastName')
        .lean(),
      PastoralReferral.countDocuments(query),
    ]);
    return { referrals, total, page: filters.page ?? 1, limit };
  }

  static async updateReferral(
    id: string,
    schoolId: string,
    data: UpdateReferralInput,
  ) {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);

    const existing = await PastoralReferral.findOne({
      _id: oid,
      schoolId: schoolOid,
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Referral not found');

    // Enforce status workflow
    if (data.status !== undefined && data.status !== existing.status) {
      const allowed = STATUS_TRANSITIONS[existing.status] ?? [];
      if (!allowed.includes(data.status)) {
        throw new BadRequestError(
          `Invalid status transition from '${existing.status}' to '${data.status}'. Allowed: ${allowed.join(', ') || 'none'}`,
        );
      }
    }

    const update: Record<string, unknown> = {};
    if (data.status !== undefined) update.status = data.status;
    if (data.assignedCounselorId !== undefined) {
      update.assignedCounselorId = new mongoose.Types.ObjectId(data.assignedCounselorId);
    }
    if (data.counselorNotes !== undefined) update.counselorNotes = data.counselorNotes;
    if (data.urgency !== undefined) update.urgency = data.urgency;

    const referral = await PastoralReferral.findOneAndUpdate(
      { _id: oid, schoolId: schoolOid, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate('studentId', 'firstName lastName grade')
      .populate('referredBy', 'firstName lastName')
      .populate('assignedCounselorId', 'firstName lastName')
      .lean();
    if (!referral) throw new NotFoundError('Referral not found');
    return referral;
  }

  static async resolveReferral(
    id: string,
    schoolId: string,
    data: ResolveReferralInput,
  ) {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);

    const existing = await PastoralReferral.findOne({
      _id: oid,
      schoolId: schoolOid,
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Referral not found');

    if (!['in_progress', 'acknowledged'].includes(existing.status)) {
      throw new BadRequestError(
        `Cannot resolve a referral with status '${existing.status}'. Must be acknowledged or in_progress.`,
      );
    }

    const referral = await PastoralReferral.findOneAndUpdate(
      { _id: oid, schoolId: schoolOid, isDeleted: false },
      {
        $set: {
          status: 'resolved',
          outcome: data.outcome,
          resolutionNotes: data.resolutionNotes,
          resolvedAt: new Date(),
        },
      },
      { new: true },
    )
      .populate('studentId', 'firstName lastName grade')
      .populate('referredBy', 'firstName lastName')
      .populate('assignedCounselorId', 'firstName lastName')
      .lean();
    if (!referral) throw new NotFoundError('Referral not found');
    return referral;
  }
}

export function assertCounselorOrPrincipal(user: PastoralUser): void {
  if (user.role === 'super_admin') return;
  if (user.role === 'school_admin' && user.isSchoolPrincipal) return;
  if (user.role === 'teacher' && user.isCounselor) return;
  throw new ForbiddenError('Counselor or principal access required');
}
