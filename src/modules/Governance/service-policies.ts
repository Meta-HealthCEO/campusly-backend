import mongoose from 'mongoose';
import { Policy, PolicyAcknowledgement } from './model.js';
import { NotFoundError, ConflictError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreatePolicyInput, UpdatePolicyInput } from './validation.js';

export class PolicyService {
  static async createPolicy(schoolId: string, userId: string, data: CreatePolicyInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const policy = await Policy.create({
      schoolId: soid,
      title: data.title,
      category: data.category,
      content: data.content,
      fileUrl: data.fileUrl,
      status: data.status ?? 'draft',
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    return policy.toObject();
  }

  static async listPolicies(
    schoolId: string,
    filters: { category?: string; status?: string; page?: number; limit?: number },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };
    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [policies, total] = await Promise.all([
      Policy.find(query)
        .select('-previousVersions')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName')
        .populate('lastReviewedBy', 'firstName lastName')
        .lean(),
      Policy.countDocuments(query),
    ]);
    return { policies, total, page: filters.page ?? 1, limit };
  }

  static async getPolicy(id: string, schoolId: string) {
    const policy = await Policy.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('createdBy', 'firstName lastName')
      .populate('lastReviewedBy', 'firstName lastName')
      .lean();
    if (!policy) throw new NotFoundError('Policy not found');
    return policy;
  }

  static async updatePolicy(id: string, schoolId: string, userId: string, data: UpdatePolicyInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);

    const existing = await Policy.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
    if (!existing) throw new NotFoundError('Policy not found');

    const update: Record<string, unknown> = {};
    const contentOrFileChanged = data.content !== undefined || data.fileUrl !== undefined;

    // Archive current version in previousVersions before updating content/file
    if (contentOrFileChanged) {
      const versionEntry = {
        version: existing.version,
        content: existing.content,
        fileUrl: existing.fileUrl,
        updatedAt: new Date(),
        updatedBy: new mongoose.Types.ObjectId(userId),
      };
      update.$push = { previousVersions: versionEntry };
      update['version'] = existing.version + 1;
    }

    const $setFields: Record<string, unknown> = {};
    if (data.title !== undefined) $setFields.title = data.title;
    if (data.category !== undefined) $setFields.category = data.category;
    if (data.content !== undefined) $setFields.content = data.content;
    if (data.fileUrl !== undefined) $setFields.fileUrl = data.fileUrl;
    if (data.status !== undefined) {
      $setFields.status = data.status;
      if (data.status === 'active') {
        $setFields.lastReviewedAt = new Date();
        $setFields.lastReviewedBy = new mongoose.Types.ObjectId(userId);
      }
    }
    if (data.reviewDate !== undefined) $setFields.reviewDate = new Date(data.reviewDate);
    if (contentOrFileChanged) $setFields['version'] = existing.version + 1;

    const mongoUpdate: Record<string, unknown> = { $set: $setFields };
    if (contentOrFileChanged) {
      mongoUpdate.$push = {
        previousVersions: {
          version: existing.version,
          content: existing.content,
          fileUrl: existing.fileUrl,
          updatedAt: new Date(),
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      };
    }

    const policy = await Policy.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      mongoUpdate,
      { new: true },
    ).lean();
    if (!policy) throw new NotFoundError('Policy not found');
    return policy;
  }

  static async deletePolicy(id: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);
    const policy = await Policy.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
    if (!policy) throw new NotFoundError('Policy not found');
    await Policy.findOneAndUpdate({ _id: oid, schoolId: soid }, { $set: { isDeleted: true } });
    return { success: true };
  }

  // ─── Acknowledgements ────────────────────────────────────────────────────

  static async acknowledgePolicy(policyId: string, schoolId: string, userId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const pOid = new mongoose.Types.ObjectId(policyId);
    const uOid = new mongoose.Types.ObjectId(userId);

    const policy = await Policy.findOne({ _id: pOid, schoolId: soid, isDeleted: false }).lean();
    if (!policy) throw new NotFoundError('Policy not found');

    const existing = await PolicyAcknowledgement.findOne({
      policyId: pOid,
      userId: uOid,
      isDeleted: false,
    }).lean();
    if (existing) throw new ConflictError('Policy already acknowledged');

    const ack = await PolicyAcknowledgement.create({
      policyId: pOid,
      schoolId: soid,
      userId: uOid,
      acknowledgedAt: new Date(),
      version: policy.version,
    });
    return ack.toObject();
  }

  static async getAcknowledgements(policyId: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const pOid = new mongoose.Types.ObjectId(policyId);

    const policy = await Policy.findOne({ _id: pOid, schoolId: soid, isDeleted: false }).lean();
    if (!policy) throw new NotFoundError('Policy not found');

    return PolicyAcknowledgement.find({ policyId: pOid, schoolId: soid, isDeleted: false })
      .populate('userId', 'firstName lastName email')
      .sort({ acknowledgedAt: -1 })
      .lean();
  }

  static async getPendingAcknowledgements(schoolId: string, userId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uOid = new mongoose.Types.ObjectId(userId);

    const activePolicies = await Policy.find({
      schoolId: soid,
      status: 'active',
      isDeleted: false,
    })
      .select('_id title category version')
      .lean();

    const policyIds = activePolicies.map((p) => p._id);

    const acknowledged = await PolicyAcknowledgement.find({
      policyId: { $in: policyIds },
      userId: uOid,
      isDeleted: false,
    })
      .select('policyId version')
      .lean();

    const acknowledgedMap = new Set(acknowledged.map((a) => String(a.policyId)));

    const pending = activePolicies.filter((p) => !acknowledgedMap.has(String(p._id)));
    return pending;
  }
}
