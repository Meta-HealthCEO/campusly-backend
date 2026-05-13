import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { WebhookEvent, CheckoutSession } from '../model.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await WebhookEvent.deleteMany({ gatewayTransactionId: { $gte: 9000000 } });
  await CheckoutSession.deleteMany({ merchantReference: /^sub_(test|uniq)/ });
  await WebhookEvent.syncIndexes();
  await CheckoutSession.syncIndexes();
});

afterAll(async () => {
  await WebhookEvent.deleteMany({ gatewayTransactionId: { $gte: 9000000 } });
  await CheckoutSession.deleteMany({ merchantReference: /^sub_(test|uniq)/ });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('WebhookEvent model', () => {
  it('enforces unique gatewayTransactionId', async () => {
    const base = {
      gatewayTransactionId: 9000111,
      payloadHash: 'h',
      rawPayload: {},
      status: 'pending' as const,
      verifiedViaLookup: false,
    };

    const created = await WebhookEvent.create(base);
    expect(created.gatewayTransactionId).toBe(9000111);
    expect(created.payloadHash).toBe('h');
    expect(created.status).toBe('pending');
    expect(created.verifiedViaLookup).toBe(false);
    expect(created.processedAt).toBeNull();
    expect(created.error).toBeNull();
    expect(created.receivedAt).toBeInstanceOf(Date);

    await expect(WebhookEvent.create({ ...base })).rejects.toThrow();
  });
});

describe('CheckoutSession model', () => {
  it('enforces unique merchantReference', async () => {
    const userId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();
    const expiresAt = new Date(Date.now() + 1800000);

    const base = {
      userId,
      schoolId,
      planCode: 'pro_monthly',
      merchantReference: 'sub_uniq_aaa',
      paymentKey: 'k1',
      purpose: 'tokenisation' as const,
      status: 'pending' as const,
      expiresAt,
    };

    const created = await CheckoutSession.create(base);
    expect(created.userId.toString()).toBe(userId.toString());
    expect(created.schoolId.toString()).toBe(schoolId.toString());
    expect(created.planCode).toBe('pro_monthly');
    expect(created.merchantReference).toBe('sub_uniq_aaa');
    expect(created.paymentKey).toBe('k1');
    expect(created.purpose).toBe('tokenisation');
    expect(created.status).toBe('pending');
    expect(created.expiresAt.toISOString()).toBe(expiresAt.toISOString());
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);

    await expect(CheckoutSession.create({ ...base, userId: new mongoose.Types.ObjectId() })).rejects.toThrow();
  });
});
