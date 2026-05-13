import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Subscription } from '../model.js';
import { SubscriptionService } from '../service.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await Subscription.deleteMany({});
  await Subscription.syncIndexes();
});

beforeEach(async () => {
  await Subscription.deleteMany({});
});

afterAll(async () => {
  await Subscription.deleteMany({});
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('SubscriptionService.createInitialFreeSubscription', () => {
  it('creates a free subscription for a school', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await SubscriptionService.createInitialFreeSubscription(schoolId);
    const sub = await Subscription.findOne({ schoolId });
    expect(sub?.status).toBe('free');
    expect(sub?.planCode).toBe('free');
    expect(sub?.cardTokenGuid).toBeNull();
  });

  it('is idempotent — second call returns existing', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await SubscriptionService.createInitialFreeSubscription(schoolId);
    await SubscriptionService.createInitialFreeSubscription(schoolId);
    const count = await Subscription.countDocuments({ schoolId });
    expect(count).toBe(1);
  });
});
