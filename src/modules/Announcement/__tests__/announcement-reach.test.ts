import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { AnnouncementService } from '../service.js';
import { Notification } from '../../Notification/model.js';
import { classSchool } from '../../../test-utils/class-school.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

const titles = async (schoolId: mongoose.Types.ObjectId, role: string, userId: mongoose.Types.ObjectId) =>
  (await AnnouncementService.getActive(String(schoolId), role, {}, String(userId))).announcements.map((a) => a.title);

describe('announcements reach their audience', () => {
  it("a grade announcement reaches that grade's parents and learners only", async () => {
    const f = await classSchool();
    const a = await AnnouncementService.create({
      schoolId: String(f.schoolId), title: 'Grade 1 outing', content: 'Zoo trip.', targetAudience: 'grade', targetId: String(f.gradeId), priority: 'medium',
    } as never, String(oidOf()));
    await AnnouncementService.publish(String(a._id), String(f.schoolId));
    expect(await titles(f.schoolId, 'parent', f.qUser)).toContain('Grade 1 outing');
    expect(await titles(f.schoolId, 'student', f.lebo.userId)).toContain('Grade 1 outing');
    expect(await titles(f.schoolId, 'parent', f.janParent)).not.toContain('Grade 1 outing');
    const n = await Notification.countDocuments({ 'data.entityId': String(a._id) });
    expect(n).toBe(4);
  });

  it('publishing to parents notifies every parent once, and publishing again notifies no one twice', async () => {
    const f = await classSchool();
    const a = await AnnouncementService.create({
      schoolId: String(f.schoolId), title: 'Fees due', content: 'Friday.', targetAudience: 'parents', priority: 'high',
    } as never, String(oidOf()));
    await AnnouncementService.publish(String(a._id), String(f.schoolId));
    await AnnouncementService.publish(String(a._id), String(f.schoolId));
    const recipients = await Notification.find({ 'data.entityId': String(a._id) }).distinct('recipientId');
    expect(recipients.map(String).sort()).toEqual([f.pUser, f.qUser, f.janParent].map(String).sort());
    expect(await Notification.countDocuments({ 'data.entityId': String(a._id) })).toBe(3);
  });
});

function oidOf() {
  return new mongoose.Types.ObjectId();
}
