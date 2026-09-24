import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { NoticeBoardService } from '../service.js';
import { classSchool } from '../../../test-utils/class-school.js';
import { Notification } from '../../Notification/model.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

const notified = async (userIds: mongoose.Types.ObjectId[]) =>
  Promise.all(userIds.map((id) => Notification.countDocuments({ recipientId: id, isDeleted: false })));

describe('class notices reach the class', () => {
  it("notifies the class's learners and their parents once each, and no one else", async () => {
    const f = await classSchool();
    await NoticeBoardService.createPost(String(f.thandi), 'Thandi M', 'teacher', String(f.schoolId), {
      scope: 'class', scopeId: String(f.classA), title: 'Sports day', content: 'Wear house colours on Friday.',
    } as never);
    expect(await notified([f.lebo.userId, f.sipho.userId, f.pUser, f.qUser])).toEqual([1, 1, 1, 1]);
    expect(await notified([f.jan.userId, f.janParent, f.thandi])).toEqual([0, 0, 0]);
  });

  it("refuses a class the teacher doesn't teach, and notifies nobody", async () => {
    const f = await classSchool();
    await expect(NoticeBoardService.createPost(String(f.thandi), 'Thandi M', 'teacher', String(f.schoolId), {
      scope: 'class', scopeId: String(f.classB), title: 'Hi', content: 'Hello',
    } as never)).rejects.toThrow();
    expect(await notified([f.jan.userId, f.janParent])).toEqual([0, 0]);
  });

  it('lets a parent linked only as a guardian read their child\'s class board', async () => {
    const f = await classSchool();
    await expect(NoticeBoardService.listPosts(String(f.qUser), 'parent', String(f.schoolId), { scope: 'class', scopeId: String(f.classA) } as never))
      .resolves.toBeDefined();
  });

  it("puts a class notice in its learners' and parents' feeds, whichever way the parent is linked", async () => {
    const f = await classSchool();
    await NoticeBoardService.createPost(String(f.thandi), 'Thandi M', 'teacher', String(f.schoolId), {
      scope: 'class', scopeId: String(f.classA), title: 'Library day', content: 'Bring your books back.',
    } as never);
    const feed = async (userId: unknown, role: string) =>
      (await NoticeBoardService.getPostsByUser(String(userId), role, String(f.schoolId), {} as never)).data.map((p) => p.title);
    expect(await feed(f.lebo.userId, 'student')).toContain('Library day');
    expect(await feed(f.qUser, 'parent')).toContain('Library day');
    expect(await feed(f.jan.userId, 'student')).not.toContain('Library day');
  });
});
