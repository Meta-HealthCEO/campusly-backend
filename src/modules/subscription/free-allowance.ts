import mongoose from 'mongoose';
import { AssessmentPaper } from '../QuestionBank/model-papers.js';
import { Course } from '../Course/model.js';

/**
 * Free-plan teachers can try AI paper generation this many times before the
 * card-required Pro trial. Counted from the papers themselves (including
 * soft-deleted ones, so delete-and-regenerate doesn't reset it); a failed
 * generation creates no paper and so costs nothing.
 */
export const FREE_PAPER_GENERATIONS = 3;

/** Free-plan teachers can outline this many class units with AI (counted the same way). */
export const FREE_COURSE_UNITS = 2;

interface AllowanceCount { limit: number; used: number; remaining: number }

export interface FreeAllowance {
  paperGenerations: AllowanceCount;
  courseUnits: AllowanceCount;
}

const count = (limit: number, used: number): AllowanceCount => ({ limit, used, remaining: Math.max(0, limit - used) });

export async function getFreeAllowance(schoolId: string): Promise<FreeAllowance> {
  const soid = new mongoose.Types.ObjectId(schoolId);
  const [papers, units] = await Promise.all([
    AssessmentPaper.countDocuments({ schoolId: soid, aiGenerated: true }),
    Course.countDocuments({ schoolId: soid, aiGenerated: true }),
  ]);
  return {
    paperGenerations: count(FREE_PAPER_GENERATIONS, papers),
    courseUnits: count(FREE_COURSE_UNITS, units),
  };
}
