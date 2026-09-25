import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { User } from '../model.js';
import { issueEmailVerification, verifyEmail, resendEmailVerification, isEmailVerified } from '../email-verification.js';
import { EmailService } from '../../../services/email.service.js';
import { backfillEmailVerified } from '../../../scripts/backfill-email-verified.js';

const TEST_EMAIL = /^v[0-9a-f]{24}@t\.local$/;

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterEach(() => { vi.restoreAllMocks(); });
afterAll(async () => {
  await User.collection.deleteMany({ email: TEST_EMAIL });
  await mongoose.disconnect();
});

const newTeacher = async () => (await User.collection.insertOne({
  email: `v${new mongoose.Types.ObjectId()}@t.local`, firstName: 'Vee', lastName: 'T', role: 'teacher',
  schoolId: new mongoose.Types.ObjectId(), isStandaloneTeacher: true, isDeleted: false, isActive: true, createdAt: new Date(),
})).insertedId;

describe('email verification', () => {
  it('emails a link, and the link verifies the teacher once', async () => {
    const send = vi.spyOn(EmailService, 'sendEmailVerification').mockResolvedValue(undefined as never);
    const id = await newTeacher();
    const { token } = await issueEmailVerification(String(id));
    expect(send.mock.calls[0][1]).toContain(`/verify-email?token=${token}`);
    const stored = await User.findById(id).select('+emailVerifyToken').lean();
    expect(stored?.emailVerifyToken).toMatch(/^[0-9a-f]{64}$/);
    expect(stored?.emailVerifyToken).not.toBe(token); // stored hashed
    await verifyEmail(token);
    const verified = await User.findById(id).lean();
    expect(verified?.emailVerifiedAt).toBeInstanceOf(Date);
    expect(isEmailVerified(verified!)).toBe(true);
    await expect(verifyEmail(token)).rejects.toThrow('This link has expired or was already used');
  });

  it('refuses an expired link', async () => {
    vi.spyOn(EmailService, 'sendEmailVerification').mockResolvedValue(undefined as never);
    const id = await newTeacher();
    const { token } = await issueEmailVerification(String(id));
    await User.collection.updateOne({ _id: id }, { $set: { emailVerifyExpires: new Date(Date.now() - 1000) } });
    await expect(verifyEmail(token)).rejects.toThrow('expired');
  });

  it('allows three resends an hour, then refuses', async () => {
    vi.spyOn(EmailService, 'sendEmailVerification').mockResolvedValue(undefined as never);
    const id = String(await newTeacher());
    await resendEmailVerification(id); await resendEmailVerification(id); await resendEmailVerification(id);
    await expect(resendEmailVerification(id)).rejects.toThrow('Try again in an hour');
  });

  it('counts teachers who existed before verification shipped as verified', async () => {
    const id = await newTeacher();
    await backfillEmailVerified({ apply: true });
    const u = await User.findById(id).lean();
    expect(u?.emailVerifiedAt?.getTime()).toBe((u as unknown as { createdAt: Date }).createdAt.getTime());
  });

  it('does not backfill a teacher who signed up after verification shipped', async () => {
    const id = await newTeacher();
    await User.collection.updateOne({ _id: id }, { $set: { emailVerifiedAt: null } });
    await backfillEmailVerified({ apply: true });
    expect((await User.findById(id).lean())?.emailVerifiedAt ?? null).toBeNull();
    expect(isEmailVerified({ emailVerifiedAt: null })).toBe(false);
  });
});
