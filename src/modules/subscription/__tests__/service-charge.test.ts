import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { Subscription, Invoice, Plan } from '../model.js';
import { SubscriptionService } from '../service.js';
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
});

afterAll(async () => {
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function makeSub(
  status: 'trialing' | 'active' | 'past_due',
  overrides: Partial<Record<string, unknown>> = {},
) {
  const schoolId = new mongoose.Types.ObjectId();
  return Subscription.create({
    schoolId,
    subscriberType: 'teacher',
    planCode: 'pro_monthly',
    status,
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    nextBillingAt: new Date(Date.now() - 1000),
    cardTokenGuid: 'guid-1',
    cardLastFour: '0012',
    cardBrand: 'visa',
    cardExpiryMonth: 12,
    cardExpiryYear: 2031,
    retryCount: 0,
    gatewayProvider: 'onegate',
    ...overrides,
  });
}

function mockChargeSuccess() {
  vi.spyOn(onegate, 'getOneGateClient').mockReturnValue({
    chargeToken: vi.fn().mockResolvedValue({
      type: 'result',
      success: 1,
      callpay_transaction_id: 99,
      amount: '149.00',
      reason: 'n/a',
      organisation_id: 21234,
      merchant_reference: 'x',
      gateway_reference: 'ok',
      gateway_response: {},
    }),
  } as never);
}

function mockChargeFailure() {
  vi.spyOn(onegate, 'getOneGateClient').mockReturnValue({
    chargeToken: vi.fn().mockResolvedValue({
      type: 'result',
      success: 0,
      reason: 'declined',
      callpay_transaction_id: 0,
      amount: '149.00',
      organisation_id: 21234,
      merchant_reference: 'x',
      gateway_reference: '',
      gateway_response: {},
    }),
  } as never);
}

describe('SubscriptionService.chargeSubscription', () => {
  it('success: trialing → active, invoice paid, period rolled', async () => {
    const sub = await makeSub('trialing');
    mockChargeSuccess();

    await SubscriptionService.chargeSubscription(sub._id as mongoose.Types.ObjectId);

    const refreshed = await Subscription.findById(sub._id);
    expect(refreshed?.status).toBe('active');
    expect(refreshed?.retryCount).toBe(0);
    expect(refreshed?.currentPeriodEnd?.getTime()).toBeGreaterThan(Date.now() + 25 * 86400000);

    const inv = await Invoice.findOne({ subscriptionId: sub._id });
    expect(inv?.status).toBe('paid');
    expect(inv?.gatewayTransactionId).toBe(99);
  });

  it('trial failure → free (no retry)', async () => {
    const sub = await makeSub('trialing');
    mockChargeFailure();

    await SubscriptionService.chargeSubscription(sub._id as mongoose.Types.ObjectId);

    const refreshed = await Subscription.findById(sub._id);
    expect(refreshed?.status).toBe('free');
    expect(refreshed?.cardTokenGuid).toBeNull();
  });

  it('active failure → past_due, retry scheduled at +2d', async () => {
    const sub = await makeSub('active');
    mockChargeFailure();

    await SubscriptionService.chargeSubscription(sub._id as mongoose.Types.ObjectId);

    const refreshed = await Subscription.findById(sub._id);
    expect(refreshed?.status).toBe('past_due');
    expect(refreshed?.retryCount).toBe(1);
    expect(refreshed?.nextRetryAt).toBeTruthy();
  });

  it('past_due failure on 3rd retry → free', async () => {
    const sub = await makeSub('past_due', { retryCount: 3 });
    mockChargeFailure();

    await SubscriptionService.chargeSubscription(sub._id as mongoose.Types.ObjectId);

    const refreshed = await Subscription.findById(sub._id);
    expect(refreshed?.status).toBe('free');
  });
});
