// src/modules/Auth/__tests__/standalone-learner.test.ts
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';

// The auth rate limiter is not under test (as in register-route.test.ts:8-10).
vi.mock('../../../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

import app from '../../../app.js';
import { School } from '../../School/model.js';
import { Subscription } from '../../subscription/model.js';
import { StandaloneCoachService } from '../standalone-coach.service.js';
import { isStandaloneLearner } from '../standalone-learner.js';
import { cleanUpClassrooms, standaloneClassroom, trackSchool } from '../../../test-utils/standalone-classroom.js';

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

const me = (token: string) => request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

describe('isStandaloneLearner', () => {
  it("is true for a learner in a standalone teacher's classroom, false for the teacher", async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    expect(await isStandaloneLearner({ role: 'student', schoolId: room.schoolId })).toBe(true);
    expect(await isStandaloneLearner({ role: 'teacher', schoolId: room.schoolId })).toBe(false);
    expect((await me(thabo.token)).body.data.user.isStandaloneLearner).toBe(true);
  });

  it("is false in a standalone coach's club (same plan, different owner)", async () => {
    const { user } = await StandaloneCoachService.signup({
      firstName: 'Coach', lastName: 'K', email: `lp-coach+${Date.now()}@test.local`, password: 'Password1',
    });
    trackSchool(user.schoolId as mongoose.Types.ObjectId);
    expect(await isStandaloneLearner({ role: 'student', schoolId: user.schoolId })).toBe(false);
  });

  it('is false in a school', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    trackSchool(schoolId);
    await School.collection.insertOne({ _id: schoolId, name: 'lp_school', plan: 'school', isActive: true, isDeleted: false });
    expect(await isStandaloneLearner({ role: 'student', schoolId })).toBe(false);
  });

  it('comes back from learner sign-up and from sign-in', async () => {
    const room = await standaloneClassroom();
    const creds = { email: `lp-signup+${Date.now()}@test.local`, password: 'Learner1-check' };
    const signup = await request(app).post('/api/auth/register-student')
      .send({ firstName: 'Ayanda', lastName: 'M', ...creds, classroomCode: room.maths.code });
    expect(signup.status).toBe(201);
    expect(signup.body.data.user.isStandaloneLearner).toBe(true);
    const login = await request(app).post('/api/auth/login').send(creds);
    expect(login.status).toBe(200);
    expect(login.body.data.user.isStandaloneLearner).toBe(true);
  });
});

describe('card data only for whoever pays (ruling R4)', () => {
  it('never sends the card token or gateway reference, and sends the card only to the teacher', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    await Subscription.updateOne({ schoolId: room.schoolId }, {
      $set: { cardTokenGuid: 'tok_secret', gatewayCustomerRef: 'cus_secret', cardLastFour: '4242', cardBrand: 'visa', lastFailureReason: 'Insufficient funds' },
    });

    const learnerView = (await me(thabo.token)).body.data.subscription as Record<string, unknown>;
    expect(learnerView.status).toBeDefined();
    for (const key of ['cardTokenGuid', 'gatewayCustomerRef', 'cardLastFour', 'cardBrand', 'lastFailureReason']) {
      expect(learnerView).not.toHaveProperty(key);
    }
    const learnerMine = await request(app).get('/api/subscriptions/me').set('Authorization', `Bearer ${thabo.token}`);
    expect(learnerMine.body.data.subscription).not.toHaveProperty('cardLastFour');

    const teacherView = (await me(room.teacherToken)).body.data.subscription as Record<string, unknown>;
    expect(teacherView.cardLastFour).toBe('4242');
    expect(teacherView).not.toHaveProperty('cardTokenGuid');
    expect(teacherView).not.toHaveProperty('gatewayCustomerRef');
  });
});
