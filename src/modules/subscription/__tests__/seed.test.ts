import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Plan } from '../model.js';
import { seedPlans } from '../seed.js';

describe('seedPlans', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    await Plan.syncIndexes();
    await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  });
  afterAll(async () => {
    await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  });

  it('creates three plans on first run', async () => {
    await seedPlans();
    const codes = (await Plan.find({}).select('code')).map((p) => p.code).sort();
    expect(codes).toEqual(['free', 'pro_annual', 'pro_monthly']);
  });

  it('is idempotent — running twice produces same result', async () => {
    await seedPlans();
    await seedPlans();
    const count = await Plan.countDocuments({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
    expect(count).toBe(3);
  });

  it('pro_monthly is R149 (14900 cents) with aiGeneration entitlement', async () => {
    await seedPlans();
    const plan = await Plan.findOne({ code: 'pro_monthly' });
    expect(plan?.amountExclTax).toBe(14900);
    expect(plan?.trialDays).toBe(14);
    expect(plan?.entitlements).toMatchObject({ aiGeneration: true });
  });
});
