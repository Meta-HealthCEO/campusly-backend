import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../model.js';
import { AuthService } from '../service.js';
import { UnauthorizedError, BadRequestError } from '../../../common/errors.js';

const FILE_SCHOOL_ID = new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
beforeEach(async () => {
  await User.deleteMany({ schoolId: FILE_SCHOOL_ID });
});

async function makeUser(overrides: Partial<{ password: string; mustChangePassword: boolean }> = {}) {
  const user = await User.create({
    email: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`,
    firstName: 'Test',
    lastName: 'User',
    role: 'student',
    schoolId: FILE_SCHOOL_ID,
    password: overrides.password ?? 'OldPass123',
    mustChangePassword: overrides.mustChangePassword ?? true,
  });
  return user;
}

describe('AuthService.changePassword', () => {
  it('updates the password hash and clears mustChangePassword on success', async () => {
    const user = await makeUser({ password: 'OldPass123', mustChangePassword: true });
    await AuthService.changePassword(user._id.toString(), 'OldPass123', 'NewPass456');

    const reloaded = await User.findById(user._id).select('+password');
    expect(reloaded).not.toBeNull();
    const ok = await bcrypt.compare('NewPass456', reloaded!.password);
    expect(ok).toBe(true);
    expect(reloaded!.mustChangePassword).toBe(false);
  });

  it('rejects when currentPassword does not match', async () => {
    const user = await makeUser({ password: 'OldPass123' });
    await expect(
      AuthService.changePassword(user._id.toString(), 'WrongPass1', 'NewPass456'),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects when newPassword equals currentPassword', async () => {
    const user = await makeUser({ password: 'SamePass123' });
    await expect(
      AuthService.changePassword(user._id.toString(), 'SamePass123', 'SamePass123'),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects when user not found', async () => {
    const nonexistent = new mongoose.Types.ObjectId().toString();
    await expect(
      AuthService.changePassword(nonexistent, 'OldPass123', 'NewPass456'),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
