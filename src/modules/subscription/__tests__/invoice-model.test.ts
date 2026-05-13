import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Invoice } from '../model.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await Invoice.deleteMany({ merchantReference: /^inv_(test|uniq)/ });
  await Invoice.syncIndexes();
});

afterAll(async () => {
  await Invoice.deleteMany({ merchantReference: /^inv_(test|uniq)/ });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('Invoice model', () => {
  it('persists an invoice with required fields', async () => {
    const subscriptionId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();
    const periodStart = new Date('2026-05-01T00:00:00.000Z');
    const periodEnd = new Date('2026-06-01T00:00:00.000Z');

    const created = await Invoice.create({
      subscriptionId,
      schoolId,
      planCode: 'pro_monthly',
      subtotal: 14900,
      tax: 0,
      taxRate: 0,
      total: 14900,
      currency: 'ZAR',
      status: 'pending',
      merchantReference: 'inv_test_001',
      periodStart,
      periodEnd,
      purpose: 'subscription',
    });

    expect(created.subscriptionId.toString()).toBe(subscriptionId.toString());
    expect(created.schoolId.toString()).toBe(schoolId.toString());
    expect(created.planCode).toBe('pro_monthly');
    expect(created.subtotal).toBe(14900);
    expect(created.tax).toBe(0);
    expect(created.taxRate).toBe(0);
    expect(created.total).toBe(14900);
    expect(created.currency).toBe('ZAR');
    expect(created.status).toBe('pending');
    expect(created.merchantReference).toBe('inv_test_001');
    expect(created.periodStart.toISOString()).toBe(periodStart.toISOString());
    expect(created.periodEnd.toISOString()).toBe(periodEnd.toISOString());
    expect(created.purpose).toBe('subscription');
    expect(created.gatewayTransactionId).toBeNull();
    expect(created.gatewayReference).toBeNull();
    expect(created.paidAt).toBeNull();
    expect(created.failedAt).toBeNull();
    expect(created.refundedAmount).toBe(0);
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);
  });

  it('enforces unique merchantReference', async () => {
    const base = {
      subscriptionId: new mongoose.Types.ObjectId(),
      schoolId: new mongoose.Types.ObjectId(),
      planCode: 'pro_monthly',
      subtotal: 14900,
      tax: 0,
      taxRate: 0,
      total: 14900,
      currency: 'ZAR',
      status: 'pending' as const,
      merchantReference: 'inv_uniq1',
      periodStart: new Date('2026-05-01T00:00:00.000Z'),
      periodEnd: new Date('2026-06-01T00:00:00.000Z'),
      purpose: 'verification' as const,
    };

    await Invoice.create(base);
    await expect(Invoice.create({ ...base })).rejects.toThrow();
  });
});
