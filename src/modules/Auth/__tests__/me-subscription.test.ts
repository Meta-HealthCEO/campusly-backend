import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { AuthService } from '../service.js';
import { User } from '../model.js';
import { School } from '../../School/model.js';
import { Subscription, Plan } from '../../subscription/model.js';
import { seedPlans } from '../../subscription/seed.js';
import { signTestToken } from '../../../test-utils/auth.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await seedPlans();
});

afterAll(async () => {
  await User.deleteMany({ email: /^me\+.*@test\.local$/ });
  await School.deleteMany({ name: /^me_/ });
  await Subscription.deleteMany({});
  await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('GET /api/auth/me returns user + subscription + plan', () => {
  it('returns the free subscription block for a fresh standalone teacher', async () => {
    const email = `me+${Date.now()}@test.local`;
    const { user } = await AuthService.registerTeacher({
      email,
      password: 'Password1!',
      firstName: 'M',
      lastName: 'E',
      schoolName: `me_${Date.now()}`,
    });
    const token = signTestToken({
      id: (user._id as mongoose.Types.ObjectId).toString(),
      schoolId: user.schoolId?.toString(),
      role: 'teacher',
      email,
    });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user).toBeTruthy();
    expect(res.body.data.subscription?.status).toBe('free');
    expect(res.body.data.plan?.code).toBe('free');
  });
});
