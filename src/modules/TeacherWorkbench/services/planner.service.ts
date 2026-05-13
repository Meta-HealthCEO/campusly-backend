import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../../../common/errors.js';
import { Class, Subject, SubjectWeighting } from '../../Academic/model.js';
import { AssessmentPlan, IAssessmentPlan } from '../model.assessment.js';

interface PlannedAssessmentItem {
  title: string;
  type?: string;
  assessmentType?: string;
  plannedDate: string;
  marks?: number;
  totalMarks?: number;
  weight?: number;
  topicIds?: string[];
  assessmentId?: string | null;
  linkedPaperId?: string | null;
  status?: string;
}

interface CreatePlanData {
  schoolId: string;
  subjectId: string;
  classId: string;
  term: number;
  year: number;
  plannedAssessments?: PlannedAssessmentItem[];
}

interface ClashGroup {
  date: string;
  assessments: Array<{
    title: string;
    subjectName: string;
    type: string;
    classId: string;
  }>;
}

interface WeightingFilters {
  classId?: string;
  term?: number;
  year?: number;
}

interface WeightSummary {
  subjectId: string;
  subjectName: string;
  totalWeight: number;
  totalRequiredWeight: number;
  assessmentCount: number;
  byType: Record<string, number>;
  requiredByType: Record<string, number>;
}

function toObjectId(value: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(value);
}

function normalizeDate(value: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestError('Invalid planned assessment date');
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function toIsoDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

export class PlannerService {
  static async getPlan(
    classId: string,
    term: number,
    year: number,
    schoolId: string,
    subjectId?: string,
  ): Promise<IAssessmentPlan | null> {
    const query: Record<string, unknown> = {
      classId,
      term,
      year,
      schoolId,
      isDeleted: false,
    };
    if (subjectId) query.subjectId = subjectId;

    const plan = await AssessmentPlan.findOne(query)
      .populate('subjectId', 'name code')
      .lean()
      .exec();
    return plan as IAssessmentPlan | null;
  }

  static async createOrUpdatePlan(
    data: CreatePlanData,
    teacherId: string,
  ): Promise<IAssessmentPlan> {
    const { schoolId, classId, subjectId, term, year, plannedAssessments = [] } = data;

    const [classExists, subjectExists] = await Promise.all([
      Class.exists({ _id: classId, schoolId, isDeleted: false }),
      Subject.exists({ _id: subjectId, schoolId, isDeleted: false }),
    ]);

    if (!classExists) throw new NotFoundError('Class not found');
    if (!subjectExists) throw new NotFoundError('Subject not found');

    const mapped = plannedAssessments
      .map((assessment) => ({
        title: assessment.title.trim(),
        assessmentType: assessment.assessmentType ?? assessment.type ?? 'test',
        plannedDate: normalizeDate(assessment.plannedDate),
        totalMarks: assessment.totalMarks ?? assessment.marks ?? 0,
        weight: assessment.weight ?? 0,
        topicIds: (assessment.topicIds ?? []).map(toObjectId),
        status: assessment.status ?? 'planned',
        linkedPaperId: assessment.linkedPaperId ?? assessment.assessmentId ?? null,
      }))
      .sort((a, b) => a.plannedDate.getTime() - b.plannedDate.getTime());

    const plan = await AssessmentPlan.findOneAndUpdate(
      { schoolId, classId, subjectId, term, year, isDeleted: false },
      {
        $setOnInsert: { schoolId, classId, subjectId, term, year },
        $set: { teacherId, plannedAssessments: mapped },
      },
      { new: true, upsert: true, runValidators: true },
    ).lean().exec();

    return plan as IAssessmentPlan;
  }

  static async checkClashes(
    classId: string,
    date: string,
    schoolId: string,
  ): Promise<ClashGroup[]> {
    const targetDate = normalizeDate(date);
    const plans = await AssessmentPlan.find({ classId, schoolId, isDeleted: false })
      .populate('subjectId', 'name code')
      .lean()
      .exec();

    const assessments: ClashGroup['assessments'] = [];

    for (const plan of plans) {
      const subject = plan.subjectId as unknown as { name?: string; code?: string } | undefined;
      const subjectName = [subject?.name, subject?.code ? `(${subject.code})` : '']
        .filter(Boolean)
        .join(' ');

      for (const assessment of plan.plannedAssessments ?? []) {
        if (normalizeDate(String(assessment.plannedDate)).getTime() !== targetDate.getTime()) continue;
        assessments.push({
          title: assessment.title,
          subjectName: subjectName || 'Unknown subject',
          type: assessment.assessmentType,
          classId: String(plan.classId),
        });
      }
    }

    return assessments.length > 0
      ? [{ date: toIsoDate(targetDate), assessments }]
      : [];
  }

  static async getWeightings(
    subjectId: string,
    schoolId: string,
    filters: WeightingFilters = {},
  ): Promise<WeightSummary> {
    const query: Record<string, unknown> = { subjectId, schoolId, isDeleted: false };
    if (filters.classId) query.classId = filters.classId;
    if (filters.term) query.term = filters.term;
    if (filters.year) query.year = filters.year;

    const [subject, plans, classInfo] = await Promise.all([
      Subject.findOne({ _id: subjectId, schoolId, isDeleted: false }).select('name code').lean(),
      AssessmentPlan.find(query).lean().exec(),
      filters.classId
        ? Class.findOne({ _id: filters.classId, schoolId, isDeleted: false }).select('gradeId').lean()
        : null,
    ]);

    if (!subject) throw new NotFoundError('Subject not found');

    const byType: Record<string, number> = {};
    let totalWeight = 0;
    let assessmentCount = 0;

    for (const plan of plans) {
      for (const assessment of plan.plannedAssessments ?? []) {
        const type = assessment.assessmentType;
        const weight = Number(assessment.weight) || 0;
        byType[type] = (byType[type] ?? 0) + weight;
        totalWeight += weight;
        assessmentCount += 1;
      }
    }

    const requiredByType: Record<string, number> = {};
    if (classInfo?.gradeId && filters.term) {
      const required = await SubjectWeighting.find({
        subjectId,
        schoolId,
        gradeId: classInfo.gradeId,
        term: filters.term,
        isDeleted: false,
      }).lean().exec();

      for (const item of required) {
        requiredByType[item.assessmentType] =
          (requiredByType[item.assessmentType] ?? 0) + Number(item.weightPercentage);
      }
    }

    const totalRequiredWeight = Object.values(requiredByType).reduce((sum, value) => sum + value, 0);

    return {
      subjectId,
      subjectName: [subject.name, subject.code ? `(${subject.code})` : ''].filter(Boolean).join(' '),
      totalWeight,
      totalRequiredWeight,
      assessmentCount,
      byType,
      requiredByType,
    };
  }
}
