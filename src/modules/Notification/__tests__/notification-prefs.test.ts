import { afterEach, beforeAll, afterAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { NotificationPreference } from '../model.js';
import { NotificationService } from '../service.js';

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

  it('allows creating a preference without schoolId (legacy/pre-backfill state)', async () => {
    const pref = await NotificationPreference.create({
      userId: new mongoose.Types.ObjectId(),
      // schoolId intentionally omitted
    });
    expect(pref.schoolId).toBeUndefined();
    expect(pref.categories.homework).toBe(true);
  });

  it('NotificationService.getPreferences persists schoolId on lazy-create', async () => {
    const userId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();

    const pref = await NotificationService.getPreferences(String(userId), String(schoolId));

    expect(pref.schoolId?.toString()).toBe(String(schoolId));
  });

  it('NotificationService.updatePreferences accepts categories and stores them with schoolId', async () => {
    const userId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();

    const pref = await NotificationService.updatePreferences(
      String(userId),
      String(schoolId),
      { categories: { homework: false } } as Parameters<typeof NotificationService.updatePreferences>[2],
    );

    expect(pref.schoolId?.toString()).toBe(String(schoolId));
    expect(pref.categories.homework).toBe(false);
    expect(pref.categories.grades).toBe(true); // defaults preserved
  });
});
