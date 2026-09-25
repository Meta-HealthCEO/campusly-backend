import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { Subscription, Invoice, Plan, CheckoutSession } from '../model.js';
import { seedPlans } from '../seed.js';
import { signTestToken } from '../../../test-utils/auth.js';

// Only whoever pays for the school may change its plan or read its invoices:
// a standalone teacher or coach for their own school, or a school's admin or
// principal. Learners and parents share the school's id, so without this a
// learner could cancel their teacher's subscription.

let schoolId: mongoose.Types.ObjectId;

function tokenFor(role: string, flags: { isStandaloneTeacher?: boolean; isSchoolPrincipal?: boolean } = {}): string {
  return signTestToken({
    id: new mongoose.Types.ObjectId(),
    schoolId,
    role,
    isStandaloneTeacher: flags.isStandaloneTeacher ?? false,
    isSchoolPrincipal: flags.isSchoolPrincipal ?? false,
  });
}

async function activePro(): Promise<void> {
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
}

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await seedPlans();
});

beforeEach(async () => {
  schoolId = new mongoose.Types.ObjectId();
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await CheckoutSession.deleteMany({});
  await activePro();
});

afterAll(async () => {
  await Subscription.deleteMany({});
  await Invoice.deleteMany({});
  await CheckoutSession.deleteMany({});
  await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

const OWNER_ONLY: Array<[string, string]> = [
  ['post', '/api/subscriptions/cancel'],
  ['post', '/api/subscriptions/resume'],
  ['post', '/api/subscriptions/checkout'],
  ['get', '/api/subscriptions/invoices'],
  ['get', `/api/subscriptions/checkout-session/${new mongoose.Types.ObjectId().toString()}`],
];

describe('billing routes are for whoever pays', () => {
  for (const [who, role, flags] of [
    ['a learner', 'student', {}],
    ['a parent', 'parent', {}],
    ['a school teacher', 'teacher', {}],
  ] as const) {
    for (const [method, path] of OWNER_ONLY) {
      it(`refuses ${who}: ${method.toUpperCase()} ${path.replace(/[0-9a-f]{24}$/, ':id')}`, async () => {
        const call = method === 'post' ? request(app).post(path).send({}) : request(app).get(path);
        const res = await call.set('Authorization', `Bearer ${tokenFor(role, flags)}`);
        expect(res.status).toBe(403);
      });
    }
  }

  it("leaves a learner's teacher's subscription alone", async () => {
    await request(app).post('/api/subscriptions/cancel')
      .set('Authorization', `Bearer ${tokenFor('student')}`).send({});
    const sub = await Subscription.findOne({ schoolId }).lean();
    expect(sub?.status).toBe('active');
    expect(sub?.cancelAtPeriodEnd).not.toBe(true);
  });

  it('lets the standalone teacher cancel', async () => {
    const res = await request(app).post('/api/subscriptions/cancel')
      .set('Authorization', `Bearer ${tokenFor('teacher', { isStandaloneTeacher: true })}`).send({});
    expect(res.status).toBe(200);
  });

  it("lets a school's admin and principal read invoices", async () => {
    for (const token of [tokenFor('school_admin'), tokenFor('principal'), tokenFor('teacher', { isSchoolPrincipal: true })]) {
      const res = await request(app).get('/api/subscriptions/invoices').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    }
  });

  it('still lets a learner read the plan (for what the app shows them)', async () => {
    const res = await request(app).get('/api/subscriptions/me').set('Authorization', `Bearer ${tokenFor('student')}`);
    expect(res.status).toBe(200);
  });
});
