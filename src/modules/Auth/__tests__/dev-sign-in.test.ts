import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';

// Rate limiting is not under test here, and its Redis client blocks forever
// when Redis is down, so swap in a pass-through.
vi.mock('../../../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

// Open the gate and swap the demo emails for ones this test owns, so the real
// demo accounts in a shared database never leak into the assertions.
const { EMAILS } = vi.hoisted(() => {
  const tag = globalThis.crypto.randomUUID().slice(0, 8);
  const email = (name: string) => `devsignin-${name}-${tag}@example.test`;
  return {
    EMAILS: {
      own: email('own'),
      admin: email('admin'),
      teacher: email('teacher'),
      hod: email('hod'),
      deletedLearner: email('deleted-learner'),
      learner: email('learner'),
      parent: email('parent'),
      missing: email('missing'),
      stranger: email('stranger'),
    },
  };
});

vi.mock('../../../config/dev-sign-in.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../config/dev-sign-in.js')>()),
  isDevSignInEnabled: () => true,
  devSignInEmails: () => [EMAILS.own],
  DEV_SIGN_IN_ROLE_EMAILS: [
    EMAILS.admin,
    EMAILS.teacher,
    EMAILS.hod,
    EMAILS.deletedLearner,
    EMAILS.learner,
    EMAILS.parent,
    EMAILS.missing,
  ],
}));

import app from '../../../app.js';
import devSignInRoutes from '../dev-sign-in.routes.js';
import { errorHandler } from '../../../middleware/errorHandler.js';
import { User } from '../model.js';
import { School } from '../../School/model.js';
import { Class } from '../../Academic/model.js';
import { Student } from '../../Student/model.js';
import { Parent } from '../../Parent/model.js';

const TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test';
const oid = () => new mongoose.Types.ObjectId();

const schoolId = oid();
const classId = oid();
const ids = {
  own: oid(), admin: oid(), teacher: oid(), hod: oid(), deletedLearner: oid(),
  learner: oid(), parent: oid(), stranger: oid(),
};
const studentId = oid();
const parentId = oid();

function userDoc(key: keyof typeof ids, role: string, firstName: string, lastName: string, extra: Record<string, unknown> = {}) {
  return {
    _id: ids[key], email: EMAILS[key], role, firstName, lastName,
    isActive: true, isDeleted: false, refreshTokens: [], ...extra,
  };
}

/** Pretends every request arrives from another machine on the network. */
function remoteApp() {
  const remote = express();
  remote.use(express.json());
  remote.use((req, _res, next) => {
    Object.defineProperty(req.socket, 'remoteAddress', { value: '10.0.0.5', configurable: true });
    next();
  });
  remote.use('/api/auth/dev-sign-in', devSignInRoutes);
  remote.use(errorHandler);
  return remote;
}

describe('development sign-in when the gate is open', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(TEST_URI);
    await School.collection.insertOne({ _id: schoolId, name: 'Greenfield Test', isDeleted: false });
    await Class.collection.insertOne({
      _id: classId, schoolId, name: 'Grade 1 - A', classroomCode: `c-${oid()}`,
      gradeId: oid(), teacherId: ids.teacher, isDeleted: false,
    });
    await User.collection.insertMany([
      userDoc('own', 'super_admin', 'Own', 'Account'),
      userDoc('admin', 'school_admin', 'Lerato', 'Nkosi', { schoolId }),
      userDoc('teacher', 'teacher', 'Thandi', 'Molefe', { schoolId }),
      userDoc('hod', 'teacher', 'Ayanda', 'Zulu', { schoolId, isHOD: true }),
      userDoc('deletedLearner', 'student', 'Gone', 'Learner', { schoolId, isDeleted: true }),
      userDoc('learner', 'student', 'Anika', 'Botha', { schoolId }),
      userDoc('parent', 'parent', 'Pieter', 'Botha', { schoolId }),
      userDoc('stranger', 'school_admin', 'Not', 'Offered', { schoolId }),
    ]);
    await Student.collection.insertOne({
      _id: studentId, schoolId, userId: ids.learner, classId, gradeId: oid(),
      admissionNumber: `A-${studentId}`, isDeleted: false,
    });
    await Parent.collection.insertOne({
      _id: parentId, schoolId, userId: ids.parent, childrenIds: [studentId], isDeleted: false,
    });
  });

  afterAll(async () => {
    await User.deleteMany({ _id: { $in: Object.values(ids) } });
    await School.deleteOne({ _id: schoolId });
    await Class.deleteOne({ _id: classId });
    await Student.deleteOne({ _id: studentId });
    await Parent.deleteOne({ _id: parentId });
    await mongoose.connection.close();
  });

  it('lists only the offered accounts that exist and are not deleted, own account first', async () => {
    const res = await request(app).get('/api/auth/dev-sign-in/accounts');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([
      { id: String(ids.own), name: 'Own Account', email: EMAILS.own, role: 'super_admin', detail: 'Super admin · All schools', isOwn: true },
      { id: String(ids.admin), name: 'Lerato Nkosi', email: EMAILS.admin, role: 'school_admin', detail: 'School admin · Greenfield Test', isOwn: false },
      { id: String(ids.teacher), name: 'Thandi Molefe', email: EMAILS.teacher, role: 'teacher', detail: 'Teacher · Grade 1 - A', isOwn: false },
      { id: String(ids.hod), name: 'Ayanda Zulu', email: EMAILS.hod, role: 'teacher', detail: 'Head of department', isOwn: false },
      { id: String(ids.learner), name: 'Anika Botha', email: EMAILS.learner, role: 'student', detail: 'Learner · Grade 1 - A', isOwn: false },
      { id: String(ids.parent), name: 'Pieter Botha', email: EMAILS.parent, role: 'parent', detail: 'Parent of Anika Botha', isOwn: false },
    ]);
  });

  it('refuses to sign in as an account that is not offered', async () => {
    const stranger = await request(app).post('/api/auth/dev-sign-in').send({ userId: String(ids.stranger) });
    const deleted = await request(app).post('/api/auth/dev-sign-in').send({ userId: String(ids.deletedLearner) });
    const garbage = await request(app).post('/api/auth/dev-sign-in').send({ userId: 'not-an-id' });

    expect(stranger.status).toBe(403);
    expect(deleted.status).toBe(403);
    expect(garbage.status).toBe(403);
  });

  it('refuses a caller on another machine, even one claiming to be local', async () => {
    const list = await request(remoteApp()).get('/api/auth/dev-sign-in/accounts');
    const signIn = await request(remoteApp())
      .post('/api/auth/dev-sign-in')
      .set('X-Forwarded-For', '127.0.0.1')
      .send({ userId: String(ids.own) });

    expect(list.status).toBe(403);
    expect(signIn.status).toBe(403);
    expect(signIn.body.data).toBeUndefined();
  });

  it('answers like the password login, with an access token that works on /me', async () => {
    const res = await request(app).post('/api/auth/dev-sign-in').send({ userId: String(ids.own) });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Login successful');
    expect(Object.keys(res.body.data).sort()).toEqual(['accessToken', 'user']);
    expect(res.body.data.user.email).toBe(EMAILS.own);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.refreshTokens).toBeUndefined();
    expect(String(res.headers['set-cookie'])).toContain('refresh_token=');

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${res.body.data.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(EMAILS.own);

    const stored = await User.findById(ids.own).select('refreshTokens lastLoginAt');
    expect(stored?.refreshTokens).toHaveLength(1);
    expect(stored?.lastLoginAt).toBeInstanceOf(Date);
  });

  it('refuses a request made under another host name or from another site (DNS rebinding, CSRF)', async () => {
    const rebound = await request(app).get('/api/auth/dev-sign-in/accounts').set('Host', 'attacker.example:4500');
    const crossSite = await request(app).post('/api/auth/dev-sign-in')
      .set('Origin', 'https://attacker.example').send({ userId: String(ids.own) });
    const form = await request(app).post('/api/auth/dev-sign-in')
      .type('form').send(`userId=${String(ids.own)}`);
    expect(rebound.status).toBe(403);
    expect(crossSite.status).toBe(403);
    expect(form.status).toBe(403);
    expect(form.body.data).toBeUndefined();
  });
});

