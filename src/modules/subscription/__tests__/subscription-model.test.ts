import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Subscription } from '../model.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await Subscription.deleteMany({});
  await Subscription.syncIndexes();
});

afterAll(async () => {
  await Subscription.deleteMany({});
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('Subscription model', () => {
  it('persists a subscription with required fields', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const sub = await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    expect(sub.status).toBe('free');
    expect(sub.cancelAtPeriodEnd).toBe(false);
  });

  it('enforces unique schoolId', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    await expect(
      Subscription.create({
        schoolId,
        subscriberType: 'teacher',
        planCode: 'free',
        status: 'free',
        retryCount: 0,
        gatewayProvider: 'onegate',
      }),
    ).rejects.toThrow();
  });
});
