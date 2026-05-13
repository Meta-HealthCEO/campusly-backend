import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { Subscription, Invoice, CheckoutSession, WebhookEvent, Plan } from '../model.js';
import { seedPlans } from '../seed.js';
import * as onegate from '../../../lib/onegate/index.js';

function lookupTokenisation(overrides: Record<string, unknown> = {}) {
  return {
    id: 9001,
    successful: 1 as const,
    status: 'complete',
    amount: '1.00',
    displayAmount: 'R1.00',
    currency: 'ZAR',
    merchant_reference: 'sub_ABC123',
    gateway_reference: 'ref',
    payment_key: 'k',
    created: '2026-05-13',
    refunded_amount: '0.00',
    refunded: 0 as const,
    service: 'Direct',
    gateway: 'Imbeko',
    gateway_response_parameters: {},
    ...overrides,
  };
}

function makeMockClient(overrides: Record<string, unknown> = {}) {
  return {
    getTransaction: vi.fn().mockResolvedValue(lookupTokenisation(overrides)),
    createCustomerToken: vi.fn().mockResolvedValue({
      guid: 'TOK-1',
      expiry_date: '12-2031',
      last_four: '0012',
      brand: 'visa',
    }),
    refundTransaction: vi.fn().mockResolvedValue({
      success: 1,
      refunded_amount: '1.00',
      callpay_transaction_id: 9001,
      reason: 'ok',
    }),
  };
}

let schoolId: mongoose.Types.ObjectId;
let userId: mongoose.Types.ObjectId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await CheckoutSession.deleteMany({});
  await WebhookEvent.deleteMany({});
  await seedPlans();
});

beforeEach(async () => {
  schoolId = new mongoose.Types.ObjectId();
  userId = new mongoose.Types.ObjectId();
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await CheckoutSession.deleteMany({});
  await WebhookEvent.deleteMany({});
  vi.restoreAllMocks();
});

afterAll(async () => {
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await CheckoutSession.deleteMany({});
  await WebhookEvent.deleteMany({});
  await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('POST /api/webhooks/onegate — tokenisation', () => {
  it('processes tokenisation webhook: transitions sub to trialing, refunds R1', async () => {
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    await CheckoutSession.create({
      userId,
      schoolId,
      planCode: 'pro_monthly',
      merchantReference: 'sub_ABC123',
      paymentKey: 'k',
      purpose: 'tokenisation',
      status: 'pending',
      expiresAt: new Date(Date.now() + 1800000),
    });
    const mock = makeMockClient();
    vi.spyOn(onegate, 'getOneGateClient').mockReturnValue(mock as never);

    const res = await request(app)
      .post('/api/webhooks/onegate')
      .send({
        callpay_transaction_id: 9001,
        merchant_reference: 'sub_ABC123',
        amount: '1.00',
        success: 1,
      });

    expect(res.status).toBe(200);
    const sub = await Subscription.findOne({ schoolId });
    expect(sub?.status).toBe('trialing');
    expect(sub?.cardTokenGuid).toBe('TOK-1');
    expect(sub?.cardLastFour).toBe('0012');
    expect(mock.refundTransaction).toHaveBeenCalledWith(9001);
  });

  it('is idempotent — second webhook with same gatewayTransactionId is noop', async () => {
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    await CheckoutSession.create({
      userId,
      schoolId,
      planCode: 'pro_monthly',
      merchantReference: 'sub_ABC123',
      paymentKey: 'k',
      purpose: 'tokenisation',
      status: 'pending',
      expiresAt: new Date(Date.now() + 1800000),
    });
    vi.spyOn(onegate, 'getOneGateClient').mockReturnValue(makeMockClient() as never);

    await request(app)
      .post('/api/webhooks/onegate')
      .send({ callpay_transaction_id: 9001, merchant_reference: 'sub_ABC123', amount: '1.00', success: 1 });
    await request(app)
      .post('/api/webhooks/onegate')
      .send({ callpay_transaction_id: 9001, merchant_reference: 'sub_ABC123', amount: '1.00', success: 1 });

    const events = await WebhookEvent.countDocuments({ gatewayTransactionId: 9001 });
    expect(events).toBe(1);
  });
});
