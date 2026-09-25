import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { StandaloneService } from '../../Auth/standalone.service.js';
import { User } from '../../Auth/model.js';
import { School } from '../../School/model.js';
import { Plan, Subscription } from '../model.js';
import { seedPlans } from '../seed.js';
import { AssessmentPaper } from '../../QuestionBank/model-papers.js';
import { FREE_COURSE_UNITS, FREE_PAPER_GENERATIONS } from '../free-allowance.js';

const createdSchools: mongoose.Types.ObjectId[] = [];

async function freeTeacher() {
  const email = `allowance+${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
  const { user, tokens } = await StandaloneService.signup({
    firstName: 'Free', lastName: 'Teacher', email, password: 'Password1',
  });
  const schoolId = user.schoolId as mongoose.Types.ObjectId;
  createdSchools.push(schoolId);
  return { schoolId, token: tokens.accessToken };
}

describe('free AI paper allowance — routes', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    await seedPlans();
  });

  afterAll(async () => {
    await AssessmentPaper.collection.deleteMany({ schoolId: { $in: createdSchools } });
    await Subscription.deleteMany({ schoolId: { $in: createdSchools } });
    await User.deleteMany({ email: /^allowance\+.*@test\.local$/ });
    await School.deleteMany({ _id: { $in: createdSchools } });
    await Plan.deleteMany({ code: { $in: ['free', 'pro_monthly', 'pro_annual'] } });
    await mongoose.connection.close();
  });

  it('GET /auth/me tells a new independent teacher how many free AI papers they have', async () => {
    const { token } = await freeTeacher();

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.freeAllowance).toEqual({
      paperGenerations: { limit: FREE_PAPER_GENERATIONS, used: 0, remaining: FREE_PAPER_GENERATIONS },
      courseUnits: { limit: FREE_COURSE_UNITS, used: 0, remaining: FREE_COURSE_UNITS },
    });
  });

  it('lets a free teacher through the paper-generation gate (reaches validation, not the paywall)', async () => {
    const { token } = await freeTeacher();

    const res = await request(app)
      .post('/api/question-bank/papers/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('asks for payment once the free papers are used up', async () => {
    const { schoolId, token } = await freeTeacher();
    await AssessmentPaper.collection.insertMany(
      Array.from({ length: FREE_PAPER_GENERATIONS }, () => ({ schoolId, aiGenerated: true, isDeleted: false })),
    );

    const res = await request(app)
      .post('/api/question-bank/papers/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(402);
  });
});
