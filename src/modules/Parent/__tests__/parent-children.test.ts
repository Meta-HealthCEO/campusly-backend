import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { ParentService } from '../service.js';
import { classSchool } from '../../../test-utils/class-school.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe("a parent's own record (GET /parents/me)", () => {
  it('lists a child who names the parent as a guardian, with the child\'s name', async () => {
    const f = await classSchool();
    const me = await ParentService.getByUserId(String(f.qUser));
    const children = me.childrenIds as unknown as Array<{ _id: unknown; userId: { firstName: string } }>;
    expect(children.map((c) => String(c._id))).toEqual([String(f.sipho.id)]);
    expect(children[0].userId.firstName).toBe('Sipho');
  });

  it('lists each child once when linked both ways', async () => {
    const f = await classSchool();
    await mongoose.connection.collection('students').updateOne({ _id: f.lebo.id }, { $set: { guardianIds: [] } });
    const parent = await mongoose.connection.collection('parents').findOne({ userId: f.pUser });
    await mongoose.connection.collection('students').updateOne({ _id: f.lebo.id }, { $set: { guardianIds: [parent?._id] } });
    const me = await ParentService.getByUserId(String(f.pUser));
    expect((me.childrenIds as unknown[]).length).toBe(1);
  });
});
