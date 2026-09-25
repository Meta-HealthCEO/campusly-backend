// src/modules/subscription/ai-allowance.ts
//
// One monthly AI allowance for standalone teachers: every AI action reachable
// from their portal checks the allowance before spending and records one row
// in AIUsage after it succeeds. A failed AI call records nothing. School
// (non-standalone) users are never limited or recorded here.
//
// Two actions racing at the last slot may both pass (overshoot bounded by the
// concurrency); not worth a lock.

import type { Request } from 'express';
import mongoose from 'mongoose';
import { AIUsage } from './ai-usage.model.js';
import { Subscription } from './model.js';
import { isSubscriptionEntitled } from './entitlements.js';
import { User } from '../Auth/model.js';
import { AppError } from '../../common/errors.js';
import { getUser } from '../../types/authenticated-request.js';

export const FREE_AI_ACTIONS_PER_MONTH = 20;
export const PRO_AI_ACTIONS_PER_MONTH = 500;

export const AI_ACTIONS = [
  'unit_outline', 'unit_build', 'unit_rewrite', 'revision_item', 'paper', 'paper_regenerate',
  'homework_draft', 'homework_regrade', 'project_draft', 'marking', 'memo',
] as const;
export type AIAction = (typeof AI_ACTIONS)[number];

export interface AIActor {
  schoolId: string;
  userId: string;
  isStandaloneTeacher: boolean;
  emailVerifiedAt?: Date | null;
}

export interface AIAllowance {
  used: number;
  limit: number;
  resetsAt: Date;
  plan: 'free' | 'pro';
}

/** South Africa is UTC+2 all year (no daylight saving). */
const SAST_OFFSET_MS = 2 * 3600_000;

/** The SAST calendar month containing `now`, as [start, end) in UTC. */
export function sastMonthWindow(now: Date): { start: Date; end: Date } {
  const local = new Date(now.getTime() + SAST_OFFSET_MS);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  return {
    start: new Date(Date.UTC(year, month, 1) - SAST_OFFSET_MS),
    end: new Date(Date.UTC(year, month + 1, 1) - SAST_OFFSET_MS),
  };
}

const oid = (id: string) => new mongoose.Types.ObjectId(id);

/** How much of this month's allowance the school (for a standalone teacher: the teacher) has used. */
export async function aiAllowance(schoolId: string, now: Date = new Date()): Promise<AIAllowance> {
  const { start, end } = sastMonthWindow(now);
  const [sub, used] = await Promise.all([
    Subscription.findOne({ schoolId: oid(schoolId) }).select('status currentPeriodEnd').lean(),
    AIUsage.countDocuments({ schoolId: oid(schoolId), createdAt: { $gte: start, $lt: end } }),
  ]);
  const plan = isSubscriptionEntitled(sub, now) ? 'pro' : 'free';
  return { used, limit: plan === 'pro' ? PRO_AI_ACTIONS_PER_MONTH : FREE_AI_ACTIONS_PER_MONTH, resetsAt: end, plan };
}

function limitMessage(allowance: AIAllowance): string {
  return allowance.plan === 'free'
    ? `You've used this month's ${allowance.limit} free AI actions. Upgrade to Pro for more.`
    : `You've used this month's ${allowance.limit} AI actions. They reset at the start of next month.`;
}

/** Refuses the action when a standalone teacher is unverified or out of AI actions. No-op for school users. */
export async function assertAIAllowance(actor: AIActor, _action: AIAction): Promise<void> {
  if (!actor.isStandaloneTeacher) return;
  if (!(actor.emailVerifiedAt instanceof Date)) {
    throw new AppError('Verify your email to use AI. We sent you a link.', 403, true, { code: 'EMAIL_UNVERIFIED' });
  }
  const allowance = await aiAllowance(actor.schoolId);
  if (allowance.used < allowance.limit) return;
  throw new AppError(limitMessage(allowance), 402, true, {
    code: 'AI_ALLOWANCE',
    details: { used: allowance.used, limit: allowance.limit, resetsAt: allowance.resetsAt.toISOString(), plan: allowance.plan },
  });
}

/** Records one AI action for a standalone teacher. No-op for school users. */
export async function recordAIUse(actor: AIActor, action: AIAction, meta: Record<string, unknown> = {}): Promise<void> {
  if (!actor.isStandaloneTeacher) return;
  await AIUsage.create({ schoolId: oid(actor.schoolId), userId: oid(actor.userId), action, meta });
}

/** Check the allowance, run the AI work, and count it only if it succeeded. */
export async function withAIAllowance<T>(
  actor: AIActor, action: AIAction, run: () => Promise<T>, meta?: Record<string, unknown>,
): Promise<T> {
  await assertAIAllowance(actor, action);
  const result = await run();
  await recordAIUse(actor, action, meta);
  return result;
}

/** The AI actor for a request; loads emailVerifiedAt only for standalone teachers. */
export async function aiActorFor(req: Request): Promise<AIActor> {
  const user = getUser(req);
  const isStandaloneTeacher = user.isStandaloneTeacher === true;
  const base = { schoolId: String(user.schoolId ?? ''), userId: user.id, isStandaloneTeacher };
  if (!isStandaloneTeacher) return base;
  const doc = await User.findOne({ _id: oid(user.id), isDeleted: false }).select('emailVerifiedAt').lean();
  return { ...base, emailVerifiedAt: doc?.emailVerifiedAt ?? null };
}
