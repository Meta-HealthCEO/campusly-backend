import { SchoolImprovementPlan } from './model.js';
import type { ISchoolImprovementPlan } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import type { UpsertSipInput } from './validation.js';
import { logger } from '../../common/logger.js';

export class SgbSipService {
  static async getSip(schoolId: string, year: number): Promise<ISchoolImprovementPlan> {
    const sip = await SchoolImprovementPlan.findOne({
      schoolId,
      year,
      isDeleted: false,
    }).lean();

    if (!sip) {
      throw new NotFoundError('School improvement plan not found for this year');
    }

    return sip as ISchoolImprovementPlan;
  }

  static async upsertSip(
    schoolId: string,
    data: UpsertSipInput,
  ): Promise<ISchoolImprovementPlan> {
    // Calculate progress for each goal
    const goalsWithProgress = data.goals.map((goal) => {
      const completed = goal.milestones.filter((m) => m.status === 'completed').length;
      const total = goal.milestones.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { ...goal, progress };
    });

    // Calculate overall progress
    const overallProgress = goalsWithProgress.length > 0
      ? Math.round(goalsWithProgress.reduce((sum, g) => sum + g.progress, 0) / goalsWithProgress.length)
      : 0;

    const sip = await SchoolImprovementPlan.findOneAndUpdate(
      { schoolId, year: data.year },
      {
        $set: {
          goals: goalsWithProgress,
          overallProgress,
          isDeleted: false,
        },
      },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    logger.info({ schoolId, year: data.year }, 'School improvement plan upserted');
    return sip as ISchoolImprovementPlan;
  }
}
