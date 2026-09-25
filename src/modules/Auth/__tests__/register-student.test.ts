// src/modules/Auth/__tests__/register-student.test.ts
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';

vi.mock('../../../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));
vi.mock('../../../jobs/course-generation.job.js', () => ({ enqueueCourseGeneration: vi.fn(async () => undefined) }));

import app from '../../../app.js';
import { User } from '../model.js';
import { Enrolment } from '../../Course/model.js';
import { ClassUnitService } from '../../Course/service-class-unit.js';
import { Student } from '../../Student/model.js';
import { cleanUpClassrooms, standaloneClassroom } from '../../../test-utils/standalone-classroom.js';
import { writtenUnit } from '../../../test-utils/class-unit.js';

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

const signUp = (body: Record<string, unknown>) => request(app).post('/api/auth/register-student').send({ password: 'Learner1-check', ...body });

describe('POST /api/auth/register-student', () => {
  it('tells someone who already has an account to sign in and join from Profile', async () => {
    const room = await standaloneClassroom();
    const email = `lp-dup+${Date.now()}@test.local`;
    expect((await signUp({ firstName: 'A', lastName: 'B', email, classroomCode: room.maths.code })).status).toBe(201);
    const again = await signUp({ firstName: 'A', lastName: 'B', email, classroomCode: room.science.code });
    expect(again.status).toBe(409);
    expect(again.body.error).toBe('You already have an account. Sign in, then join with the code on your Profile.');
  });

  it('gives a new learner the lessons already released to the group', async () => {
    const room = await standaloneClassroom();
    await room.learner('Lebo', room.maths.id);
    const unit = await writtenUnit(room);
    await ClassUnitService.release(unit.courseId, String(room.schoolId), unit.actor, [String(room.maths.id)]);
    const res = await signUp({ firstName: 'Ayanda', lastName: 'M', email: `lp-new+${Date.now()}@test.local`, classroomCode: room.maths.code });
    const student = await Student.findOne({ userId: res.body.data.user._id }).lean();
    expect(await Enrolment.countDocuments({ courseId: unit.courseId, studentId: student?._id, isDeleted: false })).toBe(1);
  });

  it('lets a learner the teacher added claim their account without a second password change (ruling R14)', async () => {
    const room = await standaloneClassroom();
    const added = await request(app).post('/api/students').set('Authorization', `Bearer ${room.teacherToken}`)
      .send({ classId: String(room.maths.id), gradeId: String(new mongoose.Types.ObjectId()), firstName: 'Neo', lastName: 'Khumalo', deliveryMethod: 'slip' });
    expect(added.status).toBe(201);
    const email = `lp-claim+${Date.now()}@test.local`;
    const res = await signUp({ firstName: 'Neo', lastName: 'Khumalo', email, classroomCode: room.maths.code });
    expect(res.status).toBe(201);
    const user = await User.findOne({ email }).lean();
    expect(user?.mustChangePassword).toBe(false);
    expect(String(user?._id)).toBe(String(added.body.data.student.userId));
  });
});
