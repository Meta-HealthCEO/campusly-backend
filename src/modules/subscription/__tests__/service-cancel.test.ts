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

async function makeActiveSub() {
  const schoolId = new mongoose.Types.ObjectId();
  const periodEnd = new Date(Date.now() + 20 * 86400000);
  return Subscription.create({
    schoolId,
    subscriberType: 'teacher',
    planCode: 'pro_monthly',
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: periodEnd,
    nextBillingAt: periodEnd,
    cardTokenGuid: 'g',
    cardLastFour: '0012',
    cardBrand: 'visa',
    cardExpiryMonth: 12,
    cardExpiryYear: 2031,
    retryCount: 0,
    gatewayProvider: 'onegate',
  });
}

describe('SubscriptionService.cancel + resume', () => {
  it('cancel sets cancelAtPeriodEnd, status=canceled, nextBillingAt=currentPeriodEnd', async () => {
    const sub = await makeActiveSub();
    const updated = await SubscriptionService.cancel(sub.schoolId);
    expect(updated.status).toBe('canceled');
    expect(updated.cancelAtPeriodEnd).toBe(true);
    expect(updated.canceledAt).toBeTruthy();
    expect(updated.nextBillingAt?.getTime()).toBe(sub.currentPeriodEnd!.getTime());
  });

  it('resume reverts cancel before period end', async () => {
    const sub = await makeActiveSub();
    await SubscriptionService.cancel(sub.schoolId);
    const resumed = await SubscriptionService.resume(sub.schoolId);
    expect(resumed.status).toBe('active');
    expect(resumed.cancelAtPeriodEnd).toBe(false);
    expect(resumed.canceledAt).toBeNull();
  });

  it('resume errors if period already ended', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'canceled',
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
      currentPeriodEnd: new Date(Date.now() - 86400000),
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    await expect(SubscriptionService.resume(schoolId)).rejects.toThrow(/period has ended/i);
  });
});
