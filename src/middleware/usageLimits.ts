import mongoose from 'mongoose';
import { School } from '../modules/School/model.js';
import { Student } from '../modules/Student/model.js';
import { ContentResource } from '../modules/ContentLibrary/model.js';
import { Question, AssessmentPaper } from '../modules/QuestionBank/model.js';
import { GradingJob } from '../modules/AITools/model.js';

// ─── Tier Limits ─────────────────────────────────────────────────────────────

export const FREE_TIER_LIMITS = {
  maxStudents: 50,
  maxAiGenerationsPerDay: 10,
  maxContentResources: 100,
  maxQuestions: 200,
  maxPapers: 20,
  maxPaperMarkingsPerDay: 5,
} as const;

export const PAID_TIER_LIMITS = {
  maxStudents: Infinity,
  maxAiGenerationsPerDay: 100,
  maxContentResources: Infinity,
  maxQuestions: Infinity,
  maxPapers: Infinity,
  maxPaperMarkingsPerDay: 50,
} as const;

export type LimitType = keyof typeof FREE_TIER_LIMITS;

// ─── Plan Detection ───────────────────────────────────────────────────────────

/**
 * A school is considered "paid" if it has an active subscription that has not
 * yet expired.  Any tier (basic / standard / premium) counts as paid.
 */
async function isPaidPlan(schoolId: string): Promise<boolean> {
  const school = await School.findOne(
    { _id: schoolId, isDeleted: false },
    { subscription: 1 },
  ).lean();

  if (!school?.subscription) return false;

  const { tier, expiresAt } = school.subscription;
  const validTiers: string[] = ['basic', 'standard', 'premium'];
  if (!expiresAt) return false;
  return validTiers.includes(tier) && new Date(expiresAt) > new Date();
}

// ─── Usage Counts ─────────────────────────────────────────────────────────────

async function countStudents(schoolId: string): Promise<number> {
  return Student.countDocuments({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
}

async function countContentResources(schoolId: string): Promise<number> {
  return ContentResource.countDocuments({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
}

async function countQuestions(schoolId: string): Promise<number> {
  return Question.countDocuments({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
}

async function countPapers(schoolId: string): Promise<number> {
  return AssessmentPaper.countDocuments({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
}

async function countAiGenerationsToday(schoolId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return ContentResource.countDocuments({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    source: 'ai_generated',
    createdAt: { $gte: startOfDay },
    isDeleted: false,
  });
}

async function countPaperMarkingsToday(schoolId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return GradingJob.countDocuments({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    createdAt: { $gte: startOfDay },
    isDeleted: false,
  });
}

// ─── Check Usage Limit ────────────────────────────────────────────────────────

export interface UsageLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  plan: 'free' | 'paid';
}

export async function checkUsageLimit(
  schoolId: string,
  limitType: LimitType,
): Promise<UsageLimitResult> {
  const paid = await isPaidPlan(schoolId);
  const plan: 'free' | 'paid' = paid ? 'paid' : 'free';
  const limits = paid ? PAID_TIER_LIMITS : FREE_TIER_LIMITS;
  const limit = limits[limitType];

  let current = 0;

  switch (limitType) {
    case 'maxStudents':
      current = await countStudents(schoolId);
      break;
    case 'maxAiGenerationsPerDay':
      current = await countAiGenerationsToday(schoolId);
      break;
    case 'maxContentResources':
      current = await countContentResources(schoolId);
      break;
    case 'maxQuestions':
      current = await countQuestions(schoolId);
      break;
    case 'maxPapers':
      current = await countPapers(schoolId);
      break;
    case 'maxPaperMarkingsPerDay':
      current = await countPaperMarkingsToday(schoolId);
      break;
  }

  return {
    allowed: limit === Infinity || current < limit,
    current,
    limit: limit === Infinity ? -1 : limit,
    plan,
  };
}

// ─── Full Usage Snapshot ─────────────────────────────────────────────────────

export interface UsageSnapshot {
  plan: 'free' | 'paid';
  usage: {
    students: { current: number; limit: number };
    aiGenerations: { current: number; limit: number };
    resources: { current: number; limit: number };
    questions: { current: number; limit: number };
    papers: { current: number; limit: number };
    paperMarkings: { current: number; limit: number };
  };
}

export async function getUsageSnapshot(schoolId: string): Promise<UsageSnapshot> {
  const paid = await isPaidPlan(schoolId);
  const plan: 'free' | 'paid' = paid ? 'paid' : 'free';
  const limits = paid ? PAID_TIER_LIMITS : FREE_TIER_LIMITS;

  const toLimit = (n: number) => (n === Infinity ? -1 : n);

  const [students, aiGenerations, resources, questions, papers, paperMarkings] =
    await Promise.all([
      countStudents(schoolId),
      countAiGenerationsToday(schoolId),
      countContentResources(schoolId),
      countQuestions(schoolId),
      countPapers(schoolId),
      countPaperMarkingsToday(schoolId),
    ]);

  return {
    plan,
    usage: {
      students: { current: students, limit: toLimit(limits.maxStudents) },
      aiGenerations: { current: aiGenerations, limit: toLimit(limits.maxAiGenerationsPerDay) },
      resources: { current: resources, limit: toLimit(limits.maxContentResources) },
      questions: { current: questions, limit: toLimit(limits.maxQuestions) },
      papers: { current: papers, limit: toLimit(limits.maxPapers) },
      paperMarkings: { current: paperMarkings, limit: toLimit(limits.maxPaperMarkingsPerDay) },
    },
  };
}
