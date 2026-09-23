import mongoose from 'mongoose';
import { AssessmentPaper } from '../QuestionBank/model-papers.js';

/**
 * Free-plan teachers can try AI paper generation this many times before the
 * card-required Pro trial. Counted from the papers themselves (including
 * soft-deleted ones, so delete-and-regenerate doesn't reset it); a failed
 * generation creates no paper and so costs nothing.
 */
export const FREE_PAPER_GENERATIONS = 3;

export interface FreeAllowance {
  paperGenerations: { limit: number; used: number; remaining: number };
}

export async function getFreeAllowance(schoolId: string): Promise<FreeAllowance> {
  const used = await AssessmentPaper.countDocuments({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    aiGenerated: true,
  });
  return {
    paperGenerations: {
      limit: FREE_PAPER_GENERATIONS,
      used,
      remaining: Math.max(0, FREE_PAPER_GENERATIONS - used),
    },
  };
}
