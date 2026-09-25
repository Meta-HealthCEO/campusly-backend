import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { AIUsage } from '../ai-usage.model.js';
import { Subscription } from '../model.js';
import { aiAllowance, assertAIAllowance, recordAIUse, sastMonthWindow, withAIAllowance, FREE_AI_ACTIONS_PER_MONTH } from '../ai-allowance.js';

const schools: string[] = [];

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => {
  const ids = schools.map((id: string) => new mongoose.Types.ObjectId(id));
  await AIUsage.collection.deleteMany({ schoolId: { $in: ids } });
  await Subscription.collection.deleteMany({ schoolId: { $in: ids } });
  await mongoose.disconnect();
});

const actor = (over: Partial<{ verified: boolean }> = {}) => {
  const schoolId = String(new mongoose.Types.ObjectId());
  schools.push(schoolId);
  return {
    schoolId, userId: String(new mongoose.Types.ObjectId()),
    isStandaloneTeacher: true, emailVerifiedAt: over.verified === false ? null : new Date(),
  };
};

describe('sastMonthWindow', () => {
  it('counts 23:30 UTC on the last day of a month in the next SAST month', () => {
    const { start } = sastMonthWindow(new Date('2026-09-30T23:30:00Z'));
    expect(start.toISOString()).toBe('2026-09-30T22:00:00.000Z'); // 1 Oct 00:00 SAST
  });

  it('ends the window at 00:00 SAST on the first of the next month', () => {
    const { start, end } = sastMonthWindow(new Date('2026-12-15T10:00:00Z'));
    expect(start.toISOString()).toBe('2026-11-30T22:00:00.000Z');
    expect(end.toISOString()).toBe('2026-12-31T22:00:00.000Z');
  });
});

describe('the free AI allowance', () => {
  it('lets a free teacher use 20 AI actions a month, then refuses with the numbers', async () => {
    const a = actor();
    await AIUsage.insertMany(Array.from({ length: FREE_AI_ACTIONS_PER_MONTH - 1 }, () => ({ schoolId: a.schoolId, userId: a.userId, action: 'paper' })));
    await expect(assertAIAllowance(a, 'paper')).resolves.toBeUndefined();
    await recordAIUse(a, 'paper');
    const err = await assertAIAllowance(a, 'paper').catch((e: unknown) => e as { statusCode: number; code: string; details: { used: number; limit: number } });
    expect(err).toMatchObject({ statusCode: 402, code: 'AI_ALLOWANCE', details: { used: 20, limit: 20 } });
  });

  it('gives a trialing or paying teacher the Pro limit', async () => {
    const a = actor();
    await Subscription.collection.insertOne({ schoolId: new mongoose.Types.ObjectId(a.schoolId), status: 'trialing', planCode: 'pro_monthly', trialEndsAt: new Date(Date.now() + 86400000) });
    const allowance = await aiAllowance(a.schoolId);
    expect(allowance.limit).toBe(500);
    expect(allowance.plan).toBe('pro');
  });

  it('does not count an AI call that failed', async () => {
    const a = actor();
    await expect(withAIAllowance(a, 'paper', async () => { throw new Error('AI down'); })).rejects.toThrow('AI down');
    expect((await aiAllowance(a.schoolId)).used).toBe(0);
  });

  it('counts an AI call that worked, once, with its action', async () => {
    const a = actor();
    await expect(withAIAllowance(a, 'memo', async () => 'done', { paperId: 'p1' })).resolves.toBe('done');
    const rows = await AIUsage.find({ schoolId: a.schoolId }).lean();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ action: 'memo', meta: { paperId: 'p1' } });
  });

  it('refuses an unverified teacher, and never limits school teachers', async () => {
    await expect(assertAIAllowance(actor({ verified: false }), 'paper')).rejects.toMatchObject({ statusCode: 403, code: 'EMAIL_UNVERIFIED' });
    const school = { ...actor(), isStandaloneTeacher: false };
    await AIUsage.insertMany(Array.from({ length: 30 }, () => ({ schoolId: school.schoolId, userId: school.userId, action: 'paper' })));
    await expect(assertAIAllowance(school, 'paper')).resolves.toBeUndefined();
  });

  it('records nothing for school teachers', async () => {
    const school = { ...actor(), isStandaloneTeacher: false };
    await withAIAllowance(school, 'paper', async () => 'ok');
    expect(await AIUsage.countDocuments({ schoolId: school.schoolId })).toBe(0);
  });

  it('only counts this month', async () => {
    const a = actor();
    await AIUsage.collection.insertOne({ schoolId: new mongoose.Types.ObjectId(a.schoolId), userId: new mongoose.Types.ObjectId(a.userId), action: 'paper', createdAt: new Date('2026-01-15T10:00:00Z') });
    await recordAIUse(a, 'paper');
    expect((await aiAllowance(a.schoolId)).used).toBe(1);
  });
});
