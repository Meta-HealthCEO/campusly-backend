import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { CourseProgressService } from '../service-progress.js';
import { Course, CourseLesson, CourseModule, Enrolment } from '../model.js';
import { Question } from '../../QuestionBank/model.js';
import { Student } from '../../Student/model.js';
// Side-effect imports: a passed attempt completes the enrolment, which touches certificates (populates users and schools).
import '../../Auth/model.js';
import '../../School/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

/** A learner enrolled in a unit whose only item is a quick check with two questions. */
async function checkFixture() {
  const schoolId = oid();
  const userId = oid();
  const studentId = oid();
  await Student.collection.insertOne({ _id: studentId, schoolId, userId, admissionNumber: `A-${studentId}`, isDeleted: false });
  const [q1, q2] = [oid(), oid()];
  await Question.collection.insertMany([
    { _id: q1, schoolId, type: 'mcq', stem: 'Q1', marks: 1, isDeleted: false, options: [{ label: 'A', text: 'right', isCorrect: true }, { label: 'B', text: 'wrong', isCorrect: false }] },
    { _id: q2, schoolId, type: 'mcq', stem: 'Q2', marks: 1, isDeleted: false, options: [{ label: 'A', text: 'right', isCorrect: true }, { label: 'B', text: 'wrong', isCorrect: false }] },
  ]);
  const course = await Course.create({ schoolId, title: 'Numbers to 99', slug: `u-${oid()}`, createdBy: oid(), status: 'published', kind: 'class_unit' });
  const mod = await CourseModule.create({ schoolId, courseId: course._id, title: 'Counting', orderIndex: 0 });
  const lesson = await CourseLesson.create({
    schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 0, title: 'Check: counting', type: 'quiz',
    itemKind: 'quick_check', quizQuestionIds: [q1, q2], passMarkPercent: 50,
  });
  const enrolment = await Enrolment.create({ schoolId, courseId: course._id, studentId, enrolledBy: oid() });
  return { schoolId: String(schoolId), userId: String(userId), enrolmentId: String(enrolment._id), lessonId: String(lesson._id), lesson, q1, q2 };
}

describe('CourseProgressService.submitQuizAttempt (A14)', () => {
  it('grades an attempt against the questions the learner was actually served', async () => {
    const f = await checkFixture();
    const res = await CourseProgressService.submitQuizAttempt(f.enrolmentId, f.lessonId, f.userId, f.schoolId, {
      answers: [{ questionId: String(f.q1), answer: 'A' }, { questionId: String(f.q2), answer: 'A' }],
    });
    expect(res.passed).toBe(true);
  });

  it('refuses to grade when the check has changed since it was served', async () => {
    const f = await checkFixture();
    // The teacher swaps in a new question while the learner is mid-attempt.
    const newQuestionId = new mongoose.Types.ObjectId();
    await Question.collection.insertOne({ _id: newQuestionId, schoolId: new mongoose.Types.ObjectId(f.schoolId), type: 'mcq', stem: 'New Q2', marks: 1, isDeleted: false, options: [{ label: 'A', text: 'right', isCorrect: true }, { label: 'B', text: 'wrong', isCorrect: false }] });
    await CourseLesson.updateOne({ _id: f.lesson._id }, { $set: { quizQuestionIds: [f.q1, newQuestionId] } });

    await expect(CourseProgressService.submitQuizAttempt(f.enrolmentId, f.lessonId, f.userId, f.schoolId, {
      // The learner still holds the old question (q2), served before the edit.
      answers: [{ questionId: String(f.q1), answer: 'A' }, { questionId: String(f.q2), answer: 'A' }],
    })).rejects.toThrow('This check changed. Start it again.');
  });

  it('still allows a partial submission (some current questions left unanswered)', async () => {
    const f = await checkFixture();
    const res = await CourseProgressService.submitQuizAttempt(f.enrolmentId, f.lessonId, f.userId, f.schoolId, {
      answers: [{ questionId: String(f.q1), answer: 'A' }],
    });
    expect(res.attempt.totalMarks).toBe(2);
  });
});
