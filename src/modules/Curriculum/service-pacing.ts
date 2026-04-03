import mongoose from 'mongoose';
import { CurriculumPlan, CurriculumIntervention } from './model.js';
import { computePacingMetrics } from './service-plans.js';

interface OverviewFilters {
  term?: number;
  year?: number;
  departmentId?: string;
}

interface SubjectSummary {
  subjectId: string;
  subjectName: string;
  plans: PlanSummary[];
  avgPacingPercent: number;
  avgExpectedPercent: number;
  overallStatus: 'green' | 'amber' | 'red';
}

interface PlanSummary {
  planId: string;
  gradeId: string;
  gradeName: string;
  term: number;
  year: number;
  totalTopics: number;
  completedTopics: number;
  pacingPercent: number;
  expectedPercent: number;
  pacingStatus: 'green' | 'amber' | 'red';
}

export class PacingService {
  static async getOverview(schoolId: string, filters: OverviewFilters) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };

    if (filters.term) query.term = filters.term;
    if (filters.year) query.year = filters.year;

    // HOD filter: if departmentId provided, only include subjects in that department
    // We filter by subjects that reference this department.
    // We populate subjectId and then post-filter, since Subject may have a departmentId field.
    let plans = await CurriculumPlan.find(query)
      .populate<{ subjectId: { _id: mongoose.Types.ObjectId; name: string; departmentId?: mongoose.Types.ObjectId } }>(
        'subjectId',
        'name code departmentId',
      )
      .populate<{ gradeId: { _id: mongoose.Types.ObjectId; name: string; level: number } }>(
        'gradeId',
        'name level',
      )
      .lean();

    if (filters.departmentId) {
      const deptOid = new mongoose.Types.ObjectId(filters.departmentId);
      plans = plans.filter((p) => {
        const subject = p.subjectId as { departmentId?: mongoose.Types.ObjectId } | null;
        if (!subject || !subject.departmentId) return false;
        return String(subject.departmentId) === String(deptOid);
      });
    }

    // Count summary statistics
    let greenCount = 0;
    let amberCount = 0;
    let redCount = 0;

    const subjectMap = new Map<string, SubjectSummary>();

    for (const plan of plans) {
      const { pacingPercent, expectedPercent, pacingStatus } = computePacingMetrics(plan.topics);

      if (pacingStatus === 'green') greenCount++;
      else if (pacingStatus === 'amber') amberCount++;
      else redCount++;

      const subjectId = String(plan.subjectId._id);
      const subjectName = (plan.subjectId as { name?: string }).name ?? 'Unknown';
      const gradeId = String(plan.gradeId._id);
      const gradeName = (plan.gradeId as { name?: string }).name ?? 'Unknown';

      const planSummary: PlanSummary = {
        planId: String(plan._id),
        gradeId,
        gradeName,
        term: plan.term,
        year: plan.year,
        totalTopics: plan.topics.length,
        completedTopics: plan.topics.filter((t) => t.status === 'completed').length,
        pacingPercent,
        expectedPercent,
        pacingStatus,
      };

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subjectId,
          subjectName,
          plans: [],
          avgPacingPercent: 0,
          avgExpectedPercent: 0,
          overallStatus: 'green',
        });
      }
      subjectMap.get(subjectId)!.plans.push(planSummary);
    }

    // Compute subject-level averages and overall status
    for (const subjectSummary of subjectMap.values()) {
      const n = subjectSummary.plans.length;
      const totalPacing = subjectSummary.plans.reduce((s, p) => s + p.pacingPercent, 0);
      const totalExpected = subjectSummary.plans.reduce((s, p) => s + p.expectedPercent, 0);
      subjectSummary.avgPacingPercent = n > 0 ? Math.round(totalPacing / n) : 0;
      subjectSummary.avgExpectedPercent = n > 0 ? Math.round(totalExpected / n) : 0;

      const hasRed = subjectSummary.plans.some((p) => p.pacingStatus === 'red');
      const hasAmber = subjectSummary.plans.some((p) => p.pacingStatus === 'amber');
      subjectSummary.overallStatus = hasRed ? 'red' : hasAmber ? 'amber' : 'green';
    }

    // Fetch active interventions count
    const activeInterventions = await CurriculumIntervention.countDocuments({
      schoolId: soid,
      status: 'active',
      isDeleted: false,
    });

    return {
      summary: {
        totalPlans: plans.length,
        greenCount,
        amberCount,
        redCount,
        activeInterventions,
      },
      bySubject: Array.from(subjectMap.values()),
    };
  }
}
