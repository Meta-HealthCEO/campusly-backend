import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Plan } from '../model.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await Plan.deleteMany({ code: /^test_/ });
  await Plan.syncIndexes();
});

afterAll(async () => {
  await Plan.deleteMany({ code: /^test_/ });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('Plan model', () => {
  it('persists a plan with entitlements', async () => {
    const created = await Plan.create({
      code: 'test_pro',
      name: 'Test Pro',
      subscriberType: 'teacher',
      amountExclTax: 14900,
      taxRate: 0,
      currency: 'ZAR',
      interval: 'month',
      trialDays: 14,
      entitlements: { aiGeneration: true },
      isActive: true,
      displayOrder: 1,
    });
    expect(created.entitlements.aiGeneration).toBe(true);
    expect(created.amountExclTax).toBe(14900);
  });

  it('enforces unique code', async () => {
    await Plan.create({
      code: 'test_dup',
      name: 'A',
      subscriberType: 'teacher',
      amountExclTax: 0,
      taxRate: 0,
      currency: 'ZAR',
      interval: null,
      trialDays: 0,
      entitlements: {},
      isActive: true,
      displayOrder: 0,
    });
    await expect(
      Plan.create({
        code: 'test_dup',
        name: 'B',
        subscriberType: 'teacher',
        amountExclTax: 0,
        taxRate: 0,
        currency: 'ZAR',
        interval: null,
        trialDays: 0,
        entitlements: {},
        isActive: true,
        displayOrder: 0,
      }),
    ).rejects.toThrow();
  });
});
