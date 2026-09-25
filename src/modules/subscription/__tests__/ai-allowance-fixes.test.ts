import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

vi.mock('../../AITools/service-marking-batch.js', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  confirmBatch: vi.fn(),
}));

import app from '../../../app.js';
import { StandaloneService } from '../../Auth/standalone.service.js';
import { User } from '../../Auth/model.js';
import { School } from '../../School/model.js';
import { Subscription } from '../model.js';
import { AIUsage } from '../ai-usage.model.js';
import { FREE_AI_ACTIONS_PER_MONTH, remainingAIActions, type AIActor } from '../ai-allowance.js';
import { confirmBatch } from '../../AITools/service-marking-batch.js';
import { ReportComment } from '../../AITutor/model-report-comments.js';
import { Student } from '../../Student/model.js';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { gradeSubmissionAsync } from '../../Homework/service-homework-grading-runner.js';
import { Question } from '../../QuestionBank/model.js';
import { AIService } from '../../../services/ai.service.js';

const schools: mongoose.Types.ObjectId[] = [];
const id = () => String(new mongoose.Types.ObjectId());
const oid = () => new mongoose.Types.ObjectId();

async function teacher() {
  const email = `aifix+${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
  const { user, tokens } = await StandaloneService.signup({ firstName: 'Nomsa', lastName: 'Teacher', email, password: 'Password1' });
  await User.updateOne({ _id: user._id }, { $set: { emailVerifiedAt: new Date() } });
  const schoolId = user.schoolId as mongoose.Types.ObjectId;
  schools.push(schoolId);
  const userId = user._id as mongoose.Types.ObjectId;
  const actor: AIActor = { schoolId: String(schoolId), userId: String(userId), isStandaloneTeacher: true, emailVerifiedAt: new Date() };
  return { schoolId, userId, token: tokens.accessToken, actor };
}

async function use(schoolId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, n: number) {
  if (n > 0) await AIUsage.insertMany(Array.from({ length: n }, () => ({ schoolId, userId, action: 'paper' })));
}

const count = (schoolId: mongoose.Types.ObjectId, action?: string) =>
  AIUsage.countDocuments({ schoolId, ...(action ? { action } : {}) });

async function learners(schoolId: mongoose.Types.ObjectId, n: number): Promise<string[]> {
  const docs = Array.from({ length: n }, () => {
    const _id = oid();
    return { _id, schoolId, userId: oid(), admissionNumber: `ADM-${String(_id)}`, isDeleted: false };
  });
  await Student.collection.insertMany(docs);
  return docs.map((d) => String(d._id));
}

/** A submission with one answer of the given question type, waiting to be graded. */
async function submission(t: { schoolId: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId }, type: 'short_answer' | 'mcq') {
  const questionId = oid();
  await Question.collection.insertOne({
    _id: questionId, schoolId: t.schoolId, type, stem: 'What is 1/2 + 1/4?', answer: '3/4', marks: 2, isDeleted: false,
    options: type === 'mcq' ? [{ text: '3/4', isCorrect: true }, { text: '1/6', isCorrect: false }] : [],
  });
  const { insertedId: homeworkId } = await Homework.collection.insertOne({
    schoolId: t.schoolId, teacherId: t.userId, title: 'Fractions', totalMarks: 2, isDeleted: false,
  });
  const { insertedId } = await HomeworkSubmission.collection.insertOne({
    schoolId: t.schoolId, homeworkId, studentId: oid(), type: 'exercise', homeworkVersion: 1,
    submittedAt: new Date(), gradingGeneration: 1, maxMarks: 2, gradingStatus: 'pending', isDeleted: false,
    answers: [{ questionId, studentAnswer: '3/4', questionSnapshot: 'What is 1/2 + 1/4?', maxMarks: 2, gradingMethod: 'pending' }],
  });
  return String(insertedId);
}

/** Lets fire-and-forget grading started by a request finish. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
});

afterEach(() => { vi.restoreAllMocks(); vi.mocked(confirmBatch).mockReset(); });

afterAll(async () => {
  for (const model of [AIUsage, ReportComment, Student, Homework, HomeworkSubmission, Question]) {
    await model.collection.deleteMany({ schoolId: { $in: schools } });
  }
  await Subscription.deleteMany({ schoolId: { $in: schools } });
  await User.deleteMany({ email: /^aifix\+.*@test\.local$/ });
  await School.deleteMany({ _id: { $in: schools } });
  await mongoose.connection.close();
});

describe('remainingAIActions', () => {
  it("is what's left this month for a standalone teacher, and null for a school teacher", async () => {
    const t = await teacher();
    await use(t.schoolId, t.userId, 17);
    expect(await remainingAIActions(t.actor)).toBe(3);
    expect(await remainingAIActions({ ...t.actor, isStandaloneTeacher: false })).toBeNull();
  });
});

describe('AI report comments', () => {
  const body = (studentIds: string[]) => ({ studentIds, subjectId: id(), term: 3, tone: 'encouraging' });

  it('refuses more comments than AI actions left, before any AI call', async () => {
    const t = await teacher();
    await use(t.schoolId, t.userId, FREE_AI_ACTIONS_PER_MONTH - 2);
    const ai = vi.spyOn(AIService, 'generateCompletionWithUsage');

    const res = await request(app).post('/api/ai-tutor/report-comments').set('Authorization', `Bearer ${t.token}`)
      .send(body(await learners(t.schoolId, 3)));

    expect(res.status).toBe(402);
    expect(res.body).toMatchObject({ code: 'AI_ALLOWANCE', details: { used: 18, limit: 20 } });
    expect(ai).not.toHaveBeenCalled();
  });

  it('counts one AI action per comment written', async () => {
    const t = await teacher();
    vi.spyOn(AIService, 'generateCompletionWithUsage').mockResolvedValue({ text: 'Works hard.', usage: { input_tokens: 1, output_tokens: 1 } } as never);

    const res = await request(app).post('/api/ai-tutor/report-comments').set('Authorization', `Bearer ${t.token}`)
      .send(body(await learners(t.schoolId, 2)));

    expect(res.status, JSON.stringify(res.body)).toBe(201);
    expect(await count(t.schoolId, 'report_comments')).toBe(2);
  });

  it('counts only the comments written before the AI failed', async () => {
    const t = await teacher();
    vi.spyOn(AIService, 'generateCompletionWithUsage')
      .mockResolvedValueOnce({ text: 'Works hard.', usage: { input_tokens: 1, output_tokens: 1 } } as never)
      .mockRejectedValueOnce(new Error('AI down'));

    const res = await request(app).post('/api/ai-tutor/report-comments').set('Authorization', `Bearer ${t.token}`)
      .send(body(await learners(t.schoolId, 2)));

    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(await count(t.schoolId, 'report_comments')).toBe(1);
  });

  it('refuses regenerating a comment with no AI actions left', async () => {
    const t = await teacher();
    await use(t.schoolId, t.userId, FREE_AI_ACTIONS_PER_MONTH);
    const ai = vi.spyOn(AIService, 'generateCompletionWithUsage');

    const res = await request(app).post(`/api/ai-tutor/report-comments/${id()}/regenerate`).set('Authorization', `Bearer ${t.token}`).send({});

    expect(res.status).toBe(402);
    expect(ai).not.toHaveBeenCalled();
  });
});

describe('batch marking', () => {
  it('refuses to mark more scripts than AI actions left, before any AI call', async () => {
    const t = await teacher();
    await use(t.schoolId, t.userId, FREE_AI_ACTIONS_PER_MONTH - 1);
    const script = { imageFilenames: ['p1.jpg'], studentId: id(), studentName: 'Sipho' };

    const res = await request(app).post(`/api/ai-tools/batches/${id()}/confirm`).set('Authorization', `Bearer ${t.token}`)
      .send({ assignments: [script, script, script] });

    expect(res.status).toBe(402);
    expect(res.body).toMatchObject({ code: 'AI_ALLOWANCE', details: { used: 19, limit: 20 } });
    expect(confirmBatch).not.toHaveBeenCalled();
    expect(await count(t.schoolId)).toBe(FREE_AI_ACTIONS_PER_MONTH - 1);
  });
});

describe('a teacher re-grading homework', () => {
  it('counts the re-grade once the AI has marked it', async () => {
    const t = await teacher();
    vi.spyOn(AIService, 'generateJSON').mockResolvedValue({ awarded: 2, rationale: 'Correct' });
    const subId = await submission(t, 'short_answer');

    const res = await request(app).post(`/api/homework/submissions/${subId}/regrade`).set('Authorization', `Bearer ${t.token}`).send({});

    expect(res.status, JSON.stringify(res.body)).toBe(200);
    await vi.waitFor(async () => expect(await count(t.schoolId, 'homework_regrade')).toBe(1), { timeout: 5000 });
  });

  it('does not count it when the AI marking fails in the background', async () => {
    const t = await teacher();
    const ai = vi.spyOn(AIService, 'generateJSON').mockRejectedValue(new Error('AI down'));
    const subId = await submission(t, 'short_answer');

    const res = await request(app).post(`/api/homework/submissions/${subId}/regrade`).set('Authorization', `Bearer ${t.token}`).send({});

    expect(res.status).toBe(200);
    await vi.waitFor(() => expect(ai).toHaveBeenCalled(), { timeout: 5000 });
    await settle();
    expect(await count(t.schoolId)).toBe(0);
  });

  it('does not count it when nothing needed the AI (multiple choice only)', async () => {
    const t = await teacher();
    const ai = vi.spyOn(AIService, 'generateJSON');
    const subId = await submission(t, 'mcq');

    const res = await request(app).post(`/api/homework/submissions/${subId}/regrade`).set('Authorization', `Bearer ${t.token}`).send({});

    expect(res.status).toBe(200);
    await settle();
    expect(ai).not.toHaveBeenCalled();
    expect(await count(t.schoolId)).toBe(0);
  });

  it("never counts a learner's own submission being marked (no teacher behind it)", async () => {
    const t = await teacher();
    vi.spyOn(AIService, 'generateJSON').mockResolvedValue({ awarded: 2, rationale: 'Correct' });

    await gradeSubmissionAsync(await submission(t, 'short_answer'));

    expect(await count(t.schoolId)).toBe(0);
  });

  it('refuses a re-grade with no AI actions left', async () => {
    const t = await teacher();
    await use(t.schoolId, t.userId, FREE_AI_ACTIONS_PER_MONTH);
    const subId = await submission(t, 'short_answer');

    const res = await request(app).post(`/api/homework/submissions/${subId}/regrade`).set('Authorization', `Bearer ${t.token}`).send({});

    expect(res.status).toBe(402);
  });
});
