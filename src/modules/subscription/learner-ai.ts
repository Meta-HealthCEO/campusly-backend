// src/modules/subscription/learner-ai.ts
//
// Learner AI for standalone teachers' classrooms (spec §5): a monthly class
// pool shared by the teacher's learners, with a per-learner cap inside it.
// Check before the AI call, record after it succeeds; a failed call is not
// counted; a few messages of overshoot when calls race is accepted.
// School learners (and coach clubs) are never limited or recorded here.
import type { Request } from 'express';
import mongoose from 'mongoose';
import { AIUsage } from './ai-usage.model.js';
import { Subscription } from './model.js';
import { isSubscriptionEntitled } from './entitlements.js';
import { sastMonthWindow } from './ai-allowance.js';
import { isStandaloneLearner } from '../Auth/standalone-learner.js';
import { AppError } from '../../common/errors.js';
import { getUser } from '../../types/authenticated-request.js';

export const LEARNER_TUTOR_POOL_FREE = 100;
export const LEARNER_TUTOR_POOL_PRO = 600;
export const LEARNER_TUTOR_CAP = 60;

export type LearnerAIAction = 'tutor_message' | 'practice_set';

export interface LearnerAIActor { schoolId: string; userId: string; isStandaloneLearner: boolean }

export interface LearnerTutorUsage {
  used: number;
  limit: number;
  pool: { used: number; limit: number };
  resetsAt: Date;
  plan: 'free' | 'pro';
}

const oid = (id: string) => new mongoose.Types.ObjectId(id);

async function planOf(schoolId: string, now: Date): Promise<'free' | 'pro'> {
  const sub = await Subscription.findOne({ schoolId: oid(schoolId) }).select('status currentPeriodEnd trialEndsAt pastDueSince').lean();
  return isSubscriptionEntitled(sub, now) ? 'pro' : 'free';
}

/** The class pool this month for a known plan: every learner row of the school. */
async function poolFor(schoolId: string, plan: 'free' | 'pro', now: Date): Promise<{ used: number; limit: number }> {
  const { start, end } = sastMonthWindow(now);
  const used = await AIUsage.countDocuments({ schoolId: oid(schoolId), scope: 'learner', createdAt: { $gte: start, $lt: end } });
  return { used, limit: plan === 'pro' ? LEARNER_TUTOR_POOL_PRO : LEARNER_TUTOR_POOL_FREE };
}

/** The class pool this month: every learner row of the school. */
export async function learnerPoolUsage(schoolId: string, now: Date = new Date()): Promise<{ used: number; limit: number }> {
  return poolFor(schoolId, await planOf(schoolId, now), now);
}

/** One learner's month and the class pool; the plan is read once (release review M4). */
export async function learnerTutorUsage(schoolId: string, userId: string, now: Date = new Date()): Promise<LearnerTutorUsage> {
  const { start, end } = sastMonthWindow(now);
  const plan = await planOf(schoolId, now);
  const [pool, used] = await Promise.all([
    poolFor(schoolId, plan, now),
    AIUsage.countDocuments({ schoolId: oid(schoolId), scope: 'learner', userId: oid(userId), createdAt: { $gte: start, $lt: end } }),
  ]);
  return { used, limit: LEARNER_TUTOR_CAP, pool, resetsAt: end, plan };
}

export async function learnerAIActorFor(req: Request): Promise<LearnerAIActor> {
  const user = getUser(req);
  return {
    schoolId: String(user.schoolId ?? ''),
    userId: user.id,
    isStandaloneLearner: await isStandaloneLearner({ role: user.role, schoolId: user.schoolId }),
  };
}

/** Refuses when the learner's cap (checked first, ruling R16) or the class pool is used up. */
export async function assertLearnerAIAllowance(actor: LearnerAIActor, now: Date = new Date()): Promise<void> {
  if (!actor.isStandaloneLearner) return;
  const usage = await learnerTutorUsage(actor.schoolId, actor.userId, now);
  const resetsAt = usage.resetsAt.toISOString();
  if (usage.used >= usage.limit) {
    throw new AppError(`You've used your ${usage.limit} tutor messages this month.`, 402, true, {
      code: 'LEARNER_AI_LIMIT', details: { used: usage.used, limit: usage.limit, resetsAt, scope: 'learner' },
    });
  }
  if (usage.pool.used >= usage.pool.limit) {
    throw new AppError("Your class has used this month's tutor messages.", 402, true, {
      code: 'LEARNER_AI_LIMIT', details: { used: usage.pool.used, limit: usage.pool.limit, resetsAt, scope: 'class' },
    });
  }
}

export async function recordLearnerAIUse(actor: LearnerAIActor, action: LearnerAIAction, meta: Record<string, unknown> = {}): Promise<void> {
  if (!actor.isStandaloneLearner) return;
  await AIUsage.create({ schoolId: oid(actor.schoolId), userId: oid(actor.userId), action, scope: 'learner', meta });
}

/** Check, run the AI work, and count it only if it succeeded. */
export async function withLearnerAIAllowance<T>(
  actor: LearnerAIActor, action: LearnerAIAction, run: () => Promise<T>, meta?: Record<string, unknown>,
): Promise<T> {
  await assertLearnerAIAllowance(actor);
  const result = await run();
  await recordLearnerAIUse(actor, action, meta);
  return result;
}
