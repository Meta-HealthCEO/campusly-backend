import mongoose from 'mongoose';
import { SIPPlan, SIPGoal, SIPEvidence, SIPReview } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateSIPPlanInput,
  UpdateSIPPlanInput,
  CreateSIPGoalInput,
  UpdateSIPGoalInput,
  AddEvidenceInput,
  AddReviewInput,
} from './validation.js';

// ─── Plans ───────────────────────────────────────────────────────────────────

export class SIPService {
  static async createPlan(schoolId: string, userId: string, data: CreateSIPPlanInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const plan = await SIPPlan.create({
      schoolId: soid,
      title: data.title,
      year: data.year,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    return plan.toObject();
  }

  static async listPlans(
    schoolId: string,
    filters: { year?: number; status?: string; page?: number; limit?: number },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };
    if (filters.year) query.year = filters.year;
    if (filters.status) query.status = filters.status;

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [plans, total] = await Promise.all([
      SIPPlan.find(query)
        .sort({ year: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName')
        .lean(),
      SIPPlan.countDocuments(query),
    ]);
    return { plans, total, page: filters.page ?? 1, limit };
  }

  static async getPlan(id: string, schoolId: string) {
    const plan = await SIPPlan.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('createdBy', 'firstName lastName')
      .lean();
    if (!plan) throw new NotFoundError('SIP plan not found');
    return plan;
  }

  static async updatePlan(id: string, schoolId: string, data: UpdateSIPPlanInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);
    const update: Record<string, unknown> = {};

    if (data.title !== undefined) update.title = data.title;
    if (data.year !== undefined) update.year = data.year;
    if (data.description !== undefined) update.description = data.description;
    if (data.startDate !== undefined) update.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) update.endDate = new Date(data.endDate);
    if (data.status !== undefined) update.status = data.status;

    const plan = await SIPPlan.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: update },
      { new: true },
    ).lean();
    if (!plan) throw new NotFoundError('SIP plan not found');
    return plan;
  }

  static async deletePlan(id: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);
    const plan = await SIPPlan.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
    if (!plan) throw new NotFoundError('SIP plan not found');
    await SIPPlan.findOneAndUpdate({ _id: oid, schoolId: soid }, { $set: { isDeleted: true } });
    return { success: true };
  }

  // ─── Goals ──────────────────────────────────────────────────────────────

  static async createGoal(sipId: string, schoolId: string, data: CreateSIPGoalInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const sipOid = new mongoose.Types.ObjectId(sipId);

    const plan = await SIPPlan.findOne({ _id: sipOid, schoolId: soid, isDeleted: false }).lean();
    if (!plan) throw new NotFoundError('SIP plan not found');

    const goal = await SIPGoal.create({
      sipId: sipOid,
      schoolId: soid,
      title: data.title,
      description: data.description,
      wseArea: data.wseArea,
      responsiblePersonId: data.responsiblePersonId
        ? new mongoose.Types.ObjectId(data.responsiblePersonId)
        : undefined,
      targetDate: new Date(data.targetDate),
      completionPercent: data.completionPercent ?? 0,
      priority: data.priority ?? 'medium',
    });
    return goal.toObject();
  }

  static async updateGoal(goalId: string, schoolId: string, data: UpdateSIPGoalInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(goalId);
    const update: Record<string, unknown> = {};

    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.wseArea !== undefined) update.wseArea = data.wseArea;
    if (data.responsiblePersonId !== undefined) {
      update.responsiblePersonId = new mongoose.Types.ObjectId(data.responsiblePersonId);
    }
    if (data.targetDate !== undefined) update.targetDate = new Date(data.targetDate);
    if (data.completionPercent !== undefined) update.completionPercent = data.completionPercent;
    if (data.status !== undefined) update.status = data.status;
    if (data.priority !== undefined) update.priority = data.priority;

    const goal = await SIPGoal.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: update },
      { new: true },
    ).lean();
    if (!goal) throw new NotFoundError('SIP goal not found');
    return goal;
  }

  // ─── Evidence ────────────────────────────────────────────────────────────

  static async addEvidence(goalId: string, schoolId: string, userId: string, data: AddEvidenceInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const goalOid = new mongoose.Types.ObjectId(goalId);

    const goal = await SIPGoal.findOne({ _id: goalOid, schoolId: soid, isDeleted: false }).lean();
    if (!goal) throw new NotFoundError('SIP goal not found');

    const evidence = await SIPEvidence.create({
      goalId: goalOid,
      schoolId: soid,
      title: data.title,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      uploadedBy: new mongoose.Types.ObjectId(userId),
    });
    return evidence.toObject();
  }

  static async listEvidence(goalId: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const goalOid = new mongoose.Types.ObjectId(goalId);

    const goal = await SIPGoal.findOne({ _id: goalOid, schoolId: soid, isDeleted: false }).lean();
    if (!goal) throw new NotFoundError('SIP goal not found');

    return SIPEvidence.find({ goalId: goalOid, schoolId: soid, isDeleted: false })
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
  }

  // ─── Reviews ─────────────────────────────────────────────────────────────

  static async addReview(goalId: string, schoolId: string, userId: string, data: AddReviewInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const goalOid = new mongoose.Types.ObjectId(goalId);

    const goal = await SIPGoal.findOne({ _id: goalOid, schoolId: soid, isDeleted: false }).lean();
    if (!goal) throw new NotFoundError('SIP goal not found');

    const review = await SIPReview.create({
      goalId: goalOid,
      schoolId: soid,
      quarter: data.quarter,
      year: data.year,
      notes: data.notes,
      completionPercent: data.completionPercent,
      reviewedBy: new mongoose.Types.ObjectId(userId),
    });

    // Update goal completion percent from latest review
    await SIPGoal.findOneAndUpdate(
      { _id: goalOid, schoolId: soid },
      { $set: { completionPercent: data.completionPercent } },
    );

    return review.toObject();
  }

  static async listReviews(goalId: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const goalOid = new mongoose.Types.ObjectId(goalId);

    const goal = await SIPGoal.findOne({ _id: goalOid, schoolId: soid, isDeleted: false }).lean();
    if (!goal) throw new NotFoundError('SIP goal not found');

    return SIPReview.find({ goalId: goalOid, schoolId: soid, isDeleted: false })
      .populate('reviewedBy', 'firstName lastName')
      .sort({ year: -1, quarter: -1 })
      .lean();
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────

  static async getDashboard(schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);

    const [plans, goals] = await Promise.all([
      SIPPlan.find({ schoolId: soid, isDeleted: false }).lean(),
      SIPGoal.find({ schoolId: soid, isDeleted: false }).lean(),
    ]);

    const statusCounts = goals.reduce<Record<string, number>>((acc, g) => {
      acc[g.status] = (acc[g.status] ?? 0) + 1;
      return acc;
    }, {});

    // RAG per WSE area: red < 30%, amber 30-70%, green > 70%
    const wseAreas: Record<number, { count: number; totalPercent: number; rag: string }> = {};
    for (let i = 1; i <= 9; i++) {
      wseAreas[i] = { count: 0, totalPercent: 0, rag: 'green' };
    }

    for (const g of goals) {
      const area = wseAreas[g.wseArea];
      if (area) {
        area.count += 1;
        area.totalPercent += g.completionPercent;
      }
    }

    for (const area of Object.values(wseAreas)) {
      if (area.count === 0) {
        area.rag = 'grey';
      } else {
        const avg = area.totalPercent / area.count;
        area.rag = avg < 30 ? 'red' : avg < 70 ? 'amber' : 'green';
      }
    }

    const overallPercent =
      goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + g.completionPercent, 0) / goals.length)
        : 0;

    return {
      planCount: plans.length,
      goalCount: goals.length,
      statusCounts,
      overallPercent,
      wseAreas,
    };
  }
}

// ─── Guard: plan ownership helper ────────────────────────────────────────────

export async function assertPlanBelongsToSchool(sipId: string, schoolId: string) {
  const plan = await SIPPlan.findOne({
    _id: new mongoose.Types.ObjectId(sipId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  }).lean();
  if (!plan) throw new BadRequestError('SIP plan not found or does not belong to this school');
  return plan;
}
