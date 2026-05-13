import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Subscription, Plan } from '../model.js';
import { SubscriptionService } from '../service.js';
import { seedPlans } from '../seed.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await Subscription.deleteMany({});
  await seedPlans();
});

beforeEach(async () => {
  await Subscription.deleteMany({});
});

afterAll(async () => {
  await Subscription.deleteMany({});
  await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('SubscriptionService.startTrial', () => {
  it('transitions free → trialing with card details', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await SubscriptionService.createInitialFreeSubscription(schoolId);

    const updated = await SubscriptionService.startTrial({
      schoolId,
      planCode: 'pro_monthly',
      cardTokenGuid: 'guid-1',
      cardLastFour: '0012',
      cardBrand: 'visa',
      cardExpiryMonth: 12,
      cardExpiryYear: 2031,
    });

    expect(updated.status).toBe('trialing');
    expect(updated.planCode).toBe('pro_monthly');
    expect(updated.cardTokenGuid).toBe('guid-1');
    expect(updated.trialEndsAt).toBeTruthy();
    expect(updated.nextBillingAt?.getTime()).toBe(updated.trialEndsAt?.getTime());

    const expectedTrialEnd = Date.now() + 14 * 24 * 60 * 60 * 1000;
    expect(Math.abs((updated.trialEndsAt as Date).getTime() - expectedTrialEnd)).toBeLessThan(5000);
  });

  it('rejects if subscription already has a card', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await SubscriptionService.createInitialFreeSubscription(schoolId);
    await SubscriptionService.startTrial({
      schoolId,
      planCode: 'pro_monthly',
      cardTokenGuid: 'guid-1',
      cardLastFour: '0012',
      cardBrand: 'visa',
      cardExpiryMonth: 12,
      cardExpiryYear: 2031,
    });
    await expect(
      SubscriptionService.startTrial({
        schoolId,
        planCode: 'pro_annual',
        cardTokenGuid: 'guid-2',
        cardLastFour: '0099',
        cardBrand: 'visa',
        cardExpiryMonth: 6,
        cardExpiryYear: 2032,
      }),
    ).rejects.toThrow(/already has a card/i);
  });
});
