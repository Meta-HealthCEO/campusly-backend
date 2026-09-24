import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { HomeworkService } from '../service.js';
import { Homework, HomeworkSubmission } from '../model.js';
import { Mark } from '../../Academic/model.js';
// Side-effect imports to register models referenced by populate().
import '../../Auth/model.js';
import '../../Student/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function ungradedSubmission(gradebookAutoPublish: boolean) {
  const schoolId = oid();
  const studentId = oid();
  const homework = await Homework.create({
    schoolId, teacherId: oid(), classId: oid(), subjectId: oid(), title: 'Count and colour to 20', type: 'exercise',
    exerciseQuestionIds: [oid()], dueDate: new Date(), totalMarks: 10, status: 'assigned',
    attachments: [], latePolicy: 'block', gradebookAutoPublish,
  });
  const submission = await HomeworkSubmission.create({
    homeworkId: homework._id, studentId, schoolId, homeworkVersion: 1, submittedAt: new Date(), maxMarks: 10,
  });
  return { schoolId, studentId, submissionId: String(submission._id) };
}

describe('HomeworkService.gradeSubmission', () => {
  it('puts a mark entered by hand in the gradebook, like an auto-mark', async () => {
    const f = await ungradedSubmission(true);
    await HomeworkService.gradeSubmission(f.submissionId, String(f.schoolId), 7, 'Good counting', String(oid()));

    const mark = await Mark.findOne({ studentId: f.studentId, schoolId: f.schoolId }).lean();
    expect(mark).toMatchObject({ mark: 7, total: 10, percentage: 70 });
  });

  it('leaves the gradebook alone when the homework does not publish to it', async () => {
    const f = await ungradedSubmission(false);
    await HomeworkService.gradeSubmission(f.submissionId, String(f.schoolId), 7, undefined, String(oid()));

    expect(await Mark.countDocuments({ studentId: f.studentId, schoolId: f.schoolId })).toBe(0);
  });

  it('keeps a hand-entered mark when a slower auto-grade finishes afterwards', async () => {
    const f = await ungradedSubmission(false);
    const before = await HomeworkSubmission.findById(f.submissionId).lean();
    const capturedGeneration = before?.gradingGeneration;

    await HomeworkService.gradeSubmission(f.submissionId, String(f.schoolId), 7, undefined, String(oid()));
    // The grader writes only if the generation it captured is unchanged
    // (service-homework-grading-runner.ts).
    const late = await HomeworkSubmission.updateOne(
      { _id: f.submissionId, gradingGeneration: capturedGeneration },
      { $set: { mark: 3 } },
    );

    expect(late.matchedCount).toBe(0);
    expect((await HomeworkSubmission.findById(f.submissionId).lean())?.mark).toBe(7);
  });
});
