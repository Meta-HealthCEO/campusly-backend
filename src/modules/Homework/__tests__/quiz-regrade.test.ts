// src/modules/Homework/__tests__/quiz-regrade.test.ts
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../service-homework-grading-ai.js', () => ({
  gradeWithAI: vi.fn(async () => ({ awarded: 1, rationale: 'Partly right', gradingMethod: 'ai' })),
}));

import { Homework, HomeworkSubmission } from '../model.js';
import { Quiz } from '../../Learning/model.js';
import { gradeSubmissionAsync } from '../service-homework-grading-runner.js';
import { quizQuestionAsBankShape } from '../service-homework-grading.js';

const oid = () => new mongoose.Types.ObjectId();
const schoolId = oid();

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => {
  await Promise.all([Homework.deleteMany({ schoolId }), HomeworkSubmission.deleteMany({ schoolId }), Quiz.deleteMany({ schoolId })]);
  await mongoose.disconnect();
});

describe('quizQuestionAsBankShape', () => {
  it("labels the quiz's own options A, B, … in order", () => {
    const q = quizQuestionAsBankShape({
      questionText: '2 + 2?', questionType: 'mcq', correctAnswer: '4', points: 2,
      options: [{ text: '4', isCorrect: true }, { text: '5', isCorrect: false }],
    });
    expect(q.options).toEqual([{ label: 'A', text: '4', isCorrect: true }, { label: 'B', text: '5', isCorrect: false }]);
    expect(q.marks).toBe(2);
  });
});

describe('a regraded quiz homework', () => {
  it('gives a correct multiple-choice answer its marks', async () => {
    const quizId = oid();
    const homeworkId = oid();
    const submissionId = oid();
    const now = new Date();
    await Quiz.collection.insertOne({
      _id: quizId, schoolId, teacherId: oid(), subjectId: oid(), classId: oid(), title: 'Quick sums', type: 'mixed', totalPoints: 5,
      status: 'published', isDeleted: false, createdAt: now, updatedAt: now,
      questions: [
        { questionText: '2 + 2?', questionType: 'mcq', options: [{ text: '4', isCorrect: true }, { text: '5', isCorrect: false }], correctAnswer: '4', points: 2 },
        { questionText: 'Explain why 0 is even.', questionType: 'short_answer', options: [], correctAnswer: 'It is divisible by 2', points: 3 },
      ],
    });
    await Homework.collection.insertOne({
      _id: homeworkId, title: 'Quick sums', type: 'quiz', quizId, exerciseQuestionIds: [], subjectId: oid(), classId: oid(), schoolId,
      teacherId: oid(), dueDate: now, totalMarks: 5, status: 'assigned', attachments: [], latePolicy: 'accept',
      gradebookAutoPublish: false, version: 1, isDeleted: false, createdAt: now, updatedAt: now,
    });
    // As Homework/service.ts regrade leaves it: every answer back to pending, generation bumped.
    await HomeworkSubmission.collection.insertOne({
      _id: submissionId, homeworkId, studentId: oid(), schoolId, type: 'quiz', homeworkVersion: 1, submittedAt: now, isLate: false,
      gradingStatus: 'pending', gradingGeneration: 2, maxMarks: 5, isDeleted: false, createdAt: now, updatedAt: now,
      answers: [
        { questionIndex: 0, studentAnswer: 'A', questionSnapshot: '2 + 2?', maxMarks: 2, gradingMethod: 'pending' },
        { questionIndex: 1, studentAnswer: 'It halves', questionSnapshot: 'Explain why 0 is even.', maxMarks: 3, gradingMethod: 'pending' },
      ],
    });

    await gradeSubmissionAsync(String(submissionId));

    const sub = await HomeworkSubmission.collection.findOne({ _id: submissionId });
    expect(sub?.answers[0].awarded).toBe(2);
    expect(sub?.answers[0].gradingMethod).toBe('deterministic');
    expect(sub?.gradingStatus).toBe('graded');
    expect(sub?.mark).toBe(3);
  });
});
