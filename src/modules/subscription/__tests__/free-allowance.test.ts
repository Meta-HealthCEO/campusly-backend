import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { Plan, Subscription } from '../model.js';
import { seedPlans } from '../seed.js';
import { requirePaperGenerationAccess } from '../entitlements.js';
import { FREE_COURSE_UNITS, FREE_PAPER_GENERATIONS, getFreeAllowance } from '../free-allowance.js';
import { AssessmentPaper } from '../../QuestionBank/model-papers.js';

function makeApp(schoolId: mongoose.Types.ObjectId, isStandaloneTeacher = true) {
  const app = express();
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.user = {
      id: 'teacher', email: 't@test.test', role: 'teacher' as never,
      schoolId: schoolId.toString(), isStandaloneTeacher,
    };
    next();
  });
  app.post('/generate', requirePaperGenerationAccess(), (_req, res) => { res.json({ ok: true }); });
  return app;
}

async function subscribe(schoolId: mongoose.Types.ObjectId, planCode: string, status: string) {
  await Subscription.create({
    schoolId, subscriberType: 'teacher', planCode, status, retryCount: 0, gatewayProvider: 'onegate',
  });
}

/** Raw inserts: only schoolId / aiGenerated / isDeleted matter to the allowance. */
async function papers(schoolId: mongoose.Types.ObjectId, docs: Array<{ aiGenerated: boolean; isDeleted?: boolean }>) {
  await AssessmentPaper.collection.insertMany(docs.map((d) => ({ schoolId, isDeleted: false, ...d })));
}

describe('free AI paper allowance', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    await seedPlans();
  });

  beforeEach(async () => {
    await Subscription.deleteMany({});
    await AssessmentPaper.collection.deleteMany({});
  });

  afterAll(async () => {
    await Subscription.deleteMany({});
    await AssessmentPaper.collection.deleteMany({});
    await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
    await mongoose.connection.close();
  });

  it(`gives a free teacher ${FREE_PAPER_GENERATIONS} AI papers`, async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await subscribe(schoolId, 'free', 'free');

    const res = await request(makeApp(schoolId)).post('/generate');

    expect(res.status).toBe(200);
    expect(await getFreeAllowance(schoolId.toString())).toEqual({
      paperGenerations: { limit: FREE_PAPER_GENERATIONS, used: 0, remaining: FREE_PAPER_GENERATIONS },
      courseUnits: { limit: FREE_COURSE_UNITS, used: 0, remaining: FREE_COURSE_UNITS },
    });
  });

  it('only counts AI-generated papers, not ones the teacher wrote', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await subscribe(schoolId, 'free', 'free');
    await papers(schoolId, [{ aiGenerated: true }, { aiGenerated: true }, { aiGenerated: false }, { aiGenerated: false }]);

    const res = await request(makeApp(schoolId)).post('/generate');

    expect(res.status).toBe(200);
    expect((await getFreeAllowance(schoolId.toString())).paperGenerations.remaining).toBe(1);
  });

  it('asks for payment once the free papers are used — deleting one does not refund it', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await subscribe(schoolId, 'free', 'free');
    await papers(schoolId, [{ aiGenerated: true }, { aiGenerated: true }, { aiGenerated: true, isDeleted: true }]);

    const res = await request(makeApp(schoolId)).post('/generate');

    expect(res.status).toBe(402);
    expect(res.body).toMatchObject({ feature: 'paperGeneration', freeRemaining: 0 });
  });

  it('never limits Pro teachers', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await subscribe(schoolId, 'pro_monthly', 'trialing');
    await papers(schoolId, [{ aiGenerated: true }, { aiGenerated: true }, { aiGenerated: true }, { aiGenerated: true }]);

    expect((await request(makeApp(schoolId)).post('/generate')).status).toBe(200);
  });

  it('never limits school teachers (school-tier billing)', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    await papers(schoolId, [{ aiGenerated: true }, { aiGenerated: true }, { aiGenerated: true }]);

    expect((await request(makeApp(schoolId, false)).post('/generate')).status).toBe(200);
  });
});
