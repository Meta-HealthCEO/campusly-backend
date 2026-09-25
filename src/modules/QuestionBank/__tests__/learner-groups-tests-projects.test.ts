// src/modules/QuestionBank/__tests__/learner-groups-tests-projects.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { AssessmentPaper } from '../model-papers.js';
import { PaperSubmission } from '../model-submissions.js';
import { listAssignedPapersForStudent, resolveStudentContext, startSubmission } from '../service-submissions-student.js';
import { Assignment, AssignmentSubmission } from '../../Assignment/model.js';
import { listAssignmentsForStudent, submitAssignment } from '../../Assignment/service.js';
import { cleanUpClassrooms, standaloneClassroom } from '../../../test-utils/standalone-classroom.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

describe('tests in a second group', () => {
  it('lists and starts the test, and the submission records the group the test was set for (ruling R12)', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id, [room.science.id]);
    const paperId = oid();
    await AssessmentPaper.collection.insertOne({
      _id: paperId, schoolId: room.schoolId, title: 'Forces quiz', status: 'finalised', isDeleted: false, version: 1,
      subjectId: oid(), gradeId: oid(), year: new Date().getFullYear(), totalMarks: 10, duration: 20, sections: [], createdBy: room.teacherId,
      assignments: [{ _id: oid(), classId: room.science.id, mode: 'digital', releaseAt: null, dueAt: null, assignedBy: room.teacherId, assignedAt: new Date() }],
    });

    const ctx = await resolveStudentContext(String(thabo.userId), String(room.schoolId));
    expect(ctx.classIds.map(String)).toEqual([String(room.maths.id), String(room.science.id)]);
    expect((await listAssignedPapersForStudent(ctx)).map((p) => p.paperId)).toContain(String(paperId));

    await startSubmission(String(paperId), ctx);
    const saved = await PaperSubmission.findOne({ paperId, studentId: thabo.studentId }).lean();
    expect(String(saved?.classId)).toBe(String(room.science.id));
  });
});

describe('projects in a second group', () => {
  it('lists, opens and takes a submission recorded against that group', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id, [room.science.id]);
    const projectId = oid();
    await Assignment.collection.insertOne({
      _id: projectId, schoolId: room.schoolId, teacherId: room.teacherId, title: 'Build a periscope', brief: 'Build one.',
      subjectId: oid(), gradeId: oid(), totalMarks: 10, status: 'published', submissionFormat: 'text', latePolicy: 'accept',
      version: 1, rubric: [], isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
      assignedClasses: [{ _id: oid(), classId: room.science.id, releaseAt: null, dueAt: null, assignedBy: room.teacherId, assignedAt: new Date() }],
    });

    const list = await listAssignmentsForStudent(String(thabo.studentId), String(room.schoolId));
    expect(list.map((a) => String(a._id))).toContain(String(projectId));
    const detail = await request(app).get(`/api/assignments/${String(projectId)}`).set('Authorization', `Bearer ${thabo.token}`);
    expect(detail.status).toBe(200);

    await submitAssignment(String(projectId), String(thabo.studentId), String(room.schoolId), { files: [], textAnswer: 'My periscope works.' });
    const saved = await AssignmentSubmission.findOne({ assignmentId: projectId, studentId: thabo.studentId }).lean();
    expect(String(saved?.classId)).toBe(String(room.science.id));
  });
});
