import mongoose from 'mongoose';
import { CurriculumPlan, CurriculumIntervention } from './model.js';
import { NotFoundError, ConflictError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreatePlanInput, UpdatePlanInput } from './validation.js';

// ─── Pacing helpers ───────────────────────────────────────────────────────────

function computePacingMetrics(topics: { status: string; expectedEndDate: Date }[]) {
  const today = new Date();
  const totalTopics = topics.length;
  if (totalTopics === 0) {
    return { pacingPercent: 0, expectedPercent: 0, pacingStatus: 'green' as const };
  }

  const completedTopics = topics.filter((t) => t.status === 'completed').length;
  const expectedDoneTopics = topics.filter(
    (t) => new Date(t.expectedEndDate) <= today,
  ).length;

  const pacingPercent = Math.round((completedTopics / totalTopics) * 100);
  const expectedPercent = Math.round((expectedDoneTopics / totalTopics) * 100);

  let pacingStatus: 'green' | 'amber' | 'red' = 'green';
  if (expectedPercent > 0) {
    const ratio = pacingPercent / expectedPercent;
    if (ratio < 0.7) pacingStatus = 'red';
    else if (ratio < 0.9) pacingStatus = 'amber';
    else pacingStatus = 'green';
  }

  return { pacingPercent, expectedPercent, pacingStatus };
}

// ─── PlansService ─────────────────────────────────────────────────────────────

export class PlansService {
  static async createPlan(schoolId: string, data: CreatePlanInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const subjectOid = new mongoose.Types.ObjectId(data.subjectId);
    const gradeOid = new mongoose.Types.ObjectId(data.gradeId);

    const existing = await CurriculumPlan.findOne({
      schoolId: soid,
      subjectId: subjectOid,
      gradeId: gradeOid,
      term: data.term,
      year: data.year,
      isDeleted: false,
    }).lean();
    if (existing) {
      throw new ConflictError('A curriculum plan already exists for this subject, grade, term, and year');
    }

    const topics = data.topics.map((t) => ({
      title: t.title,
      description: t.description ?? '',
      weekNumber: t.weekNumber,
      expectedStartDate: new Date(t.expectedStartDate),
      expectedEndDate: new Date(t.expectedEndDate),
      capsReference: t.capsReference ?? '',
      status: t.status ?? 'not_started',
      completedDate: t.completedDate ? new Date(t.completedDate) : null,
      percentComplete: t.percentComplete ?? 0,
    }));

    const plan = await CurriculumPlan.create({
      schoolId: soid,
      subjectId: subjectOid,
      gradeId: gradeOid,
      term: data.term,
      year: data.year,
      topics,
    });
    return plan.toObject();
  }

  static async listPlans(
    schoolId: string,
    filters: {
      subjectId?: string;
      gradeId?: string;
      term?: number;
      year?: number;
      page?: number;
      limit?: number;
    },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };
    if (filters.subjectId) query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    if (filters.gradeId) query.gradeId = new mongoose.Types.ObjectId(filters.gradeId);
    if (filters.term) query.term = filters.term;
    if (filters.year) query.year = filters.year;

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [rawPlans, total] = await Promise.all([
      CurriculumPlan.find(query)
        .sort({ year: -1, term: 1 })
        .skip(skip)
        .limit(limit)
        .populate('subjectId', 'name code')
        .populate('gradeId', 'name level')
        .lean(),
      CurriculumPlan.countDocuments(query),
    ]);

    const plans = rawPlans.map((p) => {
      const { pacingPercent, expectedPercent, pacingStatus } = computePacingMetrics(p.topics);
      return { ...p, pacingPercent, expectedPercent, pacingStatus };
    });

    return { plans, total, page: filters.page ?? 1, limit };
  }

  static async getPlan(id: string, schoolId: string) {
    const plan = await CurriculumPlan.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name level')
      .lean();
    if (!plan) throw new NotFoundError('Curriculum plan not found');

    const { pacingPercent, expectedPercent, pacingStatus } = computePacingMetrics(plan.topics);
    return { ...plan, pacingPercent, expectedPercent, pacingStatus };
  }

  static async updatePlan(id: string, schoolId: string, data: UpdatePlanInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);

    const topics = data.topics.map((t) => ({
      title: t.title,
      description: t.description ?? '',
      weekNumber: t.weekNumber,
      expectedStartDate: new Date(t.expectedStartDate),
      expectedEndDate: new Date(t.expectedEndDate),
      capsReference: t.capsReference ?? '',
      status: t.status ?? 'not_started',
      completedDate: t.completedDate ? new Date(t.completedDate) : null,
      percentComplete: t.percentComplete ?? 0,
    }));

    const plan = await CurriculumPlan.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { topics } },
      { new: true },
    )
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name level')
      .lean();
    if (!plan) throw new NotFoundError('Curriculum plan not found');

    const { pacingPercent, expectedPercent, pacingStatus } = computePacingMetrics(plan.topics);
    return { ...plan, pacingPercent, expectedPercent, pacingStatus };
  }

  static async deletePlan(id: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);
    const plan = await CurriculumPlan.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
    if (!plan) throw new NotFoundError('Curriculum plan not found');

    await Promise.all([
      CurriculumPlan.findOneAndUpdate({ _id: oid, schoolId: soid }, { $set: { isDeleted: true } }),
      CurriculumIntervention.updateMany(
        { planId: oid, schoolId: soid, isDeleted: false },
        { $set: { isDeleted: true } },
      ),
    ]);
    return { success: true };
  }
}

export { computePacingMetrics };
