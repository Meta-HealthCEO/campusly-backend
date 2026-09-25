// src/modules/subscription/__tests__/learner-ai.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { AIUsage } from '../ai-usage.model.js';
import { Subscription } from '../model.js';
import {
  LEARNER_TUTOR_CAP, LEARNER_TUTOR_POOL_FREE, LEARNER_TUTOR_POOL_PRO,
  assertLearnerAIAllowance, learnerTutorUsage, type LearnerAIActor,
} from '../learner-ai.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom, type Learner } from '../../../test-utils/standalone-classroom.js';

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

const actorOf = (room: Classroom, l: Learner): LearnerAIActor => ({ schoolId: String(room.schoolId), userId: String(l.userId), isStandaloneLearner: true });
const spend = (room: Classroom, userId: mongoose.Types.ObjectId, n: number, createdAt = new Date()) =>
  AIUsage.collection.insertMany(Array.from({ length: n }, () => ({ schoolId: room.schoolId, userId, action: 'tutor_message', scope: 'learner', meta: {}, createdAt, updatedAt: createdAt })));

describe('the learner tutor limits', () => {
  it('uses the numbers from the spec', () => {
    expect([LEARNER_TUTOR_CAP, LEARNER_TUTOR_POOL_FREE, LEARNER_TUTOR_POOL_PRO]).toEqual([60, 100, 600]);
  });

  it('refuses a learner at their 60, with the numbers', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    await spend(room, thabo.userId, 60);
    await expect(assertLearnerAIAllowance(actorOf(room, thabo))).rejects.toMatchObject({
      statusCode: 402, code: 'LEARNER_AI_LIMIT', details: { used: 60, limit: 60, scope: 'learner' },
    });
  });

  it("refuses everyone once a free class's 100 are used, and gives a Pro or trial class 600", async () => {
    const room = await standaloneClassroom();
    const [lebo, thabo] = [await room.learner('Lebo', room.maths.id), await room.learner('Thabo', room.maths.id)];
    await spend(room, lebo.userId, 50);
    await spend(room, new mongoose.Types.ObjectId(), 50);
    await expect(assertLearnerAIAllowance(actorOf(room, thabo))).rejects.toMatchObject({ details: { used: 100, limit: 100, scope: 'class' } });
    await Subscription.updateOne({ schoolId: room.schoolId }, { $set: { status: 'trialing', trialEndsAt: new Date(Date.now() + 86_400_000) } });
    await expect(assertLearnerAIAllowance(actorOf(room, thabo))).resolves.toBeUndefined();
    expect((await learnerTutorUsage(String(room.schoolId), String(thabo.userId))).pool).toEqual({ used: 100, limit: 600 });
  });

  it('counts 23:30 UTC on the 30th in October (Review Focus 3)', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    await spend(room, thabo.userId, 60, new Date('2026-09-30T21:30:00Z')); // 23:30 SAST, still September
    await spend(room, thabo.userId, 1, new Date('2026-09-30T23:30:00Z')); // 01:30 SAST on 1 October
    const october = await learnerTutorUsage(String(room.schoolId), String(thabo.userId), new Date('2026-10-15T10:00:00Z'));
    expect(october.used).toBe(1);
    expect(october.resetsAt.toISOString()).toBe('2026-10-31T22:00:00.000Z');
  });

  it('never limits a school learner', async () => {
    await expect(assertLearnerAIAllowance({ schoolId: String(new mongoose.Types.ObjectId()), userId: String(new mongoose.Types.ObjectId()), isStandaloneLearner: false })).resolves.toBeUndefined();
  });
});

describe('where the numbers are read', () => {
  it('the learner reads theirs; the teacher reads the class pool beside their own allowance', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    await spend(room, thabo.userId, 12);
    const mine = await request(app).get('/api/ai-tutor/usage').set('Authorization', `Bearer ${thabo.token}`);
    expect(mine.status).toBe(200);
    expect(mine.body.data).toMatchObject({ used: 12, limit: 60, pool: { used: 12, limit: 100 }, plan: 'free' });
    const teacher = await request(app).get('/api/subscriptions/ai-usage').set('Authorization', `Bearer ${room.teacherToken}`);
    expect(teacher.body.data).toMatchObject({ used: 0, limit: 20, learners: { used: 12, limit: 100 } });
  });
});
