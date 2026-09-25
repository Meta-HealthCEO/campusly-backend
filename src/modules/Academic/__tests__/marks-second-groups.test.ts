// src/modules/Academic/__tests__/marks-second-groups.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { Assessment } from '../model.js';
import { AssessmentService } from '../services/assessment.service.js';
import { getTermSummary } from '../services/term-summary.service.js';
import { AssessmentPaper } from '../../QuestionBank/model-papers.js';
import { loadPaperInputs } from '../../TeacherWorkbench/services/marking-queue.db.js';
import { getPaperMarkingRoster } from '../../QuestionBank/service-paper-marking-workspace.js';
import { loadRoster } from '../../AITools/service-marking-batch.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom, type Learner } from '../../../test-utils/standalone-classroom.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

async function setUp(): Promise<{ room: Classroom; thabo: Learner }> {
  const room = await standaloneClassroom();
  await room.learner('Lebo', room.maths.id);
  return { room, thabo: await room.learner('Thabo', room.science.id, [room.maths.id]) };
}

async function mathsTest(room: Classroom): Promise<mongoose.Types.ObjectId> {
  const _id = oid();
  await AssessmentPaper.collection.insertOne({
    _id, schoolId: room.schoolId, title: 'Algebra test', status: 'finalised', isDeleted: false, year: new Date().getFullYear(),
    totalMarks: 10, subjectId: oid(), createdBy: room.teacherId,
    assignments: [{ _id: oid(), classId: room.maths.id, mode: 'paper', releaseAt: null, dueAt: null, assignedBy: room.teacherId, assignedAt: new Date() }],
  });
  return _id;
}

describe('a learner who joined a second group can be marked in it', () => {
  it('gradebook: capturing their mark is accepted', async () => {
    const { room, thabo } = await setUp();
    const assessmentId = oid();
    await Assessment.collection.insertOne({
      _id: assessmentId, schoolId: room.schoolId, classId: room.maths.id, subjectId: oid(), name: 'Algebra test', type: 'test',
      totalMarks: 10, term: 3, academicYear: 2026, date: new Date('2026-09-20'), isDeleted: false,
    });
    const marks = await AssessmentService.bulkCaptureMarks(String(assessmentId), String(room.schoolId), [{ studentId: String(thabo.studentId), mark: 7, total: 10 }]);
    expect(marks).toHaveLength(1);
  });

  it('term summary lists them', async () => {
    const { room, thabo } = await setUp();
    const summary = await getTermSummary({ schoolId: String(room.schoolId), classId: String(room.maths.id), term: 3, academicYear: 2026 });
    expect(summary.students.map((s) => s.studentId)).toContain(String(thabo.studentId));
  });

  it('marking queue and paper marking list them under the group the test was set for', async () => {
    const { room, thabo } = await setUp();
    const paperId = await mathsTest(room);
    const inputs = await loadPaperInputs(String(room.teacherId), String(room.schoolId), new Date());
    expect(inputs.find((i) => i.classId === String(room.maths.id))?.students.map((s) => s.studentId)).toContain(String(thabo.studentId));
    const roster = await getPaperMarkingRoster(String(paperId), String(room.schoolId));
    expect(roster.classes[0]?.students.map((s) => s.studentId)).toContain(String(thabo.studentId));
    expect(roster.classes[0]?.studentCount).toBe(2);
  });

  it('batch marking matches scripts against them', async () => {
    const { room, thabo } = await setUp();
    expect((await loadRoster(room.maths.id, room.schoolId)).map((s) => String(s._id))).toContain(String(thabo.studentId));
  });
});
