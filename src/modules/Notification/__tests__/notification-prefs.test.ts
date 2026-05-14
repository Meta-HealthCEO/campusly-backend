import { afterEach, beforeAll, afterAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { NotificationPreference } from '../model.js';

const TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test';

describe('NotificationPreference.categories', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(TEST_URI);
  });
  afterEach(async () => { await NotificationPreference.deleteMany({}); });
  afterAll(async () => { await mongoose.connection.close(); });

  it('defaults every category to true', async () => {
    const pref = await NotificationPreference.create({
      userId: new mongoose.Types.ObjectId(),
      schoolId: new mongoose.Types.ObjectId(),
    });
    expect(pref.categories.homework).toBe(true);
    expect(pref.categories.grades).toBe(true);
    expect(pref.categories.attendance).toBe(true);
    expect(pref.categories.billing).toBe(true);
    expect(pref.categories.announcements).toBe(true);
  });

  it('allows disabling a single category', async () => {
    const pref = await NotificationPreference.create({
      userId: new mongoose.Types.ObjectId(),
      schoolId: new mongoose.Types.ObjectId(),
      categories: {
        homework: false,
        grades: true,
        attendance: true,
        billing: true,
        announcements: true,
      },
    });
    expect(pref.categories.homework).toBe(false);
    expect(pref.categories.grades).toBe(true);
  });

  it('persists categories alongside the existing boolean channel flags', async () => {
    const pref = await NotificationPreference.create({
      userId: new mongoose.Types.ObjectId(),
      schoolId: new mongoose.Types.ObjectId(),
      push: false,
      categories: {
        homework: true,
        grades: true,
        attendance: false,
        billing: true,
        announcements: true,
      },
    });
    expect(pref.push).toBe(false);
    expect(pref.categories.attendance).toBe(false);
  });
});
