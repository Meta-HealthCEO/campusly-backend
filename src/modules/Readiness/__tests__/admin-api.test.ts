// src/modules/Readiness/__tests__/admin-api.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { signTestToken } from '../../../test-utils/auth.js';
import { ExamBlueprint } from '../model-blueprint.js';
import { cleanUpReadiness, fixtureBlueprintFile, makeCurriculum, type ReadinessWorld } from '../../../test-utils/readiness-fixture.js';

let w: ReadinessWorld;
const admin = { Authorization: `Bearer ${signTestToken({ role: 'super_admin', isStandaloneTeacher: false })}` };
const teacher = { Authorization: `Bearer ${signTestToken({ role: 'teacher', schoolId: new mongoose.Types.ObjectId() })}` };

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await ExamBlueprint.syncIndexes();
  w = await makeCurriculum();
});
afterAll(async () => {
  await cleanUpReadiness(w);
  await mongoose.disconnect();
});

describe('/api/readiness/blueprints (super admin only)', () => {
  it('refuses a teacher', async () => {
    await request(app).get('/api/readiness/blueprints').set(teacher).expect(403);
  });

  it('validates without writing, and imports as a draft', async () => {
    const v = await request(app).post('/api/readiness/blueprints/validate').set(admin).send(fixtureBlueprintFile(w)).expect(200);
    expect(v.body.data).toMatchObject({ errors: [], parseErrors: [] });
    expect(await ExamBlueprint.countDocuments({ subjectKey: w.subjectKey })).toBe(0);
    const i = await request(app).post('/api/readiness/blueprints/import').set(admin).send(fixtureBlueprintFile(w)).expect(201);
    expect(i.body.data.blueprint).toMatchObject({ status: 'draft' });
    const bad = fixtureBlueprintFile(w);
    bad.papers[0].totalMarks = 7;
    await request(app).post('/api/readiness/blueprints/import').set(admin).send(bad).expect(400);
  });

  it('lists and shows a blueprint with its report and verified state', async () => {
    const list = await request(app).get(`/api/readiness/blueprints?family=${w.prefix}-NSC-MATHEMATICS-GR12`).set(admin).expect(200);
    expect(list.body.data).toMatchObject({ total: 1 });
    const id = list.body.data.rows[0]._id;
    const one = await request(app).get(`/api/readiness/blueprints/${id}`).set(admin).expect(200);
    expect(one.body.data).toMatchObject({ verified: false, report: { errors: [] } });
  });

  it('patches flags, sources and dates, never marks', async () => {
    const draft = await ExamBlueprint.findOne({ subjectKey: w.subjectKey, status: 'draft' });
    await request(app).patch(`/api/readiness/blueprints/${String(draft!._id)}`).set(admin).send({ topics: [{ key: 'P1.FUNC', marks: 50 }] }).expect(400);
    const ok = await request(app).patch(`/api/readiness/blueprints/${String(draft!._id)}`).set(admin).send({ topics: [{ key: 'P1.FUNC', verified: true, sourceRef: 'EG26 p.9' }] }).expect(200);
    expect(ok.body.data.papers[0].topics[0]).toMatchObject({ verified: true, sourceRef: 'EG26 p.9' });
  });

  // The queued recompute of the family (Task 9's enqueueBlueprintRecompute) is asserted when Task 9 lands (ledger ruling R4).
  it('publishes and copies to another year', async () => {
    const draft = await ExamBlueprint.findOne({ subjectKey: w.subjectKey, status: 'draft' });
    const pub = await request(app).post(`/api/readiness/blueprints/${String(draft!._id)}/publish`).set(admin).send({ acknowledgeWarnings: true }).expect(200);
    expect(pub.body.data).toMatchObject({ status: 'published', version: 1 });
    const copy = await request(app).post(`/api/readiness/blueprints/${String(draft!._id)}/copy`).set(admin).send({ examYear: 2027 }).expect(201);
    expect(copy.body.data).toMatchObject({ status: 'draft', examYear: 2027 });
  });
});
