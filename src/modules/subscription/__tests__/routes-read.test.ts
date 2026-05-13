import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { Subscription, Plan } from '../model.js';
import { seedPlans } from '../seed.js';
import { signTestToken } from '../../../test-utils/auth.js';

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

describe('GET /api/subscriptions/me + GET /api/plans', () => {
  it('GET /api/plans returns active plans sorted by displayOrder', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const token = signTestToken({ id: new mongoose.Types.ObjectId(), schoolId, role: 'teacher' });
    const res = await request(app).get('/api/plans').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.map((p: { code: string }) => p.code)).toEqual(['free', 'pro_monthly', 'pro_annual']);
  });

  it('GET /api/subscriptions/me returns the user school subscription + plan', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const token = signTestToken({ id: new mongoose.Types.ObjectId(), schoolId, role: 'teacher' });
    await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    const res = await request(app).get('/api/subscriptions/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.subscription.status).toBe('free');
    expect(res.body.data.plan.code).toBe('free');
  });

  it('GET /api/subscriptions/me auto-creates free sub for new user', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const token = signTestToken({ id: new mongoose.Types.ObjectId(), schoolId, role: 'teacher' });
    const res = await request(app).get('/api/subscriptions/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.subscription.status).toBe('free');
    const count = await Subscription.countDocuments({ schoolId });
    expect(count).toBe(1);
  });
});
