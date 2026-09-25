// src/modules/Evidence/__tests__/diagnosis-pool.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { School } from '../../School/model.js';
import { Subscription } from '../../subscription/model.js';
import { AnswerEvidence } from '../model.js';
import { DiagnosisRequest } from '../model-taxonomy.js';
import {
  DIAGNOSIS_POOL_FREE, DIAGNOSIS_POOL_PRO, diagnosisPool, markSkippedBudget, poolRemaining, splitByPool,
} from '../diagnosis-pool.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const schools: Oid[] = [];

async function school(plan: 'standalone' | 'school', sub?: Record<string, unknown>): Promise<Oid> {
  const id = oid();
  schools.push(id);
  await School.collection.insertOne({ _id: id, name: `E pool ${String(id)}`, joinCode: `EP${String(id).slice(-8)}`, plan, isDeleted: false });
  if (sub) await Subscription.collection.insertOne({ schoolId: id, ...sub });
  return id;
}

async function spent(schoolId: Oid, kind: 'diagnosis' | 'tagging', items: number, createdAt: Date, state = 'done'): Promise<void> {
  await DiagnosisRequest.collection.insertOne({
    kind, schoolId, mode: 'batch', state, model: 'm', usage: { input: 0, output: 0 }, createdAt, updatedAt: createdAt,
    items: Array.from({ length: items }, (_, i) => ({ ref: `a${i}`, cacheKey: `k${i}` })),
  });
}

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => {
  await Promise.all([
    School.deleteMany({ _id: { $in: schools } }), Subscription.deleteMany({ schoolId: { $in: schools } }),
    DiagnosisRequest.deleteMany({ schoolId: { $in: schools } }), AnswerEvidence.deleteMany({ schoolId: { $in: schools } }),
  ]);
  await mongoose.disconnect();
});

describe('diagnosisPool', () => {
  it('skips over the pool, SAST month', async () => {
    const s = await school('standalone');
    await spent(s, 'diagnosis', DIAGNOSIS_POOL_FREE - 1, new Date('2026-09-30T23:30:00Z')); // 01:30 on 1 October in SAST
    const october = await diagnosisPool(s, new Date('2026-10-05T10:00:00Z'));
    expect(october).toMatchObject({ metered: true, used: DIAGNOSIS_POOL_FREE - 1, limit: DIAGNOSIS_POOL_FREE });
    expect(splitByPool(['a', 'b', 'c'], poolRemaining(october))).toEqual({ take: ['a'], skip: ['b', 'c'] });
    expect((await diagnosisPool(s, new Date('2026-09-15T10:00:00Z'))).used).toBe(0);
  });

  it('a school (non-standalone) is never limited', async () => {
    const s = await school('school');
    await spent(s, 'diagnosis', 5000, new Date());
    const pool = await diagnosisPool(s);
    expect(pool.metered).toBe(false);
    expect(poolRemaining(pool)).toBe(Number.POSITIVE_INFINITY);
    expect(splitByPool(['a', 'b'], poolRemaining(pool))).toEqual({ take: ['a', 'b'], skip: [] });
  });

  it('a trial counts as Pro; tagging counts one per paper; a failed call counts nothing', async () => {
    const s = await school('standalone', { status: 'trialing', trialEndsAt: new Date(Date.now() + 7 * 86_400_000) });
    await spent(s, 'tagging', 0, new Date());
    await spent(s, 'diagnosis', 10, new Date());
    await spent(s, 'diagnosis', 10, new Date(), 'failed');
    expect(await diagnosisPool(s)).toMatchObject({ limit: DIAGNOSIS_POOL_PRO, used: 11 });
  });

  it('marks only pending rows of those keys skipped_budget', async () => {
    const s = await school('standalone');
    const base = { schoolId: s, studentId: oid(), questionKey: 'q', topicFrom: 'question', marksAwarded: 0, marksAvailable: 1, markedBy: 'ai',
      markedAt: new Date(), status: 'final', answer: { kind: 'typed', text: 'x', truncated: false, hash: 'h' } };
    await AnswerEvidence.create([
      { ...base, source: { type: 'test', recordId: oid(), parentId: oid(), itemKey: '1' }, diagnosis: { state: 'pending', cacheKey: 'K1' } },
      { ...base, source: { type: 'test', recordId: oid(), parentId: oid(), itemKey: '1' }, diagnosis: { state: 'ready', cacheKey: 'K1' } },
    ]);
    expect(await markSkippedBudget(s, ['K1'])).toBe(1);
    expect(await AnswerEvidence.countDocuments({ schoolId: s, 'diagnosis.state': 'skipped_budget', 'diagnosis.skippedReason': 'budget' })).toBe(1);
  });
});
