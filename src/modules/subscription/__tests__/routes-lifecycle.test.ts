import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { Subscription, Invoice, Plan, CheckoutSession } from '../model.js';
import { seedPlans } from '../seed.js';
import { signTestToken } from '../../../test-utils/auth.js';

let schoolId: mongoose.Types.ObjectId;
let token: string;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await CheckoutSession.deleteMany({});
  await seedPlans();
});

beforeEach(async () => {
  schoolId = new mongoose.Types.ObjectId();
  token = signTestToken({ id: new mongoose.Types.ObjectId(), schoolId, role: 'teacher' });
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await CheckoutSession.deleteMany({});
});

afterAll(async () => {
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await CheckoutSession.deleteMany({});
  await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('Subscription lifecycle routes', () => {
  it('POST /cancel marks cancel-at-period-end', async () => {
    const pEnd = new Date(Date.now() + 20 * 86400000);
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'active',
      currentPeriodEnd: pEnd,
      nextBillingAt: pEnd,
      cardTokenGuid: 'g',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    const res = await request(app)
      .post('/api/subscriptions/cancel')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('canceled');
    expect(res.body.data.cancelAtPeriodEnd).toBe(true);
  });

  it('POST /resume restores active status', async () => {
    const pEnd = new Date(Date.now() + 20 * 86400000);
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'canceled',
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
      currentPeriodEnd: pEnd,
      nextBillingAt: pEnd,
      cardTokenGuid: 'g',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    const res = await request(app)
      .post('/api/subscriptions/resume')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('active');
  });

  it('GET /invoices returns user school invoices', async () => {
    const sub = await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'active',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    await Invoice.create({
      subscriptionId: sub._id,
      schoolId,
      planCode: 'pro_monthly',
      subtotal: 14900,
      tax: 0,
      taxRate: 0,
      total: 14900,
      currency: 'ZAR',
      status: 'paid',
      merchantReference: 'inv_test1',
      periodStart: new Date(),
      periodEnd: new Date(),
      paidAt: new Date(),
      purpose: 'subscription',
    });
    const res = await request(app)
      .get('/api/subscriptions/invoices')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('paid');
  });

  it('GET /checkout-session/:id returns session status', async () => {
    const session = await CheckoutSession.create({
      userId: new mongoose.Types.ObjectId(),
      schoolId,
      planCode: 'pro_monthly',
      merchantReference: 'sub_xxx',
      paymentKey: 'k',
      purpose: 'tokenisation',
      status: 'completed',
      expiresAt: new Date(Date.now() + 1000),
    });
    const res = await request(app)
      .get(`/api/subscriptions/checkout-session/${session._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
  });
});
