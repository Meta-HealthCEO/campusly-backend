// src/modules/Evidence/__tests__/homework-writer.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../Homework/service-homework-grading-ai.js', () => ({
  gradeWithAI: vi.fn(async () => ({ awarded: 1, rationale: 'Named the rule but did not apply it.', gradingMethod: 'ai' })),
}));

import { AnswerEvidence } from '../model.js';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { HomeworkService } from '../../Homework/service.js';
import type { SubmitHomeworkInput } from '../../Homework/validation.js';
import { Question } from '../../QuestionBank/model.js';
import { Quiz } from '../../Learning/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { syncHomeworkEvidence } from '../writers/homework.js';
import { resetGenericTypeCache } from '../taxonomy-generic.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom } from '../../../test-utils/standalone-classroom.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
let room: Classroom;
let topic: Oid;
let mcq: Oid;
let written: Oid;
/** Checkpoint fix 4 carried to every writer: the record is read inside its school. */
const sync = (id: Oid) => syncHomeworkEvidence(id, room.schoolId);

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  room = await standaloneClassroom();
  topic = oid();
  await CurriculumNode.collection.insertOne({ _id: topic, frameworkId: oid(), type: 'topic', parentId: null, title: 'Exponents', code: `E-HW-${String(topic)}`, description: '', metadata: {}, order: 0, schoolId: null, isDeleted: false, createdAt: new Date(), updatedAt: new Date() });
  const base = { curriculumNodeId: topic, schoolId: room.schoolId, subjectId: oid(), gradeId: oid(), status: 'approved', createdBy: room.teacherId };
  mcq = (await Question.create({ ...base, type: 'mcq', stem: '2^3 = ?', marks: 1, cognitiveLevel: { caps: 'knowledge', blooms: 'remember' },
    options: [{ label: 'A', text: '6', isCorrect: false }, { label: 'B', text: '8', isCorrect: true }], answer: 'B' }))._id as Oid;
  written = (await Question.create({ ...base, type: 'short_answer', stem: 'Simplify 2^3 × 2^4.', marks: 3, answer: '2^7', markingRubric: 'Add exponents.',
    cognitiveLevel: { caps: 'routine', blooms: 'apply' } }))._id as Oid;
});
beforeEach(() => resetGenericTypeCache());
afterAll(async () => {
  await Promise.all([CurriculumNode.deleteMany({ code: /^E-HW-/ }), Quiz.deleteMany({ schoolId: room.schoolId })]);
  await cleanUpClassrooms();
  await mongoose.disconnect();
});

async function exerciseHomework(): Promise<Oid> {
  const id = oid();
  await Homework.collection.insertOne({
    _id: id, title: 'Exponent laws', type: 'exercise', exerciseQuestionIds: [mcq, written], subjectId: oid(), classId: room.maths.id,
    schoolId: room.schoolId, teacherId: room.teacherId, dueDate: new Date(Date.now() + 86_400_000), totalMarks: 4, status: 'assigned',
    attachments: [], latePolicy: 'accept', gradebookAutoPublish: false, version: 1, isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
  });
  return id;
}

const rowsFor = (submissionId: Oid) => AnswerEvidence.find({ 'source.recordId': submissionId, isDeleted: false }).lean();

describe('homework through the real submit and grading paths', () => {
  it('the instant answer is written at submit, the AI-marked one when it is graded', async () => {
    const thabo = await room.learner('Thabo', room.maths.id);
    const homeworkId = await exerciseHomework();
    const sub = await HomeworkService.submitHomework(String(homeworkId), String(thabo.studentId), String(room.schoolId), {
      type: 'exercise', answers: [{ questionId: String(mcq), studentAnswer: 'A' }, { questionId: String(written), studentAnswer: '2^12' }],
    } as SubmitHomeworkInput);
    const id = sub._id as Oid;
    await vi.waitFor(async () => expect(await rowsFor(id)).toHaveLength(2), { timeout: 5000 });
    const rows = await rowsFor(id);
    expect(rows.find((r) => r.source.itemKey === String(mcq))).toMatchObject({
      marksAwarded: 0, markedBy: 'deterministic', status: 'final', cognitiveLevel: 'knowledge', answer: expect.objectContaining({ kind: 'choice' }),
    });
    expect(rows.find((r) => r.source.itemKey === String(written))).toMatchObject({ marksAwarded: 1, markedBy: 'ai', markerNote: 'Named the rule but did not apply it.' });
    expect(String(rows[0].classId)).toBe(String(room.maths.id));
  });
});

describe('syncHomeworkEvidence', () => {
  async function submission(answers: Array<Record<string, unknown>>, extra: Record<string, unknown> = {}): Promise<Oid> {
    const id = oid();
    await HomeworkSubmission.collection.insertOne({
      _id: id, homeworkId: await exerciseHomework(), studentId: oid(), schoolId: room.schoolId, type: 'exercise', homeworkVersion: 1,
      submittedAt: new Date(), isLate: false, gradingStatus: 'graded', gradingGeneration: 1, maxMarks: 4, isDeleted: false,
      createdAt: new Date(), updatedAt: new Date(), answers, ...extra,
    });
    return id;
  }
  const answer = (questionId: Oid, over: Record<string, unknown> = {}) => ({
    questionId, studentAnswer: 'x', questionSnapshot: 's', awarded: 0, maxMarks: 1, gradingMethod: 'deterministic', ...over,
  });

  it('a pending answer has no row: a resubmission drops it until it is marked again', async () => {
    const id = await submission([answer(mcq), answer(written, { awarded: 1, maxMarks: 3, gradingMethod: 'ai' })]);
    await sync(id);
    await HomeworkSubmission.collection.updateOne({ _id: id }, { $set: { 'answers.1.gradingMethod': 'pending' }, $unset: { 'answers.1.awarded': '' } });
    const result = await sync(id);
    expect(result?.removed).toBe(1);
    expect(await rowsFor(id)).toHaveLength(1);
  });

  it("flags rows when the teacher overrode the total", async () => {
    const id = await submission([answer(mcq)], { gradedBy: room.teacherId });
    await sync(id);
    expect((await rowsFor(id))[0].totalOverridden).toBe(true);
  });

  it('a deleted submission soft-deletes its rows', async () => {
    const id = await submission([answer(mcq)]);
    await sync(id);
    await HomeworkSubmission.collection.updateOne({ _id: id }, { $set: { isDeleted: true } });
    await sync(id);
    expect(await AnswerEvidence.findOne({ 'source.recordId': id }).lean()).toMatchObject({ isDeleted: true, deletedReason: 'source_deleted' });
  });

  it('reads the submission only inside the given school', async () => {
    const id = await submission([answer(mcq)]);
    expect(await syncHomeworkEvidence(id, oid())).toBeNull();
    expect(await AnswerEvidence.countDocuments({ 'source.recordId': id })).toBe(0);
  });

  it('a quiz answer uses the migrated bank question when there is one', async () => {
    const quizId = oid();
    await Quiz.collection.insertOne({ _id: quizId, schoolId: room.schoolId, teacherId: room.teacherId, subjectId: oid(), classId: room.maths.id, title: 'Q', type: 'mixed',
      totalPoints: 2, status: 'closed', isDeleted: false, migratedQuestionIds: [mcq],
      questions: [{ questionText: '2^3 = ?', questionType: 'mcq', options: [], correctAnswer: '8', points: 1 }, { questionText: 'Why?', questionType: 'short_answer', options: [], correctAnswer: '', points: 1 }] });
    const homeworkId = oid();
    await Homework.collection.insertOne({ _id: homeworkId, title: 'Q', type: 'quiz', quizId, exerciseQuestionIds: [], subjectId: oid(), classId: room.maths.id,
      schoolId: room.schoolId, teacherId: room.teacherId, dueDate: new Date(), totalMarks: 2, status: 'assigned', attachments: [], latePolicy: 'accept',
      gradebookAutoPublish: false, version: 1, isDeleted: false });
    const id = oid();
    await HomeworkSubmission.collection.insertOne({ _id: id, homeworkId, studentId: oid(), schoolId: room.schoolId, type: 'quiz', homeworkVersion: 1, submittedAt: new Date(),
      isLate: false, gradingStatus: 'graded', gradingGeneration: 1, maxMarks: 2, isDeleted: false,
      answers: [
        { questionIndex: 0, studentAnswer: 'A', questionSnapshot: '2^3 = ?', awarded: 0, maxMarks: 1, gradingMethod: 'deterministic' },
        { questionIndex: 1, studentAnswer: 'dunno', questionSnapshot: 'Why?', awarded: 0, maxMarks: 1, gradingMethod: 'ai' },
      ] });
    await sync(id);
    const rows = await rowsFor(id);
    expect(rows.find((r) => r.source.itemKey === 'q0')).toMatchObject({ questionKey: `q:${String(mcq)}`, topicFrom: 'question' });
    expect(rows.find((r) => r.source.itemKey === 'q1')).toMatchObject({ questionKey: `lq:${String(quizId)}:1`, topicFrom: 'none' });
  });
});
