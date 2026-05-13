import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { Subscription, Plan, CheckoutSession } from '../model.js';
import { seedPlans } from '../seed.js';
import { signTestToken } from '../../../test-utils/auth.js';
import * as onegate from '../../../lib/onegate/index.js';

let schoolId: mongoose.Types.ObjectId;
let userId: mongoose.Types.ObjectId;
let token: string;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await Subscription.deleteMany({});
  await CheckoutSession.deleteMany({});
  await seedPlans();
});

beforeEach(async () => {
  schoolId = new mongoose.Types.ObjectId();
  userId = new mongoose.Types.ObjectId();
  token = signTestToken({ id: userId, schoolId, role: 'teacher' });
  await Subscription.deleteMany({});
  await CheckoutSession.deleteMany({});
  vi.restoreAllMocks();
});

afterAll(async () => {
  await Subscription.deleteMany({});
  await CheckoutSession.deleteMany({});
  await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('POST /api/subscriptions/checkout', () => {
  it('mints a payment key and returns it', async () => {
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    vi.spyOn(onegate, 'getOneGateClient').mockReturnValue({
      createPaymentKey: vi.fn().mockResolvedValue({
        key: 'KEY-1',
        url: 'https://og/pay',
        origin: 'https://og',
      }),
    } as never);

    const res = await request(app)
      .post('/api/subscriptions/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ planCode: 'pro_monthly' });

    expect(res.status).toBe(200);
    expect(res.body.data.paymentKey).toBe('KEY-1');
    const session = await CheckoutSession.findOne({ paymentKey: 'KEY-1' });
    expect(session?.status).toBe('pending');
    expect(session?.merchantReference).toMatch(/^sub_/);
  });

  it('rejects if user already has a card on file', async () => {
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'active',
      cardTokenGuid: 'existing',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });

    const res = await request(app)
      .post('/api/subscriptions/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ planCode: 'pro_monthly' });

    expect(res.status).toBe(409);
  });

  it('rejects invalid planCode', async () => {
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    const res = await request(app)
      .post('/api/subscriptions/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ planCode: 'free' });
    expect(res.status).toBe(400);
  });
});
