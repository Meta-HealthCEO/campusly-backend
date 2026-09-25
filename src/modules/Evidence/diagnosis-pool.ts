// src/modules/Evidence/diagnosis-pool.ts
//
// Diagnosis for standalone schools draws on its own monthly pool (spec §6.7,
// plan ruling P4), never on the teacher's AI actions. Used = AI-diagnosed
// cache keys + paper-tagging calls this SAST month. Over the pool, diagnosis
// is skipped (not failed). The numbers are Shaun's call at the Phase P gate.
import mongoose from 'mongoose';
import { School } from '../School/model.js';
import { Subscription } from '../subscription/model.js';
import { isSubscriptionEntitled } from '../subscription/entitlements.js';
import { sastMonthWindow } from '../subscription/ai-allowance.js';
import { AnswerEvidence } from './model.js';
import { DiagnosisRequest } from './model-taxonomy.js';
import type { Oid } from './types.js';

export const DIAGNOSIS_POOL_FREE = 150;
export const DIAGNOSIS_POOL_PRO = 2000;

export interface DiagnosisPool { metered: boolean; used: number; limit: number; resetsAt: Date | null }

export async function diagnosisPool(schoolId: Oid | string, now: Date = new Date()): Promise<DiagnosisPool> {
  const id = new mongoose.Types.ObjectId(String(schoolId));
  const school = await School.findOne({ _id: id, isDeleted: false }).select('plan').lean();
  if (school?.plan !== 'standalone') return { metered: false, used: 0, limit: Number.POSITIVE_INFINITY, resetsAt: null };
  const { start, end } = sastMonthWindow(now);
  const [sub, rows] = await Promise.all([
    Subscription.findOne({ schoolId: id }).select('status currentPeriodEnd trialEndsAt pastDueSince').lean(),
    DiagnosisRequest.aggregate<{ used: number }>([
      { $match: {
        schoolId: id, kind: { $in: ['diagnosis', 'tagging'] }, state: { $ne: 'failed' }, isDeleted: { $ne: true },
        createdAt: { $gte: start, $lt: end },
      } },
      { $group: { _id: null, used: { $sum: { $cond: [{ $eq: ['$kind', 'tagging'] }, 1, { $size: '$items' }] } } } },
    ]),
  ]);
  const limit = isSubscriptionEntitled(sub, now) ? DIAGNOSIS_POOL_PRO : DIAGNOSIS_POOL_FREE;
  return { metered: true, used: rows[0]?.used ?? 0, limit, resetsAt: end };
}

export function poolRemaining(pool: DiagnosisPool): number {
  return pool.metered ? Math.max(0, pool.limit - pool.used) : Number.POSITIVE_INFINITY;
}

/** The first `remaining` keys (oldest first) are diagnosed; the rest are skipped. */
export function splitByPool<T>(keys: readonly T[], remaining: number): { take: T[]; skip: T[] } {
  const n = Number.isFinite(remaining) ? remaining : keys.length;
  return { take: keys.slice(0, n), skip: keys.slice(n) };
}

export async function markSkippedBudget(schoolId: Oid, cacheKeys: readonly string[]): Promise<number> {
  if (cacheKeys.length === 0) return 0;
  const res = await AnswerEvidence.updateMany(
    { schoolId, 'diagnosis.cacheKey': { $in: [...cacheKeys] }, 'diagnosis.state': 'pending', isDeleted: false },
    { $set: { 'diagnosis.state': 'skipped_budget', 'diagnosis.skippedReason': 'budget' } },
  );
  return res.modifiedCount;
}
