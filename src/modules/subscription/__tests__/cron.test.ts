import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { Subscription, Plan, Invoice } from '../model.js';
import { processBillingTick } from '../cron.js';
import { seedPlans } from '../seed.js';
import * as onegate from '../../../lib/onegate/index.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await seedPlans();
});

beforeEach(async () => {
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  vi.restoreAllMocks();
  vi.spyOn(onegate, 'getOneGateClient').mockReturnValue({
    chargeToken: vi.fn().mockResolvedValue({
      type: 'result',
      success: 1,
      callpay_transaction_id: 1,
      amount: '149.00',
      reason: 'n/a',
      organisation_id: 21234,
      merchant_reference: 'x',
      gateway_reference: 'ok',
      gateway_response: {},
    }),
  } as never);
});

afterAll(async () => {
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('processBillingTick', () => {
  it('charges subscriptions whose nextBillingAt is past', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'trialing',
      nextBillingAt: new Date(Date.now() - 1000),
      cardTokenGuid: 'g',
      cardLastFour: '0012',
      cardBrand: 'visa',
      cardExpiryMonth: 12,
      cardExpiryYear: 2031,
      retryCount: 0,
      gatewayProvider: 'onegate',
    });

    await processBillingTick();

    const sub = await Subscription.findOne({ schoolId });
    expect(sub?.status).toBe('active');
  });

  it('skips subscriptions with future nextBillingAt', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'active',
      nextBillingAt: new Date(Date.now() + 1000000),
      cardTokenGuid: 'g',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });

    await processBillingTick();

    const sub = await Subscription.findOne({ schoolId });
    expect(sub?.status).toBe('active');
    expect(await Invoice.countDocuments()).toBe(0);
  });

  it('releases stale processingLockedAt older than 10 minutes', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const staleLock = new Date(Date.now() - 11 * 60 * 1000);
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'trialing',
      nextBillingAt: new Date(Date.now() - 1000),
      cardTokenGuid: 'g',
      cardLastFour: '0012',
      cardBrand: 'visa',
      cardExpiryMonth: 12,
      cardExpiryYear: 2031,
      retryCount: 0,
      gatewayProvider: 'onegate',
      processingLockedAt: staleLock,
    });

    await processBillingTick();

    const sub = await Subscription.findOne({ schoolId });
    expect(sub?.processingLockedAt).toBeNull();
    expect(sub?.status).toBe('active');
  });
});
