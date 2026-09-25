import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';

// Rate limiting is not under test here, and its Redis client blocks forever
// when Redis is down (maxRetriesPerRequest: null), so swap in a pass-through.
vi.mock('../../../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

import app from '../../../app.js';
import { User } from '../model.js';
import { School } from '../../School/model.js';
import { Subscription } from '../../subscription/model.js';
import { EmailService } from '../../../services/email.service.js';

const EMAIL = /^verify\+[0-9a-f]{24}@example\.test$/;

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterEach(() => { vi.restoreAllMocks(); });
afterAll(async () => {
  const users = await User.find({ email: EMAIL }).select('schoolId').lean();
  const schoolIds = users.flatMap((u) => (u.schoolId ? [u.schoolId] : []));
  await Subscription.deleteMany({ schoolId: { $in: schoolIds } });
  await School.deleteMany({ _id: { $in: schoolIds } });
  await User.deleteMany({ email: EMAIL });
  await mongoose.disconnect();
});

const signUp = () => request(app).post('/api/auth/signup/standalone-teacher').send({
  firstName: 'Vera', lastName: 'Fy', email: `verify+${new mongoose.Types.ObjectId()}@example.test`, password: 'Password1',
});

describe('email verification routes', () => {
  it('sign-up emails a link; the link verifies; /auth/me shows it', async () => {
    const send = vi.spyOn(EmailService, 'sendEmailVerification').mockResolvedValue({ success: true });
    const res = await signUp();
    expect(res.status).toBe(201);
    expect(res.body.data.user.emailVerifiedAt).toBeNull();
    const token = new URL(send.mock.calls[0][1]).searchParams.get('token');
    const auth = `Bearer ${res.body.data.accessToken}`;

    const before = await request(app).get('/api/auth/me').set('Authorization', auth);
    expect(before.body.data.user.emailVerifiedAt).toBeNull();

    expect((await request(app).post('/api/auth/verify-email').send({ token })).status).toBe(200);
    const after = await request(app).get('/api/auth/me').set('Authorization', auth);
    expect(after.body.data.user.emailVerifiedAt).toEqual(expect.any(String));
    expect(after.body.data.user.emailVerifyToken).toBeUndefined();

    const resend = await request(app).post('/api/auth/resend-verification').set('Authorization', auth);
    expect(resend.body.data).toEqual({ sent: false });
  });

  it('sign-up still succeeds when the email cannot be sent', async () => {
    vi.spyOn(EmailService, 'sendEmailVerification').mockRejectedValue(new Error('mail down'));
    expect((await signUp()).status).toBe(201);
  });

  it('refuses a made-up link with a plain message', async () => {
    const res = await request(app).post('/api/auth/verify-email').send({ token: 'a'.repeat(64) });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('This link has expired or was already used');
  });

  it('resend needs a signed-in user', async () => {
    expect((await request(app).post('/api/auth/resend-verification')).status).toBe(401);
  });
});
