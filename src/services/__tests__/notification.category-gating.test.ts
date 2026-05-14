import { afterEach, beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { NotificationDispatchService } from '../notification.service.js';
import { PushService } from '../push.service.js';
import { NotificationPreference } from '../../modules/Notification/model.js';
import { DeviceRegistration } from '../../modules/Communication/delivery-model.js';

const TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test';

describe('NotificationDispatchService.dispatch — category gating', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(TEST_URI);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all([
      NotificationPreference.deleteMany({}),
      DeviceRegistration.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('skips push when the category is disabled in user preferences', async () => {
    const userId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();

    await NotificationPreference.create({
      userId,
      schoolId,
      push: true,
      categories: {
        homework: false,
        grades: true,
        attendance: true,
        billing: true,
        announcements: true,
      },
    });

    await DeviceRegistration.create({
      userId,
      schoolId,
      deviceToken: 'tok-test-1',
      platform: 'ios',
    });

    const spy = vi
      .spyOn(PushService, 'sendPushBatch')
      .mockResolvedValue({ success: true, failedTokens: undefined } as never);

    await NotificationDispatchService.dispatch({
      type: 'push',
      recipientUserId: String(userId),
      schoolId: String(schoolId),
      title: 'New homework',
      message: 'Maths due Friday',
      data: { category: 'homework', deepLink: 'campusly://homework/x', notificationId: 'n1' },
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('sends push when the category is enabled', async () => {
    const userId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();

    await NotificationPreference.create({
      userId,
      schoolId,
      push: true,
      // omit categories to exercise defaults (all true)
    });

    await DeviceRegistration.create({
      userId,
      schoolId,
      deviceToken: 'tok-test-2',
      platform: 'ios',
    });

    const spy = vi
      .spyOn(PushService, 'sendPushBatch')
      .mockResolvedValue({ success: true, failedTokens: undefined } as never);

    await NotificationDispatchService.dispatch({
      type: 'push',
      recipientUserId: String(userId),
      schoolId: String(schoolId),
      title: 'New homework',
      message: 'Maths due Friday',
      data: { category: 'homework', deepLink: 'campusly://homework/x', notificationId: 'n1' },
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('sends push when no category is specified (legacy path)', async () => {
    const userId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();

    await NotificationPreference.create({ userId, schoolId, push: true });
    await DeviceRegistration.create({ userId, schoolId, deviceToken: 'tok-3', platform: 'ios' });

    const spy = vi
      .spyOn(PushService, 'sendPushBatch')
      .mockResolvedValue({ success: true, failedTokens: undefined } as never);

    await NotificationDispatchService.dispatch({
      type: 'push',
      recipientUserId: String(userId),
      schoolId: String(schoolId),
      title: 'Generic notice',
      message: 'no category here',
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('sends push when no preference doc exists (default-allow)', async () => {
    const userId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();
    // intentionally do NOT create a NotificationPreference
    await DeviceRegistration.create({ userId, schoolId, deviceToken: 'tok-4', platform: 'ios' });

    const spy = vi
      .spyOn(PushService, 'sendPushBatch')
      .mockResolvedValue({ success: true, failedTokens: undefined } as never);

    await NotificationDispatchService.dispatch({
      type: 'push',
      recipientUserId: String(userId),
      schoolId: String(schoolId),
      title: 'Welcome',
      message: 'first notification',
      data: { category: 'homework', deepLink: 'campusly://x', notificationId: 'n1' },
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
