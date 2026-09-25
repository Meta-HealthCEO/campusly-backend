import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import { StandaloneService } from '../../modules/Auth/standalone.service.js';
import { User } from '../../modules/Auth/model.js';
import { School } from '../../modules/School/model.js';
import { Subscription } from '../../modules/subscription/model.js';
import { AIUsage } from '../../modules/subscription/ai-usage.model.js';
import { signTestToken } from '../../test-utils/auth.js';

const schools: mongoose.Types.ObjectId[] = [];
const id = () => String(new mongoose.Types.ObjectId());

async function standaloneTeacher() {
  const email = `refuse+${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
  const { user, tokens } = await StandaloneService.signup({ firstName: 'Ayanda', lastName: 'Teacher', email, password: 'Password1' });
  await User.updateOne({ _id: user._id }, { $set: { emailVerifiedAt: new Date() } });
  const schoolId = user.schoolId as mongoose.Types.ObjectId;
  schools.push(schoolId);
  return { schoolId, userId: user._id as mongoose.Types.ObjectId, token: tokens.accessToken };
}

async function schoolTeacherToken() {
  const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  const school = await School.create({
    name: `refuse_test_${stamp}`,
    type: 'combined',
    address: { street: 'x', city: 'x', province: 'x', postalCode: '0000', country: 'ZA' },
    contactInfo: { email: `refuse-test+${stamp}@test.local`, phone: '0' },
    settings: { academicYear: 2026, terms: 4, gradingSystem: 'percentage' },
    principal: 'T',
    joinCode: `F${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    isActive: true,
    modulesEnabled: ['academic', 'ai_tools'],
  });
  const schoolId = school._id as mongoose.Types.ObjectId;
  schools.push(schoolId);
  return signTestToken({ id: id(), schoolId, role: 'teacher', isStandaloneTeacher: false, isSchoolPrincipal: false });
}

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
});

afterAll(async () => {
  await AIUsage.collection.deleteMany({ schoolId: { $in: schools } });
  await Subscription.deleteMany({ schoolId: { $in: schools } });
  await User.deleteMany({ email: /^refuse\+.*@test\.local$/ });
  await School.deleteMany({ _id: { $in: schools } });
  await mongoose.connection.close();
});

const hiddenRoutes = [
  { name: 'lesson-plan chat', path: () => `/api/lessons/${id()}/chat`, body: { message: 'Make it shorter' } },
  { name: 'lesson-plan AI outline', path: () => '/api/lessons/scaffold', body: {} },
  { name: 'lesson-plan AI materials', path: () => `/api/lessons/${id()}/materials/generate-all`, body: {} },
  { name: 'lesson-plan material regenerate', path: () => `/api/lessons/${id()}/materials/${id()}/regenerate`, body: {} },
  { name: 'lesson-plan add material', path: () => `/api/lessons/${id()}/materials`, body: {} },
  { name: 'Library generate', path: () => '/api/content-library/resources/generate', body: {} },
  { name: 'Library paper import', path: () => '/api/paper-imports', body: {} },
  { name: 'rubric AI grading', path: () => '/api/ai-tools/grade', body: {} },
  { name: 'bulk rubric AI grading', path: () => '/api/ai-tools/grade/bulk', body: {} },
  { name: 'rubric AI grading retry', path: () => `/api/ai-tools/grade/${id()}/retry`, body: {} },
  { name: 'school news AI article', path: () => '/api/school-news/generate', body: {} },
  // A school teacher without the timetable capability is refused by that guard instead — never by this one.
  { name: 'timetable line suggestions', path: () => '/api/timetable-builder/lines/suggest', body: {}, schoolMay403: true },
  { name: 'lesson recording notes retry', path: () => `/api/classroom/sessions/${id()}/notes/retry`, body: {} },
  { name: 'question bank extract from paper', path: () => '/api/question-bank/questions/extract-from-paper', body: {} },
];

describe('AI routes behind pages hidden from standalone teachers', () => {
  describe.each(hiddenRoutes)('$name', (route) => {
    it('refuses a standalone teacher with 403', async () => {
      const t = await standaloneTeacher();
      const res = await request(app).post(route.path()).set('Authorization', `Bearer ${t.token}`).send(route.body);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('NOT_IN_TEACHER_PORTAL');
    });

    it('still lets a school teacher through', async () => {
      const token = await schoolTeacherToken();
      const res = await request(app).post(route.path()).set('Authorization', `Bearer ${token}`).send(route.body);
      expect(res.body.code).not.toBe('NOT_IN_TEACHER_PORTAL');
      if (!('schoolMay403' in route)) expect(res.status).not.toBe(403);
    });
  });
});

describe('GET /api/subscriptions/ai-usage', () => {
  it("tells a standalone teacher how much of this month's allowance is used", async () => {
    const t = await standaloneTeacher();
    await AIUsage.insertMany([{ schoolId: t.schoolId, userId: t.userId, action: 'paper' }, { schoolId: t.schoolId, userId: t.userId, action: 'memo' }]);

    const res = await request(app).get('/api/subscriptions/ai-usage').set('Authorization', `Bearer ${t.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ used: 2, limit: 20, plan: 'free' });
    expect(new Date(res.body.data.resetsAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('tells a school teacher their school covers AI', async () => {
    const token = await schoolTeacherToken();
    const res = await request(app).get('/api/subscriptions/ai-usage').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ plan: 'school' });
  });
});
