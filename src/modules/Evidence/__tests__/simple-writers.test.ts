// src/modules/Evidence/__tests__/simple-writers.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { AnswerEvidence } from '../model.js';
import { QuizAttempt, Course } from '../../Course/model.js';
import { Question } from '../../QuestionBank/model.js';
import { PracticeAttempt } from '../../AITutor/model.js';
import { PracticeService } from '../../AITutor/practice.service.js';
import { ContentResource } from '../../ContentLibrary/model.js';
import { StudentAttempt } from '../../ContentLibrary/model-tracking.js';
import { AttemptsService } from '../../ContentLibrary/service-attempts.js';
import type { SubmitAttemptInput } from '../../ContentLibrary/validation-student.js';
import { Student } from '../../Student/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { generatePracticeSchema } from '../../AITutor/validation.js';
import { syncQuickCheckEvidence } from '../writers/unit-check.js';
import { syncPracticeEvidence } from '../writers/practice.js';
import { syncLibraryEvidence } from '../writers/library.js';
import { resetGenericTypeCache } from '../taxonomy-generic.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const schoolId = oid();
const studentId = oid();
const userId = oid();
const topic = oid();
const now = new Date();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await CurriculumNode.collection.insertOne({ _id: topic, frameworkId: oid(), type: 'topic', parentId: null, title: 'Stoichiometry', code: `E-SW-${String(topic)}`, description: '', metadata: {}, order: 0, schoolId: null, isDeleted: false });
  await Student.collection.insertOne({ _id: studentId, schoolId, userId, classId: oid(), gradeId: oid(), admissionNumber: 'E-SW', isDeleted: false });
});
beforeEach(() => resetGenericTypeCache());
afterAll(async () => {
  await Promise.all([
    AnswerEvidence.deleteMany({ schoolId }), QuizAttempt.deleteMany({ schoolId }), Course.deleteMany({ schoolId }), Question.deleteMany({ schoolId }),
    PracticeAttempt.deleteMany({ schoolId }), ContentResource.deleteMany({ schoolId }), StudentAttempt.deleteMany({ schoolId }),
    Student.deleteMany({ schoolId }), CurriculumNode.deleteMany({ code: /^E-SW-/ }),
  ]);
  await mongoose.disconnect();
});

describe('unit quick checks', () => {
  it('writes one row per answered question, every retry separately', async () => {
    const q = await Question.create({ curriculumNodeId: topic, schoolId, subjectId: oid(), gradeId: oid(), type: 'mcq', stem: 'Moles in 18 g of water?', marks: 2,
      cognitiveLevel: { caps: 'routine', blooms: 'apply' }, options: [{ label: 'A', text: '1', isCorrect: true }, { label: 'B', text: '2', isCorrect: false }], status: 'approved', createdBy: oid() });
    const classId = oid();
    const course = await Course.collection.insertOne({ schoolId, title: 'Unit', subjectId: oid(), scope: { builtForClassId: classId }, isDeleted: false });
    const lessonId = oid();
    const attempt = (n: number, answer: string, marks: number) => QuizAttempt.create({ schoolId, enrolmentId: oid(), studentId, courseId: course.insertedId, lessonId,
      attemptNumber: n, answers: [{ questionId: q._id, answer, isCorrect: marks > 0, marks }], totalMarks: 2, earnedMarks: marks, percent: marks * 50, passed: marks > 0, submittedAt: now });
    const first = await attempt(1, 'B', 0);
    const second = await attempt(2, 'A', 2);
    await syncQuickCheckEvidence(first._id, schoolId);
    await syncQuickCheckEvidence(second._id, schoolId);
    const rows = await AnswerEvidence.find({ schoolId, 'source.type': 'unit_check' }).sort({ 'source.attemptNumber': 1 }).lean();
    expect(rows.map((r) => [r.source.attemptNumber, r.marksAwarded, r.diagnosis.state])).toEqual([[1, 0, 'pending'], [2, 2, 'none']]);
    expect(rows[0]).toMatchObject({ questionKey: `q:${String(q._id)}`, cognitiveLevel: 'routine', answer: expect.objectContaining({ kind: 'choice' }) });
    expect(String(rows[0].classId)).toBe(String(classId));
    expect(await syncQuickCheckEvidence(first._id, oid())).toBeNull(); // read only inside its school
  });
});

describe('AI tutor practice', () => {
  it('accepts a curriculum node when practice is launched on a topic', () => {
    const parsed = generatePracticeSchema.parse({ subjectId: String(oid()), subjectName: 'Physical Sciences', grade: 11, topic: 'Stoichiometry', curriculumNodeId: String(topic) });
    expect(parsed.curriculumNodeId).toBe(String(topic));
  });

  it('writes rows on submit: with a node they have a topic, without one they count at subject level', async () => {
    const withNode = await PracticeAttempt.create({ schoolId, studentId: userId, subjectId: oid(), topic: 'Stoichiometry', grade: 11, totalMarks: 2, curriculumNodeId: topic,
      questions: [{ questionText: 'Mr of H2O?', questionType: 'mcq', options: ['16', '18'], correctAnswer: '18', explanation: 'H2 + O', marks: 1, capsLevel: 'knowledge' },
        { questionText: 'Moles in 36 g H2O?', questionType: 'mcq', options: ['1', '2'], correctAnswer: '2', explanation: 'n = m/M', marks: 1, capsLevel: 'routine' }] });
    await PracticeService.submitPractice(String(userId), String(schoolId), { attemptId: String(withNode._id), answers: [{ questionIndex: 0, answer: '16' }, { questionIndex: 1, answer: '2' }] });
    const rows = await AnswerEvidence.find({ schoolId, 'source.type': 'practice', 'source.recordId': withNode._id }).sort({ 'source.position': 1 }).lean();
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ topicFrom: 'practice', cognitiveLevel: 'knowledge', marksAwarded: 0, questionKey: `pr:${String(withNode._id)}:0` });
    expect(String(rows[0].studentId)).toBe(String(studentId));

    const free = await PracticeAttempt.create({ schoolId, studentId: userId, subjectId: oid(), topic: 'my own words', grade: 11, totalMarks: 1,
      questions: [{ questionText: 'q', questionType: 'true_false', correctAnswer: 'True', explanation: 'e', marks: 1 }], completedAt: now });
    await PracticeAttempt.collection.updateOne({ _id: free._id }, { $set: { 'questions.0.studentAnswer': 'False', 'questions.0.marksAwarded': 0 } });
    await syncPracticeEvidence(free._id, schoolId);
    expect(await AnswerEvidence.findOne({ 'source.recordId': free._id }).lean()).toMatchObject({ topicFrom: 'none', diagnosis: expect.objectContaining({ state: 'skipped', skippedReason: 'no_topic' }) });
  });
});

describe('content library', () => {
  it('writes graded interactive blocks and skips informational ones', async () => {
    const resource = await ContentResource.collection.insertOne({ schoolId, curriculumNodeId: topic, type: 'study_notes', format: 'interactive', title: 'Moles',
      gradeId: oid(), subjectId: oid(), term: 1, status: 'approved', createdBy: oid(), isDeleted: false, source: 'teacher', tags: [],
      blocks: [
        { blockId: 'b1', type: 'quiz', order: 0, content: JSON.stringify({ type: 'mcq', options: [{ label: 'A', isCorrect: false }, { label: 'B', isCorrect: true }] }), points: 1, curriculumNodeId: topic, cognitiveLevel: { caps: 'Routine', blooms: 'apply' } },
        { blockId: 'b2', type: 'text', order: 1, content: 'Read this.', points: 1 },
      ] });
    await AttemptsService.submitAttempt(String(studentId), String(schoolId), String(resource.insertedId), { blockId: 'b1', response: 'A', timeSpentSeconds: 10, hintsUsed: 0 } as SubmitAttemptInput);
    await AttemptsService.submitAttempt(String(studentId), String(schoolId), String(resource.insertedId), { blockId: 'b2', response: '', timeSpentSeconds: 5, hintsUsed: 0 } as SubmitAttemptInput);
    const rows = await AnswerEvidence.find({ schoolId, 'source.type': 'library' }).lean();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ questionKey: `cb:${String(resource.insertedId)}:b1`, topicFrom: 'block', cognitiveLevel: 'routine', marksAwarded: 0, marksAvailable: 1 });
    const text = await StudentAttempt.findOne({ schoolId, blockId: 'b2' }).lean();
    expect((await syncLibraryEvidence(text!._id, schoolId))?.skipped).toEqual({ informational_block: 1 });
  });
});
