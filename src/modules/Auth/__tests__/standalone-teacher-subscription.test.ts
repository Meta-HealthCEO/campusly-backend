import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { AuthService } from '../service.js';
import { StandaloneService } from '../standalone.service.js';
import { Subscription } from '../../subscription/model.js';
import { School } from '../../School/model.js';
import { User } from '../model.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  await User.deleteMany({ email: /^t\+.*@test\.local$/ });
  await School.deleteMany({ name: /^t_signup_/ });
  await Subscription.deleteMany({});
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('teacher signup creates Free subscription', () => {
  it('AuthService.registerTeacher creates Subscription with status=free', async () => {
    const email = `t+${Date.now()}-a@test.local`;
    const { user } = await AuthService.registerTeacher({
      email,
      password: 'Password1!',
      firstName: 'T',
      lastName: 'X',
      schoolName: `t_signup_${Date.now()}_a`,
    });
    const sub = await Subscription.findOne({ schoolId: user.schoolId });
    expect(sub).not.toBeNull();
    expect(sub?.status).toBe('free');
    expect(sub?.planCode).toBe('free');
  });

  it('StandaloneService.signup creates Subscription with status=free', async () => {
    const email = `t+${Date.now()}-b@test.local`;
    const { user } = await StandaloneService.signup({
      email,
      password: 'Password1!',
      firstName: 'T',
      lastName: 'Y',
    });
    const sub = await Subscription.findOne({ schoolId: user.schoolId });
    expect(sub).not.toBeNull();
    expect(sub?.status).toBe('free');
    expect(sub?.planCode).toBe('free');
  });
});
