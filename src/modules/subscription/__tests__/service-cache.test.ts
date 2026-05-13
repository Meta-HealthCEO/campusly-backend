import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Subscription } from '../model.js';
import { SubscriptionService } from '../service.js';
import { School } from '../../School/model.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await Subscription.deleteMany({});
  await School.deleteMany({ name: /^test_cache/ });
});

beforeEach(async () => {
  await Subscription.deleteMany({});
  await School.deleteMany({ name: /^test_cache/ });
});

afterAll(async () => {
  await Subscription.deleteMany({});
  await School.deleteMany({ name: /^test_cache/ });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('SubscriptionService.syncSchoolCache', () => {
  it('writes planCode + status + currentPeriodEnd to School.subscription', async () => {
    const school = await School.create({
      name: 'test_cache',
      plan: 'standalone',
      joinCode: 'TC0001',
      address: { street: 'TBD', city: 'TBD', province: 'TBD', postalCode: '0', country: 'ZA' },
      contactInfo: { email: 'cache@test.test', phone: '0' },
      subscription: { tier: 'basic', expiresAt: new Date() },
      settings: { academicYear: 2026, terms: 4, gradingSystem: 'percentage' },
    });
    const sub = await Subscription.create({
      schoolId: school._id,
      subscriberType: 'teacher',
      planCode: 'pro_monthly',
      status: 'trialing',
      currentPeriodEnd: new Date('2026-06-01'),
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    await SubscriptionService.syncSchoolCache(sub);
    const refreshed = await School.findById(school._id);
    expect(refreshed?.subscription?.tier).toBe('pro_monthly');
    expect(refreshed?.subscription?.planCode).toBe('pro_monthly');
    expect(refreshed?.subscription?.status).toBe('trialing');
    expect(refreshed?.subscription?.currentPeriodEnd?.toISOString()).toBe(new Date('2026-06-01').toISOString());
  });
});
