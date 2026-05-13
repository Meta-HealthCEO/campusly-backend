import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import express, { type Request, type Response, type NextFunction } from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { Subscription, Plan } from '../model.js';
import { requireEntitlement, resolveEntitlements } from '../entitlements.js';
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

function makeApp(feature: string) {
  const a = express();
  a.use(express.json());
  a.use((req: Request, _res: Response, next: NextFunction) => {
    const schoolId = req.headers['x-school-id'];
    req.user = {
      id: 'test',
      email: 'test@test.test',
      role: 'teacher' as never,
      schoolId: typeof schoolId === 'string' ? schoolId : undefined,
    };
    next();
  });
  a.get('/protected', requireEntitlement(feature), (_req, res) => {
    res.json({ ok: true });
  });
  return a;
}

describe('requireEntitlement middleware', () => {
  it('blocks free user from aiGeneration', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    const res = await request(makeApp('aiGeneration'))
      .get('/protected')
      .set('x-school-id', schoolId.toString());
    expect(res.status).toBe(402);
  });

  it('allows pro_monthly user', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'active',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    const res = await request(makeApp('aiGeneration'))
      .get('/protected')
      .set('x-school-id', schoolId.toString());
    expect(res.status).toBe(200);
  });

  it('allows trialing user', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'trialing',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    const res = await request(makeApp('aiGeneration'))
      .get('/protected')
      .set('x-school-id', schoolId.toString());
    expect(res.status).toBe(200);
  });

  it('resolveEntitlements returns no aiGeneration for free plan', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    const ents = await resolveEntitlements(schoolId);
    expect(ents.aiGeneration).toBeFalsy();
  });
});
