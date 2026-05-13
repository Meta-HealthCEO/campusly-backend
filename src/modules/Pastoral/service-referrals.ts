import mongoose from 'mongoose';
import { PastoralReferral } from './model.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import {
  assertCanAccessStudent,
  assertCanManageReferral,
  formatReferral,
  REFERRAL_POPULATE,
  type PastoralUser,
} from './helpers.js';
import type {
  CreateReferralInput,
  UpdateReferralInput,
  ResolveReferralInput,
} from './validation.js';

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
    await assertCanAccessStudent(user, data.studentId);

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

    const populated = await PastoralReferral.findById(referral._id)
      .populate(REFERRAL_POPULATE)
      .lean();
    return formatReferral(populated ?? referral.toObject());
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

    if (user.role === 'teacher' && !user.isCounselor && !user.isSchoolPrincipal) {
      query.referredBy = new mongoose.Types.ObjectId(user.id);
    } else if (user.role === 'teacher' && user.isCounselor) {
      query.$or = [
        { assignedCounselorId: new mongoose.Types.ObjectId(user.id) },
        { assignedCounselorId: { $exists: false } },
        { assignedCounselorId: null },
      ];
    }

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
        .populate(REFERRAL_POPULATE)
        .lean(),
      PastoralReferral.countDocuments(query),
    ]);

    return {
      referrals: referrals.map(formatReferral),
      total,
      page: filters.page ?? 1,
      limit,
    };
  }

  static async updateReferral(
    id: string,
    user: PastoralUser,
    data: UpdateReferralInput,
  ) {
    const schoolOid = new mongoose.Types.ObjectId(user.schoolId!);
    const oid = new mongoose.Types.ObjectId(id);

    const existing = await PastoralReferral.findOne({
      _id: oid,
      schoolId: schoolOid,
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Referral not found');
    assertCanManageReferral(user, existing);

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
      if (user.role === 'teacher' && user.isCounselor && data.assignedCounselorId !== user.id) {
        throw new ForbiddenError('Counselors can only assign referrals to themselves');
      }
      update.assignedCounselorId = new mongoose.Types.ObjectId(data.assignedCounselorId);
    } else if (
      user.role === 'teacher' &&
      user.isCounselor &&
      data.status !== undefined &&
      ['acknowledged', 'in_progress'].includes(data.status) &&
      !existing.assignedCounselorId
    ) {
      update.assignedCounselorId = new mongoose.Types.ObjectId(user.id);
    }
    if (data.counselorNotes !== undefined) update.counselorNotes = data.counselorNotes;
    if (data.urgency !== undefined) update.urgency = data.urgency;

    const referral = await PastoralReferral.findOneAndUpdate(
      { _id: oid, schoolId: schoolOid, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate(REFERRAL_POPULATE)
      .lean();
    if (!referral) throw new NotFoundError('Referral not found');
    return formatReferral(referral);
  }

  static async resolveReferral(
    id: string,
    user: PastoralUser,
    data: ResolveReferralInput,
  ) {
    const schoolOid = new mongoose.Types.ObjectId(user.schoolId!);
    const oid = new mongoose.Types.ObjectId(id);

    const existing = await PastoralReferral.findOne({
      _id: oid,
      schoolId: schoolOid,
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Referral not found');
    assertCanManageReferral(user, existing);

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
          assignedCounselorId: existing.assignedCounselorId ?? new mongoose.Types.ObjectId(user.id),
        },
      },
      { new: true },
    )
      .populate(REFERRAL_POPULATE)
      .lean();
    if (!referral) throw new NotFoundError('Referral not found');
    return formatReferral(referral);
  }
}

export function assertCounselorOrPrincipal(user: PastoralUser): void {
  if (user.role === 'super_admin') return;
  if (user.role === 'school_admin' && user.isSchoolPrincipal) return;
  if (user.role === 'teacher' && user.isCounselor) return;
  throw new ForbiddenError('Counselor or principal access required');
}
