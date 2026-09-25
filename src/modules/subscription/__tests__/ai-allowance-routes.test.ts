import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

// Named-export AI services are replaced at the module boundary; class services are spied on below.
vi.mock('../../Assignment/service-ai-generate.js', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  generateAssignmentDraft: vi.fn(),
}));
vi.mock('../../AITools/service-marking-text.js', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  markPaperFromText: vi.fn(),
}));
vi.mock('../../Homework/service-homework-comprehension.js', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  generateComprehensionQuestions: vi.fn(),
}));
vi.mock('../../QuestionBank/service-paper-questions.js', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  regeneratePaperQuestion: vi.fn(),
}));
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
import { FREE_AI_ACTIONS_PER_MONTH } from '../ai-allowance.js';
import { PaperGenerationService } from '../../QuestionBank/service-paper-generation.js';
import { GenerationService } from '../../QuestionBank/service-generation.js';
import { MemoService } from '../../TeacherWorkbench/services/memo.service.js';
import { ClassUnitService } from '../../Course/service-class-unit.js';
import { HomeworkService } from '../../Homework/service.js';
import { generateAssignmentDraft } from '../../Assignment/service-ai-generate.js';
import { markPaperFromText } from '../../AITools/service-marking-text.js';
import { confirmBatch } from '../../AITools/service-marking-batch.js';
import { generateComprehensionQuestions } from '../../Homework/service-homework-comprehension.js';
import { regeneratePaperQuestion } from '../../QuestionBank/service-paper-questions.js';
import { UnitItemsService } from '../../Course/service-unit-items.js';
import { Course } from '../../Course/model.js';
import { gradeSubmissionAsync } from '../../Homework/service-homework-grading-runner.js';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { Question } from '../../QuestionBank/model.js';
import { AIService } from '../../../services/ai.service.js';
import { signTestToken } from '../../../test-utils/auth.js';

const schools: mongoose.Types.ObjectId[] = [];
const id = () => String(new mongoose.Types.ObjectId());

async function verifiedStandaloneTeacher() {
  const email = `aiallow+${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
  const { user, tokens } = await StandaloneService.signup({ firstName: 'Lerato', lastName: 'Teacher', email, password: 'Password1' });
  await User.updateOne({ _id: user._id }, { $set: { emailVerifiedAt: new Date() } });
  const schoolId = user.schoolId as mongoose.Types.ObjectId;
  schools.push(schoolId);
  return { schoolId, userId: user._id as mongoose.Types.ObjectId, token: tokens.accessToken };
}

async function useUp(schoolId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
  await AIUsage.insertMany(Array.from({ length: FREE_AI_ACTIONS_PER_MONTH }, () => ({ schoolId, userId, action: 'paper' })));
}

interface Endpoint {
  name: string;
  action: string;
  method: 'post';
  path: () => string;
  body: Record<string, unknown>;
  /** Replaces the AI work behind the endpoint; returns the spy. */
  stub: () => unknown;
}

const paperBody = {
  subjectId: id(), gradeId: id(), topicIds: [id()], term: 1, year: 2026, paperType: 'class_test',
  duration: 60, totalMarks: 50, title: 'Fractions test', sectionConfig: [{ title: 'Section A', questionCount: 5, sectionMarks: 50 }],
};

const endpoints: Endpoint[] = [
  {
    name: 'generate a test paper', action: 'paper', method: 'post', path: () => '/api/question-bank/papers/generate', body: paperBody,
    stub: () => vi.spyOn(PaperGenerationService, 'generatePaper').mockResolvedValue({ _id: id() } as never),
  },
  {
    name: 'draft homework questions', action: 'homework_draft', method: 'post', path: () => '/api/question-bank/questions/generate',
    body: { curriculumNodeId: id(), subjectId: id(), gradeId: id(), type: 'short_answer', count: 5, difficulty: 3, cognitiveLevel: { caps: 'routine', blooms: 'apply' } },
    stub: () => vi.spyOn(GenerationService, 'generateQuestions').mockResolvedValue([] as never),
  },
  {
    name: 'draft a project brief', action: 'project_draft', method: 'post', path: () => '/api/assignments/generate',
    body: { subjectId: id(), gradeId: id(), topicIds: [id()], totalMarks: 40, instructions: 'A poster on the water cycle' },
    stub: () => vi.mocked(generateAssignmentDraft).mockResolvedValue({ title: 'Water cycle' } as never),
  },
  {
    name: 'mark a script from typed answers', action: 'marking', method: 'post', path: () => '/api/ai-tools/mark-paper-text',
    body: { paperId: id(), studentName: 'Thandi', answers: [{ questionNumber: '1', answer: '3/4' }] },
    stub: () => vi.mocked(markPaperFromText).mockResolvedValue({ _id: id() } as never),
  },
  {
    name: 'generate a memo', action: 'memo', method: 'post', path: () => `/api/teacher-workbench/memos/generate/${id()}`, body: {},
    stub: () => vi.spyOn(MemoService, 'generateMemo').mockResolvedValue({ _id: id() } as never),
  },
  {
    name: 'draft a unit outline', action: 'unit_outline', method: 'post', path: () => `/api/courses/${id()}/outline`, body: {},
    stub: () => vi.spyOn(ClassUnitService, 'draftOutline').mockResolvedValue({ _id: id() } as never),
  },
  {
    name: 'approve a unit outline (items are written)', action: 'unit_build', method: 'post', path: () => `/api/courses/${id()}/outline/approve`, body: {},
    stub: () => vi.spyOn(ClassUnitService, 'approveOutline').mockResolvedValue({ _id: id() } as never),
  },
  {
    name: 'rewrite a unit item', action: 'unit_rewrite', method: 'post', path: () => `/api/courses/${id()}/lessons/${id()}/rewrite`,
    body: { action: 'simpler_words' },
    stub: () => vi.spyOn(UnitItemsService, 'rewrite').mockResolvedValue(undefined),
  },
  {
    name: 'add a revision item', action: 'revision_item', method: 'post', path: () => `/api/courses/${id()}/revision`,
    body: { afterLessonId: id(), questionIds: [id()] },
    stub: () => vi.spyOn(UnitItemsService, 'addRevisionItem').mockResolvedValue({ _id: id() } as never),
  },
  {
    name: 'regenerate a paper question', action: 'paper_regenerate', method: 'post',
    path: () => `/api/question-bank/papers/${id()}/sections/0/questions/0/regenerate`, body: {},
    stub: () => vi.mocked(regeneratePaperQuestion).mockResolvedValue({ _id: id() } as never),
  },
  {
    name: 'draft reading questions', action: 'homework_draft', method: 'post',
    path: () => `/api/homework/comprehension-questions?subjectId=${id()}&gradeId=${id()}&curriculumNodeId=${id()}`,
    body: { contentResourceId: id(), count: 4 },
    stub: () => vi.mocked(generateComprehensionQuestions).mockResolvedValue([] as never),
  },
  {
    name: 're-grade a learner submission', action: 'homework_regrade', method: 'post', path: () => `/api/homework/submissions/${id()}/regrade`, body: {},
    stub: () => vi.spyOn(HomeworkService, 'regrade').mockResolvedValue({ _id: id() } as never),
  },
];

describe('every standalone AI action draws from one allowance', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  });

  afterEach(() => { vi.restoreAllMocks(); vi.mocked(generateAssignmentDraft).mockReset(); vi.mocked(markPaperFromText).mockReset(); vi.mocked(confirmBatch).mockReset(); vi.mocked(generateComprehensionQuestions).mockReset(); vi.mocked(regeneratePaperQuestion).mockReset(); });

  afterAll(async () => {
    await AIUsage.collection.deleteMany({ schoolId: { $in: schools } });
    await Homework.collection.deleteMany({ schoolId: { $in: schools } });
    await Course.collection.deleteMany({ schoolId: { $in: schools } });
    await HomeworkSubmission.collection.deleteMany({ schoolId: { $in: schools } });
    await Question.collection.deleteMany({ schoolId: { $in: schools } });
    await Subscription.deleteMany({ schoolId: { $in: schools } });
    await User.deleteMany({ email: /^aiallow\+.*@test\.local$/ });
    await School.deleteMany({ _id: { $in: schools } });
    await mongoose.connection.close();
  });

  describe.each(endpoints)('$name', (endpoint: Endpoint) => {
    it('refuses with 402 once the month is used up, without calling the AI', async () => {
      const t = await verifiedStandaloneTeacher();
      await useUp(t.schoolId, t.userId);
      const ai = endpoint.stub();

      const res = await request(app)[endpoint.method](endpoint.path()).set('Authorization', `Bearer ${t.token}`).send(endpoint.body);

      expect(res.status).toBe(402);
      expect(res.body).toMatchObject({ code: 'AI_ALLOWANCE', details: { used: 20, limit: 20 } });
      expect(ai).not.toHaveBeenCalled();
    });

    it(`counts one "${endpoint.action}" when it works`, async () => {
      const t = await verifiedStandaloneTeacher();
      const ai = endpoint.stub();

      const res = await request(app)[endpoint.method](endpoint.path()).set('Authorization', `Bearer ${t.token}`).send(endpoint.body);

      expect(res.status, JSON.stringify(res.body)).toBeLessThan(300);
      expect(ai).toHaveBeenCalledTimes(1);
      const rows = await AIUsage.find({ schoolId: t.schoolId }).lean();
      expect(rows.map((r) => r.action)).toEqual([endpoint.action]);
    });
  });

  it('does not count an AI call that failed', async () => {
    const t = await verifiedStandaloneTeacher();
    vi.spyOn(MemoService, 'generateMemo').mockRejectedValue(new Error('AI service is not configured'));

    const res = await request(app).post(`/api/teacher-workbench/memos/generate/${id()}`).set('Authorization', `Bearer ${t.token}`).send({});

    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(await AIUsage.countDocuments({ schoolId: t.schoolId })).toBe(0);
  });

  it('refuses an unverified standalone teacher with 403 EMAIL_UNVERIFIED', async () => {
    const t = await verifiedStandaloneTeacher();
    await User.updateOne({ _id: t.userId }, { $set: { emailVerifiedAt: null } });
    const ai = vi.spyOn(MemoService, 'generateMemo').mockResolvedValue({ _id: id() } as never);

    const res = await request(app).post(`/api/teacher-workbench/memos/generate/${id()}`).set('Authorization', `Bearer ${t.token}`).send({});

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('EMAIL_UNVERIFIED');
    expect(ai).not.toHaveBeenCalled();
  });

  it('does not create an empty unit for a teacher with no AI actions left', async () => {
    const t = await verifiedStandaloneTeacher();
    await useUp(t.schoolId, t.userId);
    const create = vi.spyOn(ClassUnitService, 'create');

    const res = await request(app).post('/api/courses/class-units').set('Authorization', `Bearer ${t.token}`)
      .send({ classId: id(), subjectId: id(), termNumber: 1, topicNodeIds: [id()] });

    expect(res.status).toBe(402);
    expect(create).not.toHaveBeenCalled();
  });

  it('does not count redrafting the outline of a unit already drafted', async () => {
    const t = await verifiedStandaloneTeacher();
    await useUp(t.schoolId, t.userId);
    const { insertedId } = await Course.collection.insertOne({
      schoolId: t.schoolId, kind: 'class_unit', slug: `redraft-${id()}`, title: 'Fractions', aiGenerated: true, isDeleted: false,
    });
    const ai = vi.spyOn(ClassUnitService, 'draftOutline').mockResolvedValue({ _id: insertedId } as never);

    const res = await request(app).post(`/api/courses/${String(insertedId)}/outline`).set('Authorization', `Bearer ${t.token}`).send({});

    expect(res.status).toBe(200);
    expect(ai).toHaveBeenCalledTimes(1);
    expect(await AIUsage.countDocuments({ schoolId: t.schoolId })).toBe(FREE_AI_ACTIONS_PER_MONTH);
  });

  it('counts batch marking once per script marked', async () => {
    const t = await verifiedStandaloneTeacher();
    vi.mocked(confirmBatch).mockResolvedValue({ spawned: 3, failed: 1 });
    const assignment = { imageFilenames: ['p1.jpg'], studentId: id(), studentName: 'Sipho' };

    const res = await request(app).post(`/api/ai-tools/batches/${id()}/confirm`).set('Authorization', `Bearer ${t.token}`)
      .send({ assignments: [assignment, assignment, assignment, assignment] });

    expect(res.status).toBe(200);
    const rows = await AIUsage.find({ schoolId: t.schoolId }).lean();
    expect(rows.map((r) => r.action)).toEqual(['marking', 'marking', 'marking']);
  });

  it('never limits or counts a school teacher', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    schools.push(schoolId);
    await useUp(schoolId, userId);
    const ai = vi.spyOn(PaperGenerationService, 'generatePaper').mockResolvedValue({ _id: id() } as never);
    const token = signTestToken({ id: userId, schoolId, role: 'teacher', isStandaloneTeacher: false, isSchoolPrincipal: false });

    const res = await request(app).post('/api/question-bank/papers/generate').set('Authorization', `Bearer ${token}`).send(paperBody);

    expect(res.status).toBe(201);
    expect(ai).toHaveBeenCalledTimes(1);
    expect(await AIUsage.countDocuments({ schoolId })).toBe(FREE_AI_ACTIONS_PER_MONTH);
  });

  it("never counts a learner's homework that the AI marks", async () => {
    const t = await verifiedStandaloneTeacher();
    const ai = vi.spyOn(AIService, 'generateJSON').mockResolvedValue({ awarded: 2, rationale: 'Correct' });
    const questionId = new mongoose.Types.ObjectId();
    await Question.collection.insertOne({
      _id: questionId, schoolId: t.schoolId, type: 'short_answer', stem: 'What is 1/2 + 1/4?', answer: '3/4', marks: 2, isDeleted: false,
    });
    const { insertedId: homeworkId } = await Homework.collection.insertOne({
      schoolId: t.schoolId, teacherId: t.userId, title: 'Fractions', totalMarks: 2, isDeleted: false,
    });
    const { insertedId: submissionId } = await HomeworkSubmission.collection.insertOne({
      schoolId: t.schoolId, homeworkId, studentId: new mongoose.Types.ObjectId(), type: 'exercise', homeworkVersion: 1,
      submittedAt: new Date(), gradingGeneration: 1, maxMarks: 2, gradingStatus: 'pending', isDeleted: false,
      answers: [{ questionId, studentAnswer: '3/4', questionSnapshot: '', maxMarks: 2, gradingMethod: 'pending' }],
    });

    await gradeSubmissionAsync(String(submissionId));

    expect(ai).toHaveBeenCalled();
    expect(await AIUsage.countDocuments({ schoolId: t.schoolId })).toBe(0);
  });
});
