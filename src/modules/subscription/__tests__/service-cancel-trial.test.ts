import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Subscription } from '../model.js';
import { SubscriptionService } from '../service.js';
import { isSubscriptionEntitled } from '../entitlements.js';
import { seedPlans } from '../seed.js';

const DAY = 86400000;
const made: mongoose.Types.ObjectId[] = [];

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await seedPlans();
});

afterAll(async () => {
  await Subscription.deleteMany({ schoolId: { $in: made } });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function makeTrialSub(trialEndsAt: Date) {
  const schoolId = new mongoose.Types.ObjectId();
  made.push(schoolId);
  return Subscription.create({
    schoolId, subscriberType: 'teacher', planCode: 'pro_monthly', status: 'trialing',
    trialEndsAt, nextBillingAt: trialEndsAt, cardTokenGuid: 'g', cardLastFour: '0012', cardBrand: 'visa',
    cardExpiryMonth: 12, cardExpiryYear: 2031, retryCount: 0, gatewayProvider: 'onegate',
  });
}

describe('cancelling during the free trial', () => {
  it('keeps Pro until the trial ends, then the billing run moves the teacher to Free without charging', async () => {
    const trialEndsAt = new Date(Date.now() + 5 * DAY);
    const sub = await makeTrialSub(trialEndsAt);

    const canceled = await SubscriptionService.cancel(sub.schoolId);
    expect(canceled.status).toBe('canceled');
    expect(canceled.nextBillingAt?.getTime()).toBe(trialEndsAt.getTime());
    expect(isSubscriptionEntitled(canceled)).toBe(true);
    expect(isSubscriptionEntitled(canceled, new Date(trialEndsAt.getTime() + 1000))).toBe(false);

    // The trial end passes; the next billing run picks it up.
    await Subscription.updateOne({ _id: sub._id }, { $set: { trialEndsAt: new Date(Date.now() - 1000), nextBillingAt: new Date(Date.now() - 1000) } });
    await SubscriptionService.chargeSubscription(sub._id as mongoose.Types.ObjectId);
    const ended = await Subscription.findById(sub._id).lean();
    expect(ended).toMatchObject({ status: 'free', planCode: 'free', cardTokenGuid: null, nextBillingAt: null, trialEndsAt: null });
  });

  it('resuming before the trial ends puts the teacher back on the trial, billed when it ends', async () => {
    const trialEndsAt = new Date(Date.now() + 5 * DAY);
    const sub = await makeTrialSub(trialEndsAt);
    await SubscriptionService.cancel(sub.schoolId);

    const resumed = await SubscriptionService.resume(sub.schoolId);
    expect(resumed.status).toBe('trialing');
    expect(resumed.cancelAtPeriodEnd).toBe(false);
    expect(resumed.canceledAt).toBeNull();
    expect(resumed.nextBillingAt?.getTime()).toBe(trialEndsAt.getTime());
  });

  it('refuses to resume once the trial has ended', async () => {
    const sub = await makeTrialSub(new Date(Date.now() + 5 * DAY));
    await SubscriptionService.cancel(sub.schoolId);
    await Subscription.updateOne({ _id: sub._id }, { $set: { trialEndsAt: new Date(Date.now() - 1000) } });
    await expect(SubscriptionService.resume(sub.schoolId)).rejects.toThrow(/ended/i);
  });
});
