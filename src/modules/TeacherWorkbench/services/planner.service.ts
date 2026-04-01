import { AssessmentPlan, IAssessmentPlan } from '../model.assessment.js';
import { NotFoundError } from '../../../common/errors.js';

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
  assessments: Array<{ title: string; assessmentType: string; classId: string }>;
}

interface WeightSummary {
  subjectId: string;
  totalPlanned: number;
  byType: Record<string, number>;
}

export class PlannerService {
  static async getPlan(
    classId: string,
    term: number,
    year: number,
    schoolId: string,
  ): Promise<IAssessmentPlan> {
    const plan = await AssessmentPlan.findOne({ classId, term, year, schoolId })
      .populate('subjectId', 'name code')
      .lean()
      .exec();
    if (!plan) throw new NotFoundError('Assessment plan not found');
    return plan as IAssessmentPlan;
  }

  static async createOrUpdatePlan(
    data: CreatePlanData,
    teacherId: string,
  ): Promise<IAssessmentPlan> {
    const { schoolId, classId, subjectId, term, year, plannedAssessments = [] } = data;

    const mapped = plannedAssessments.map((a) => ({
      title: a.title,
      assessmentType: a.assessmentType ?? a.type ?? 'test',
      plannedDate: new Date(a.plannedDate),
      totalMarks: a.totalMarks ?? a.marks ?? 0,
      status: a.status ?? 'planned',
      linkedPaperId: a.linkedPaperId ?? a.assessmentId ?? null,
    }));

    const plan = await AssessmentPlan.findOneAndUpdate(
      { schoolId, classId, subjectId, term, year },
      { $set: { teacherId, plannedAssessments: mapped } },
      { new: true, upsert: true },
    ).lean().exec();

    return plan as IAssessmentPlan;
  }

  static async checkClashes(
    classId: string,
    date: string,
    schoolId: string,
  ): Promise<ClashGroup[]> {
    const plans = await AssessmentPlan.find({ classId, schoolId }).lean().exec();
    const targetDate = new Date(date).toDateString();

    const clashes: ClashGroup[] = [];

    for (const plan of plans) {
      const matching = (plan.plannedAssessments ?? []).filter((a) => {
        return new Date(a.plannedDate).toDateString() === targetDate;
      });

      if (matching.length > 0) {
        clashes.push({
          date: targetDate,
          assessments: matching.map((a) => ({
            title: a.title,
            assessmentType: a.assessmentType,
            classId: String(plan.classId),
          })),
        });
      }
    }

    return clashes;
  }

  static async getWeightings(
    subjectId: string,
    schoolId: string,
  ): Promise<WeightSummary> {
    const plans = await AssessmentPlan.find({ subjectId, schoolId }).lean().exec();

    const byType: Record<string, number> = {};
    let totalPlanned = 0;

    for (const plan of plans) {
      for (const a of plan.plannedAssessments ?? []) {
        const type = a.assessmentType;
        byType[type] = (byType[type] ?? 0) + a.totalMarks;
        totalPlanned += a.totalMarks;
      }
    }

    return { subjectId, totalPlanned, byType };
  }
}
