import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Subscription, Plan } from '../model.js';
import { School } from '../../School/model.js';
import { migrateGrandfather, GRANDFATHER_CUTOFF } from '../migrate-grandfather.js';
import { seedPlans } from '../seed.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  await School.deleteMany({ name: /^mg_/ });
  await Subscription.deleteMany({});
  await seedPlans();
});

beforeEach(async () => {
  await School.deleteMany({ name: /^mg_/ });
  await Subscription.deleteMany({});
});

afterAll(async () => {
  await School.deleteMany({ name: /^mg_/ });
  await Subscription.deleteMany({});
  await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

function makeSchoolDoc(name: string, plan: 'standalone' | 'school') {
  return {
    name,
    plan,
    joinCode: name.toUpperCase().slice(0, 6),
    address: { street: 'TBD', city: 'TBD', province: 'TBD', postalCode: '0', country: 'ZA' },
    contactInfo: { email: `${name}@test.test`, phone: '0' },
    settings: { academicYear: 2026, terms: 4, gradingSystem: 'percentage' as const },
  };
}

describe('migrateGrandfather', () => {
  it('creates active pro_monthly Subscription for existing standalone-teacher school without one', async () => {
    const school = await School.create(makeSchoolDoc('mg_exist', 'standalone'));
    await migrateGrandfather();
    const sub = await Subscription.findOne({ schoolId: school._id });
    expect(sub?.status).toBe('active');
    expect(sub?.planCode).toBe('pro_monthly');
    expect(sub?.cancelAtPeriodEnd).toBe(true);
    expect(sub?.currentPeriodEnd?.getTime()).toBe(GRANDFATHER_CUTOFF.getTime());
  });

  it('does not overwrite existing Subscription', async () => {
    const school = await School.create(makeSchoolDoc('mg_has', 'standalone'));
    await Subscription.create({
      schoolId: school._id,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    await migrateGrandfather();
    const sub = await Subscription.findOne({ schoolId: school._id });
    expect(sub?.status).toBe('free');
  });

  it('backfills non-standalone schools with Free', async () => {
    const school = await School.create(makeSchoolDoc('mg_real', 'school'));
    await migrateGrandfather();
    const sub = await Subscription.findOne({ schoolId: school._id });
    expect(sub?.status).toBe('free');
    expect(sub?.planCode).toBe('free');
  });
});
