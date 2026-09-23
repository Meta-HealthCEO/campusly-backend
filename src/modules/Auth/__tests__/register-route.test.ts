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
import { signTestToken } from '../../../test-utils/auth.js';

const TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test';

const SCHOOL_A = new mongoose.Types.ObjectId();
const SCHOOL_B = new mongoose.Types.ObjectId();

function body(overrides: Record<string, unknown>) {
  return {
    email: `reg-${new mongoose.Types.ObjectId().toString()}@example.test`,
    password: 'Password1',
    firstName: 'Reg',
    lastName: 'Test',
    ...overrides,
  };
}

describe('POST /api/auth/register — role and tenant policy', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_URI);
    }
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('refuses anonymous self-registration as super_admin and creates no user', async () => {
    const res = await request(app).post('/api/auth/register').send(body({ role: 'super_admin' }));

    expect(res.status).toBe(403);
    expect(await User.countDocuments({ role: 'super_admin' })).toBe(0);
  });

  it('refuses anonymous registration as admin of an existing school', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(body({ role: 'school_admin', schoolId: SCHOOL_B.toString() }));

    expect(res.status).toBe(403);
    expect(await User.countDocuments({ schoolId: SCHOOL_B })).toBe(0);
  });

  it('still allows the public school sign-up (school_admin, no school yet)', async () => {
    const res = await request(app).post('/api/auth/register').send(body({ role: 'school_admin' }));

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('school_admin');
  });

  it('lets a school_admin create a student, pinned to the admin’s own school', async () => {
    const token = signTestToken({ role: 'school_admin', schoolId: SCHOOL_A });

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send(body({ role: 'student', schoolId: SCHOOL_A.toString() }));

    expect(res.status).toBe(201);
    expect(res.body.data.user.schoolId).toBe(SCHOOL_A.toString());
  });

  it('stops a school_admin from creating users in another school', async () => {
    const token = signTestToken({ role: 'school_admin', schoolId: SCHOOL_A });

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send(body({ role: 'student', schoolId: SCHOOL_B.toString() }));

    expect(res.status).toBe(403);
  });

  it('lets a super_admin onboard a school_admin for any school', async () => {
    const token = signTestToken({ role: 'super_admin' });

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send(body({ role: 'school_admin', schoolId: SCHOOL_B.toString() }));

    expect(res.status).toBe(201);
    expect(res.body.data.user.schoolId).toBe(SCHOOL_B.toString());
  });

  it('rejects a present-but-invalid token instead of treating the caller as anonymous', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', 'Bearer not-a-real-token')
      .send(body({ role: 'school_admin' }));

    expect(res.status).toBe(401);
  });
});
