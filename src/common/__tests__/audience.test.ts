import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { roleUserIds } from '../audience.js';
import { User } from '../../modules/Auth/model.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

const oid = () => new mongoose.Types.ObjectId();

describe('roleUserIds', () => {
  it('excludes inactive users', async () => {
    const schoolId = oid();
    const active = oid();
    const inactive = oid();
    await User.collection.insertMany([
      { _id: active, schoolId, firstName: 'Active', lastName: 'T', email: `a${active}@t.local`, role: 'teacher', isDeleted: false, isActive: true },
      { _id: inactive, schoolId, firstName: 'Inactive', lastName: 'T', email: `i${inactive}@t.local`, role: 'teacher', isDeleted: false, isActive: false },
    ]);

    const ids = await roleUserIds(schoolId, ['teacher']);

    expect(ids).toContain(String(active));
    expect(ids).not.toContain(String(inactive));
  });
});
