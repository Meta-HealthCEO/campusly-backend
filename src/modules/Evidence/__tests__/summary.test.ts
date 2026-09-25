// src/modules/Evidence/__tests__/summary.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { signTestToken } from '../../../test-utils/auth.js';
import { Class } from '../../Academic/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { AnswerEvidence } from '../model.js';
import { MisconceptionType } from '../model-taxonomy.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom, type Learner } from '../../../test-utils/standalone-classroom.js';
import { sastWeekStart } from '../summary-buckets.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
let room: Classroom;
let thabo: Learner;
let otherTeacher: Oid;
const subjectId = oid();
const topic = oid();
const sub = oid();
let typeId: Oid;
const DAY = 24 * 3600_000;
const earlier = new Date(Date.now() - 3 * DAY);
const later = new Date(Date.now() - 1 * DAY);

async function row(over: Record<string, unknown>): Promise<void> {
  await AnswerEvidence.create({
    schoolId: room.schoolId, studentId: thabo.studentId, subjectId, classId: room.maths.id, topicNodeId: topic, subtopicNodeId: null,
    topicFrom: 'question', cognitiveLevel: 'routine', marksAwarded: 1, marksAvailable: 2, markedBy: 'ai', status: 'final',
    markedAt: earlier, questionKey: 'q:x', answer: { kind: 'typed', text: 'x', truncated: false, hash: 'h' },
    source: { type: 'test', recordId: oid(), parentId: oid(), itemKey: '1' }, diagnosis: { state: 'none', cacheKey: 'k' }, ...over,
  });
}

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  room = await standaloneClassroom();
  otherTeacher = oid();
  const shared = oid();
  await Class.collection.insertOne({ _id: shared, schoolId: room.schoolId, name: 'Extension', gradeId: oid(), teacherId: otherTeacher, isDeleted: false });
  thabo = await room.learner('Thabo', room.maths.id, [shared]);
  await CurriculumNode.collection.insertMany([
    { _id: topic, frameworkId: oid(), type: 'topic', parentId: null, title: 'Functions', code: `E-SUM-${String(topic)}`, metadata: {}, order: 0, schoolId: null, isDeleted: false },
    { _id: sub, frameworkId: oid(), type: 'subtopic', parentId: topic, title: 'Inverses', code: `E-SUM-${String(sub)}`, metadata: {}, order: 0, schoolId: null, isDeleted: false },
  ]);
  typeId = (await MisconceptionType.create({ code: `E-SUM-${String(topic)}.swap`, kind: 'procedural', topicNodeId: topic, label: 'Swapped only', learnerLabel: 'Stopped after swapping', description: 'd', status: 'seeded', origin: 'ai_seed' }))._id as Oid;
  await row({ subtopicNodeId: sub, diagnosis: { state: 'ready', cacheKey: 'k1', typeId } });
  await row({ cognitiveLevel: null, marksAwarded: 2, source: { type: 'homework', recordId: oid(), parentId: oid(), itemKey: 'a' }, markedAt: later });
  await row({ topicFrom: 'ai_tag', marksAwarded: 0, diagnosis: { state: 'dismissed', cacheKey: 'k2', typeId } });
  await row({ topicNodeId: null, topicFrom: 'none', marksAwarded: 1, marksAvailable: 3 });
  await row({ status: 'provisional', marksAwarded: 0, marksAvailable: 10 });
  await row({ isDeleted: true, marksAwarded: 0, marksAvailable: 10 });
});
afterAll(async () => {
  await Promise.all([CurriculumNode.deleteMany({ code: /^E-SUM-/ }), MisconceptionType.deleteMany({ code: /^E-SUM-/ })]);
  await cleanUpClassrooms();
  await mongoose.disconnect();
});

describe('sastWeekStart', () => {
  it('uses the SAST Monday: 22:30 UTC on a Sunday is already Monday', () => {
    expect(sastWeekStart(new Date('2026-09-27T22:30:00Z'))).toBe('2026-09-28');
    expect(sastWeekStart(new Date('2026-09-27T21:59:00Z'))).toBe('2026-09-21');
  });
});

describe('GET /api/evidence/learners/:id/topics', () => {
  const url = () => `/api/evidence/learners/${String(thabo.studentId)}/topics?subjectId=${String(subjectId)}`;

  it('sums only final, live rows: by level, by source, by week, by subtopic, with misconceptions and the untagged rest', async () => {
    const res = await request(app).get(url()).set('Authorization', `Bearer ${room.teacherToken}`).expect(200);
    const data = res.body.data;
    expect(data.untagged).toEqual({ awarded: 1, available: 3, answers: 1 });
    expect(data.topics).toHaveLength(1);
    const t = data.topics[0];
    expect(t).toMatchObject({ topicTitle: 'Functions', marksAwarded: 3, marksAvailable: 6, answers: 3 });
    expect(t.byLevel.routine).toEqual({ awarded: 1, available: 4, answers: 2 });
    expect(t.byLevel.unknown).toEqual({ awarded: 2, available: 2, answers: 1 });
    expect(t.bySource.homework).toEqual({ awarded: 2, available: 2, answers: 1 });
    expect(t.weekly.map((w: { weekStart: string }) => w.weekStart)).toEqual([...new Set([sastWeekStart(earlier), sastWeekStart(later)])]);
    expect(t.subtopics).toEqual([expect.objectContaining({ title: 'Inverses', answers: 1 })]);
    expect(t.misconceptions).toEqual([expect.objectContaining({ label: 'Swapped only', count: 1 })]);
    expect(t.aiTaggedShare).toBeCloseTo(1 / 3);
  });

  it("a teacher of the learner's second group may read; a teacher of neither may not", async () => {
    const second = signTestToken({ id: otherTeacher, role: 'teacher', schoolId: room.schoolId, isStandaloneTeacher: false, isSchoolPrincipal: false });
    await request(app).get(url()).set('Authorization', `Bearer ${second}`).expect(200);
    const none = signTestToken({ id: oid(), role: 'teacher', schoolId: room.schoolId, isStandaloneTeacher: false, isSchoolPrincipal: false });
    await request(app).get(url()).set('Authorization', `Bearer ${none}`).expect(404);
  });

  it('the learner reads their own, with learner labels', async () => {
    const res = await request(app).get(`/api/evidence/me/topics?subjectId=${String(subjectId)}`).set('Authorization', `Bearer ${thabo.token}`).expect(200);
    expect(res.body.data.topics[0].misconceptions[0].label).toBe('Stopped after swapping');
    await request(app).get(`/api/evidence/learners/${String(thabo.studentId)}/topics?subjectId=${String(subjectId)}`).set('Authorization', `Bearer ${thabo.token}`).expect(403);
  });

  it('the class view counts learners', async () => {
    const res = await request(app).get(`/api/evidence/classes/${String(room.maths.id)}/topics?subjectId=${String(subjectId)}`).set('Authorization', `Bearer ${room.teacherToken}`).expect(200);
    expect(res.body.data.topics[0]).toMatchObject({ learners: 1, answers: 3 });
  });

  it('drill-down rows page with a cursor', async () => {
    const res = await request(app).get(`/api/evidence/learners/${String(thabo.studentId)}/rows?subjectId=${String(subjectId)}&limit=2`).set('Authorization', `Bearer ${room.teacherToken}`).expect(200);
    expect(res.body.data.rows).toHaveLength(2);
    const next = await request(app).get(`/api/evidence/learners/${String(thabo.studentId)}/rows?subjectId=${String(subjectId)}&limit=2&cursor=${res.body.data.nextCursor}`).set('Authorization', `Bearer ${room.teacherToken}`).expect(200);
    expect(next.body.data.rows).toHaveLength(2);
    expect(next.body.data.nextCursor).toBeNull();
  });
});
