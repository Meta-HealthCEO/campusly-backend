import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { StandaloneService } from '../../Auth/standalone.service.js';
import { User } from '../../Auth/model.js';
import { School } from '../../School/model.js';
import { Subscription } from '../model.js';
import { isBillingOwner } from '../../../middleware/require-billing-owner.js';
import { signTestToken } from '../../../test-utils/auth.js';

// A school's subscription is read by every signed-in member of the school, but
// the card token and the gateway's customer reference never leave the server,
// and the card and why a payment failed are only for whoever pays.

type Oid = mongoose.Types.ObjectId;

const SECRET = ['cardTokenGuid', 'gatewayCustomerRef', 'processingLockedAt'];
const OWNER_ONLY = ['cardLastFour', 'cardBrand', 'cardExpiryMonth', 'cardExpiryYear', 'lastFailureReason', 'retryCount', 'nextRetryAt'];

let schoolId: Oid;
let ownerToken: string;
let learnerToken: string;
let parentToken: string;

async function member(role: 'student' | 'parent'): Promise<string> {
  const id = new mongoose.Types.ObjectId();
  const email = `cp-${role}-${id.toString()}@test.local`;
  await User.collection.insertOne({
    _id: id, schoolId, firstName: 'cp', lastName: role, email, role,
    isActive: true, isDeleted: false, refreshTokens: [], createdAt: new Date(), updatedAt: new Date(),
  });
  return signTestToken({ id, schoolId, role, email, isStandaloneTeacher: false, isSchoolPrincipal: false });
}

const me = (token: string) => request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
const mine = (token: string) => request(app).get('/api/subscriptions/me').set('Authorization', `Bearer ${token}`);

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  const { user, tokens } = await StandaloneService.signup({
    firstName: 'cp_Teacher', lastName: 'T', email: `cp+${Date.now()}@test.local`, password: 'Password1',
  });
  schoolId = user.schoolId as Oid;
  ownerToken = tokens.accessToken;
  await Subscription.updateOne({ schoolId }, {
    $set: {
      status: 'past_due', planCode: 'pro_monthly',
      currentPeriodEnd: new Date(Date.now() + 20 * 86400000),
      cardTokenGuid: 'tok_secret', gatewayCustomerRef: 'cus_secret', processingLockedAt: new Date(),
      cardLastFour: '4242', cardBrand: 'visa', cardExpiryMonth: 12, cardExpiryYear: 2030,
      lastFailureReason: 'Insufficient funds', retryCount: 1, nextRetryAt: new Date(Date.now() + 2 * 86400000),
    },
  });
  learnerToken = await member('student');
  parentToken = await member('parent');
});

afterAll(async () => {
  await User.deleteMany({ schoolId });
  await Subscription.deleteMany({ schoolId });
  await School.deleteMany({ _id: schoolId });
  await mongoose.disconnect();
});

describe('the card token never leaves the server; card details only for whoever pays', () => {
  for (const [who, token] of [['a learner', () => learnerToken], ['a parent', () => parentToken]] as const) {
    it(`${who} gets the plan's status from /auth/me and /subscriptions/me, and no card data`, async () => {
      const fromMe = await me(token());
      const fromMine = await mine(token());
      expect(fromMe.status).toBe(200);
      expect(fromMine.status).toBe(200);
      for (const sub of [fromMe.body.data.subscription, fromMine.body.data.subscription] as Array<Record<string, unknown>>) {
        expect(sub.status).toBe('past_due');
        for (const key of [...SECRET, ...OWNER_ONLY]) expect(sub).not.toHaveProperty(key);
      }
    });
  }

  it('the owner gets the card and the failure, never the token or the customer reference', async () => {
    for (const res of [await me(ownerToken), await mine(ownerToken)]) {
      expect(res.status).toBe(200);
      const sub = res.body.data.subscription as Record<string, unknown>;
      expect(sub).toMatchObject({
        cardLastFour: '4242', cardBrand: 'visa', cardExpiryMonth: 12, cardExpiryYear: 2030,
        lastFailureReason: 'Insufficient funds', retryCount: 1,
      });
      expect(sub.nextRetryAt).toBeTruthy();
      for (const key of SECRET) expect(sub).not.toHaveProperty(key);
    }
  });

  it('cancel and resume answer the owner without the token or the customer reference', async () => {
    await Subscription.updateOne({ schoolId }, { $set: { status: 'active' } });
    const cancel = await request(app).post('/api/subscriptions/cancel').set('Authorization', `Bearer ${ownerToken}`).send({});
    expect(cancel.status).toBe(200);
    expect(cancel.body.data.status).toBe('canceled');
    expect(cancel.body.data.cardLastFour).toBe('4242');
    for (const key of SECRET) expect(cancel.body.data).not.toHaveProperty(key);

    const resume = await request(app).post('/api/subscriptions/resume').set('Authorization', `Bearer ${ownerToken}`).send({});
    expect(resume.status).toBe(200);
    expect(resume.body.data.status).toBe('active');
    for (const key of SECRET) expect(resume.body.data).not.toHaveProperty(key);
  });
});

describe('isBillingOwner (the requireBillingOwner rule)', () => {
  it('is whoever pays: a standalone teacher or coach, a principal, a school admin, a super admin', () => {
    expect(isBillingOwner({ role: 'teacher', isStandaloneTeacher: true })).toBe(true);
    expect(isBillingOwner({ role: 'coach', isStandaloneCoach: true })).toBe(true);
    expect(isBillingOwner({ role: 'teacher', isSchoolPrincipal: true })).toBe(true);
    expect(isBillingOwner({ role: 'school_admin' })).toBe(true);
    expect(isBillingOwner({ role: 'principal' })).toBe(true);
    expect(isBillingOwner({ role: 'super_admin' })).toBe(true);
  });

  it('is nobody else', () => {
    expect(isBillingOwner({ role: 'student' })).toBe(false);
    expect(isBillingOwner({ role: 'parent' })).toBe(false);
    expect(isBillingOwner({ role: 'teacher' })).toBe(false);
    expect(isBillingOwner(null)).toBe(false);
    expect(isBillingOwner(undefined)).toBe(false);
  });
});
