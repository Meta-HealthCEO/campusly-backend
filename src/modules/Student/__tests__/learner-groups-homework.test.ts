// src/modules/Student/__tests__/learner-groups-homework.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { Homework } from '../../Homework/model.js';
import { HomeworkService } from '../../Homework/service.js';
import { submitHomework } from '../../Homework/service-homework-submit.js';
import { getStudentDashboardCounts } from '../../Homework/service-homework-dashboards.js';
import { AssessmentPaper } from '../../QuestionBank/model-papers.js';
import { Student } from '../model.js';
import { buildStudentDashboard } from '../service-dashboard.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom } from '../../../test-utils/standalone-classroom.js';

type Oid = mongoose.Types.ObjectId;
const oid = () => new mongoose.Types.ObjectId();
const inDays = (d: number) => new Date(Date.now() + d * 86_400_000);

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

async function reading(room: Classroom, classId: Oid, title: string): Promise<Oid> {
  const _id = oid();
  await Homework.collection.insertOne({
    _id, schoolId: room.schoolId, classId, subjectId: oid(), teacherId: room.teacherId, title, type: 'reading',
    status: 'assigned', dueDate: inDays(3), totalMarks: 0, latePolicy: 'accept', comprehensionQuestionIds: [],
    exerciseQuestionIds: [], gradebookAutoPublish: false, version: 1, isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
  });
  return _id;
}

async function setTest(room: Classroom, classId: Oid, title: string, mode: 'digital' | 'paper', dueInDays: number): Promise<void> {
  await AssessmentPaper.collection.insertOne({
    _id: oid(), schoolId: room.schoolId, title, status: 'finalised', isDeleted: false, subjectId: oid(),
    year: new Date().getFullYear(), totalMarks: 10, createdBy: room.teacherId,
    assignments: [{ _id: oid(), classId, mode, releaseAt: null, dueAt: inDays(dueInDays), assignedBy: room.teacherId, assignedAt: new Date() }],
  });
}

describe('a learner in two groups sees the second group\'s homework', () => {
  it('lists, opens, submits and counts it; a learner in one group does not see it', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id, [room.science.id]);
    const lebo = await room.learner('Lebo', room.maths.id);
    const hw = await reading(room, room.science.id, 'Read: Newton\'s laws');

    const list = await request(app).get('/api/homework').set('Authorization', `Bearer ${thabo.token}`);
    expect(list.status).toBe(200);
    expect((list.body.data.data as Array<{ title: string }>).map((h) => h.title)).toContain('Read: Newton\'s laws');

    const detail = await HomeworkService.getStudentById(String(hw), String(thabo.studentId), String(room.schoolId));
    expect(detail.title).toBe('Read: Newton\'s laws');
    await expect(HomeworkService.getStudentById(String(hw), String(lebo.studentId), String(room.schoolId))).rejects.toThrow('not found');

    const sub = await submitHomework(String(hw), String(thabo.studentId), String(room.schoolId), {
      type: 'reading', markedReadAt: new Date().toISOString(), comprehensionAnswers: [],
    });
    expect(sub.gradingStatus).toBe('graded');

    await reading(room, room.science.id, 'Read: momentum');
    expect((await getStudentDashboardCounts(String(thabo.studentId), String(room.schoolId))).dueThisWeek).toBe(1);
  });
});

describe('Today for a learner in two groups', () => {
  it("offers the second group's homework and test", async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id, [room.science.id]);
    await reading(room, room.science.id, 'Read: waves');
    await setTest(room, room.science.id, 'Waves test', 'digital', 5);

    const dashboard = await buildStudentDashboard((await Student.findById(thabo.studentId))!);
    expect(dashboard.nextHomework?.title).toBe('Read: waves');
    expect(dashboard.nextTest?.title).toBe('Waves test');
  });

  it('never offers a paper-mode test (Review Focus 5)', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id, [room.science.id]);
    await setTest(room, room.science.id, 'Written in class', 'paper', 1);
    await setTest(room, room.science.id, 'Online quiz', 'digital', 4);

    const dashboard = await buildStudentDashboard((await Student.findById(thabo.studentId))!);
    expect(dashboard.nextTest?.title).toBe('Online quiz');
  });
});
