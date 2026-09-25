// src/modules/Homework/__tests__/ai-remark-limit.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../service-homework-grading-runner.js', () => ({ gradeSubmissionAsync: vi.fn(async () => undefined) }));

import { gradeSubmissionAsync } from '../service-homework-grading-runner.js';
import { Homework, HomeworkSubmission } from '../model.js';
import { HOMEWORK_AI_REMARKS, submitHomework } from '../service-homework-submit.js';
import { Question } from '../../QuestionBank/model.js';
import { School } from '../../School/model.js';
import { Student } from '../../Student/model.js';
import { cleanUpClassrooms, standaloneClassroom, trackSchool } from '../../../test-utils/standalone-classroom.js';

type Oid = mongoose.Types.ObjectId;
const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
beforeEach(() => { vi.mocked(gradeSubmissionAsync).mockClear(); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

/** A short-answer exercise (needs AI marking) for this class. */
async function exercise(schoolId: Oid, classId: Oid, teacherId: Oid): Promise<{ hw: Oid; q: Oid }> {
  const [hw, q] = [oid(), oid()];
  await Question.collection.insertOne({ _id: q, schoolId, type: 'short_answer', stem: 'Why is the sky blue?', answer: 'Scattering', marks: 2, isDeleted: false, options: [] });
  await Homework.collection.insertOne({
    _id: hw, schoolId, classId, subjectId: oid(), teacherId, title: 'Light', type: 'exercise', status: 'assigned',
    dueDate: new Date(Date.now() + 86_400_000), totalMarks: 2, latePolicy: 'accept', exerciseQuestionIds: [q],
    comprehensionQuestionIds: [], gradebookAutoPublish: false, version: 1, isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
  });
  return { hw, q };
}

const answer = (q: Oid, text: string) => ({ type: 'exercise' as const, answers: [{ questionId: String(q), studentAnswer: text }] });

describe('homework AI re-marks (ruling R20)', () => {
  it('a standalone learner gets AI marking three times; the fourth waits for the teacher', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    const { hw, q } = await exercise(room.schoolId, room.maths.id, room.teacherId);
    for (let i = 1; i <= HOMEWORK_AI_REMARKS + 1; i += 1) {
      await submitHomework(String(hw), String(thabo.studentId), String(room.schoolId), answer(q, `Attempt ${i}`));
    }
    expect(HOMEWORK_AI_REMARKS).toBe(3);
    expect(gradeSubmissionAsync).toHaveBeenCalledTimes(3);
    const sub = await HomeworkSubmission.findOne({ homeworkId: hw, studentId: thabo.studentId }).lean();
    expect(sub?.aiMarkCount).toBe(3);
    expect(sub?.gradingStatus).toBe('pending');
  });

  it('a school learner keeps unlimited AI marking', async () => {
    const schoolId = oid();
    trackSchool(schoolId);
    await School.collection.insertOne({ _id: schoolId, name: 'lp_school', plan: 'school', isActive: true, isDeleted: false });
    const [classId, studentId] = [oid(), oid()];
    await Student.collection.insertOne({ _id: studentId, schoolId, userId: oid(), classId, gradeId: oid(), subjectClassIds: [], admissionNumber: `K-${studentId}`, enrollmentStatus: 'active', isDeleted: false });
    const { hw, q } = await exercise(schoolId, classId, oid());
    for (let i = 1; i <= 4; i += 1) await submitHomework(String(hw), String(studentId), String(schoolId), answer(q, `Attempt ${i}`));
    expect(gradeSubmissionAsync).toHaveBeenCalledTimes(4);
  });
});
