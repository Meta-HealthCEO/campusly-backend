import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Subscription } from '../model.js';
import { SubscriptionService } from '../service.js';
import { isSubscriptionEntitled } from '../entitlements.js';
import { aiAllowance } from '../ai-allowance.js';
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

/** An active Pro teacher whose card expired last year, due for billing now. */
async function makeExpiredCardSub() {
  const schoolId = new mongoose.Types.ObjectId();
  made.push(schoolId);
  const now = Date.now();
  return Subscription.create({
    schoolId, subscriberType: 'teacher', planCode: 'pro_monthly', status: 'active',
    currentPeriodStart: new Date(now - 30 * DAY), currentPeriodEnd: new Date(now - 1000), nextBillingAt: new Date(now - 1000),
    cardTokenGuid: 'g', cardLastFour: '0012', cardBrand: 'visa', cardExpiryMonth: 1, cardExpiryYear: new Date().getFullYear() - 1,
    retryCount: 0, gatewayProvider: 'onegate',
  });
}

describe('an expired card', () => {
  it('gives a 7-day grace on Pro, then the billing run moves the teacher to Free (AI limit 20)', async () => {
    const sub = await makeExpiredCardSub();

    await SubscriptionService.chargeSubscription(sub._id as mongoose.Types.ObjectId);
    const pastDue = await Subscription.findById(sub._id).lean();
    expect(pastDue?.status).toBe('past_due');
    expect(pastDue?.lastFailureReason).toBe('card_expired');
    expect(pastDue?.pastDueSince).toBeInstanceOf(Date);
    // The billing run comes back when the grace ends.
    expect(pastDue!.nextBillingAt!.getTime()).toBeGreaterThan(Date.now() + 6 * DAY);
    expect(isSubscriptionEntitled(pastDue)).toBe(true);
    expect(await aiAllowance(String(sub.schoolId))).toMatchObject({ plan: 'pro', limit: 500 });

    // Eight days later, card still expired.
    await Subscription.updateOne({ _id: sub._id }, { $set: { pastDueSince: new Date(Date.now() - 8 * DAY), nextBillingAt: new Date(Date.now() - 1000) } });
    const lapsed = await Subscription.findById(sub._id).lean();
    expect(isSubscriptionEntitled(lapsed)).toBe(false);
    expect(await aiAllowance(String(sub.schoolId))).toMatchObject({ plan: 'free', limit: 20 });

    await SubscriptionService.chargeSubscription(sub._id as mongoose.Types.ObjectId);
    const ended = await Subscription.findById(sub._id).lean();
    expect(ended).toMatchObject({ status: 'free', planCode: 'free', cardTokenGuid: null, nextBillingAt: null, pastDueSince: null });
  });

  it('a past-due subscription with no record of when it fell behind is not Pro', () => {
    expect(isSubscriptionEntitled({ status: 'past_due', pastDueSince: null })).toBe(false);
  });
});
