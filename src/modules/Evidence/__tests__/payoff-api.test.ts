// src/modules/Evidence/__tests__/payoff-api.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { signTestToken } from '../../../test-utils/auth.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom, type Learner } from '../../../test-utils/standalone-classroom.js';
import { cleanUpEvidenceFixtures, seedMarkedPaper, seedMarking, type MarkedPaperFixture } from '../../../test-utils/evidence-fixtures.js';
import { AnswerEvidence } from '../model.js';
import { MisconceptionType } from '../model-taxonomy.js';
import { PaperMarking } from '../../AITools/model-marking.js';
import { genericTypeId, resetGenericTypeCache } from '../taxonomy-generic.js';
import { syncMarkingEvidence } from '../writers/test.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
let room: Classroom;
let learners: Learner[];
let fx: MarkedPaperFixture;
const markings: Oid[] = [];
let typeA: Oid;
let typeB: Oid;

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
const reasons = (token: string, recordId: Oid) =>
  request(app).get(`/api/evidence/reasons?source=test&recordId=${String(recordId)}`).set(auth(token));
const rowOf = (markingId: Oid, n: string) => ({ 'source.recordId': markingId, 'source.itemKey': n });
const row = (markingId: Oid, n: string) => AnswerEvidence.findOne(rowOf(markingId, n));
const diagnose = (markingId: Oid, n: string, typeId: Oid, extra: Record<string, unknown> = {}) =>
  AnswerEvidence.updateOne(rowOf(markingId, n), { $set: { 'diagnosis.state': 'ready', 'diagnosis.typeId': typeId, 'diagnosis.explanation': 'Swap x and y, then solve for y.', 'diagnosis.confidence': 0.9, ...extra } });
/** Checkpoint fix 4: the writer reads a marking inside its school. */
const sync = (id: Oid) => syncMarkingEvidence(id, room.schoolId);

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  room = await standaloneClassroom();
  learners = [await room.learner('Ayanda', room.maths.id), await room.learner('Bongi', room.maths.id), await room.learner('Carla', room.maths.id)];
  fx = await seedMarkedPaper({ schoolId: room.schoolId, teacherId: room.teacherId, classId: room.maths.id, students: learners.map((l) => l.studentId) });
  const answers = [
    { n: '1.1', answer: 'y = 3x', awarded: 1, max: 2 },
    { n: '1.2', answer: 'Yes', awarded: 0, max: 3 },
    { n: '2.1', answer: '', awarded: 0, max: 3 },
  ];
  for (const l of learners) {
    const id = await seedMarking(fx, l.studentId, answers);
    markings.push(id);
    await sync(id);
  }
  typeA = (await MisconceptionType.create({ code: `E-API-${String(oid())}.swap-only`, kind: 'procedural', topicNodeId: fx.topicId, label: 'Swapped but did not solve', learnerLabel: 'Stopped after swapping', description: 'd', status: 'seeded', origin: 'ai_seed' }))._id as Oid;
  typeB = (await MisconceptionType.create({ code: `E-API-${String(oid())}.one-to-one`, kind: 'misconception', topicNodeId: fx.topicId, label: 'Thinks every inverse is a function', learnerLabel: 'Inverse is not always a function', description: 'd', status: 'seeded', origin: 'ai_seed' }))._id as Oid;
  await diagnose(markings[0], '1.1', typeA);
  await diagnose(markings[1], '1.1', typeA);
  await diagnose(markings[2], '1.1', typeB);
  await diagnose(markings[0], '1.2', await genericTypeId('careless-arithmetic'), { 'diagnosis.confidence': 0.4 });
  await diagnose(markings[1], '1.2', await genericTypeId('possible-marking-error'));
  await AnswerEvidence.updateOne(rowOf(markings[2], '1.2'), { $set: { 'diagnosis.state': 'skipped_budget' } });
});
beforeEach(() => resetGenericTypeCache());
afterAll(async () => {
  await MisconceptionType.deleteMany({ code: /^E-API-/ });
  await cleanUpEvidenceFixtures(room.schoolId);
  await cleanUpClassrooms();
  await mongoose.disconnect();
});

describe('GET /api/evidence/reasons', () => {
  it('the teacher sees every row of a script before issue, with teacher labels and states', async () => {
    const res = await reasons(room.teacherToken, markings[2]).expect(200);
    const byKey = new Map((res.body.data.items as Array<{ itemKey: string; state: string; reason: { label: string } | null }>).map((i) => [i.itemKey, i]));
    expect(byKey.get('1.1')).toMatchObject({ state: 'ready', reason: { label: 'Thinks every inverse is a function' } });
    expect(byKey.get('1.2')).toMatchObject({ state: 'limit', reason: null });
    expect(byKey.get('2.1')).toMatchObject({ state: 'ready', reason: { label: 'Not answered' } });
  });

  it('a learner sees nothing before issue, then only safe reasons of their own final rows', async () => {
    await reasons(learners[0].token, markings[0]).expect(404);
    await PaperMarking.updateOne({ _id: markings[0] }, { $set: { issuedToStudent: true, issuedAt: new Date(), status: 'published' } });
    await sync(markings[0]);
    const res = await reasons(learners[0].token, markings[0]).expect(200);
    const items = res.body.data.items as Array<{ itemKey: string; state: string; reason: Record<string, unknown> | null }>;
    expect(items.find((i) => i.itemKey === '1.1')).toMatchObject({ state: 'ready', reason: { label: 'Stopped after swapping', checkMark: false, lowConfidence: false } });
    expect(items.find((i) => i.itemKey === '1.2')).toMatchObject({ state: 'none', reason: null }); // low confidence
    expect(JSON.stringify(res.body)).not.toMatch(/markerNote|"confidence"|Swapped but did not solve/);
    await reasons(learners[1].token, markings[0]).expect(404);
  });

  it('a teacher of another school gets 404', async () => {
    const stranger = signTestToken({ id: oid(), role: 'teacher', schoolId: oid(), isStandaloneTeacher: true, isSchoolPrincipal: false });
    await reasons(stranger, markings[0]).expect(404);
  });
});

describe('dismiss and restore', () => {
  it('hides a reason from the learner and brings it back; a learner cannot do either', async () => {
    const r = await row(markings[0], '1.1').lean();
    await request(app).post(`/api/evidence/rows/${String(r!._id)}/dismiss`).set(auth(learners[0].token)).expect(403);
    await request(app).post(`/api/evidence/rows/${String(r!._id)}/dismiss`).set(auth(room.teacherToken)).expect(204);
    const learnerView = await reasons(learners[0].token, markings[0]).expect(200);
    expect((learnerView.body.data.items as Array<{ itemKey: string; state: string }>).find((i) => i.itemKey === '1.1')?.state).toBe('none');
    await request(app).post(`/api/evidence/rows/${String(r!._id)}/restore`).set(auth(room.teacherToken)).expect(204);
    expect((await row(markings[0], '1.1').lean())!.diagnosis.state).toBe('ready');
  });
});

describe('GET /api/evidence/class-misconceptions', () => {
  const url = () => `/api/evidence/class-misconceptions?parent=paper&parentId=${String(fx.paperId)}&classId=${String(room.maths.id)}`;

  it('ranks types shared by two or more learners, lists the general ones, counts marks to check', async () => {
    const res = await request(app).get(url()).set(auth(room.teacherToken)).expect(200);
    const data = res.body.data;
    expect(data.markedLearners).toBe(3);
    expect(data.top).toHaveLength(1);
    expect(data.top[0]).toMatchObject({ label: 'Swapped but did not solve', learners: 2, lostMarks: 2, questions: ['1.1'] });
    expect(data.top[0].students.map((s: { name: string }) => s.name).sort()).toEqual(['Ayanda Learner', 'Bongi Learner']);
    expect(data.generic.map((g: { label: string; learners: number }) => [g.label, g.learners])).toEqual([['Not answered', 3], ['Arithmetic slip', 1]]);
    expect(data.marksToCheck).toBe(1);
  });

  it('a dismissed reason does not count', async () => {
    const r = await row(markings[1], '1.1').lean();
    await request(app).post(`/api/evidence/rows/${String(r!._id)}/dismiss`).set(auth(room.teacherToken)).expect(204);
    const res = await request(app).get(url()).set(auth(room.teacherToken)).expect(200);
    expect(res.body.data.top).toEqual([]);
  });

  it('another school cannot read it', async () => {
    const stranger = signTestToken({ id: oid(), role: 'teacher', schoolId: oid(), isStandaloneTeacher: true, isSchoolPrincipal: false });
    await request(app).get(url()).set(auth(stranger)).expect(404);
  });
});
