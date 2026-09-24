import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../QuestionBank/service-questions-generation.js', () => ({ generateAIQuestions: vi.fn() }));

import { generateAIQuestions } from '../../QuestionBank/service-questions-generation.js';
import { GenerationService } from '../../ContentLibrary/service-generation.js';
import { UnitItemsService } from '../service-unit-items.js';
import { computeUnlockStatuses } from '../service-student.js';
import { Course, CourseLesson, CourseModule } from '../model.js';
import { ContentResource } from '../../ContentLibrary/model.js';
import { Question } from '../../QuestionBank/model.js';
import { Grade } from '../../Academic/model.js';
import type { CourseActor } from '../service.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(generateAIQuestions).mockReset();
});

async function mcqs(schoolId: mongoose.Types.ObjectId, n: number) {
  const docs = Array.from({ length: n }, (_, i) => ({
    _id: oid(), schoolId, type: 'mcq', stem: `Q${i + 1}`, isDeleted: false, tags: ['class_unit'],
    options: [{ label: 'A', text: 'right', isCorrect: true }, { label: 'B', text: 'wrong', isCorrect: false }],
  }));
  await Question.collection.insertMany(docs);
  return docs.map((d) => d._id);
}

/** A unit: notes → worked example → check → notes. */
async function unit(status: 'draft' | 'published' = 'draft') {
  const schoolId = oid();
  const teacherId = oid();
  const gradeId = oid();
  const nodeId = oid();
  await Grade.collection.insertOne({ _id: gradeId, schoolId, name: 'Grade 1', level: 1, isDeleted: false });
  const course = await Course.create({
    schoolId, title: 'Numbers to 99', slug: `u-${oid()}`, createdBy: teacherId, status, kind: 'class_unit', outlineStatus: 'approved',
    scope: { gradeId, subjectId: oid(), termNumber: 3, topicNodeIds: [nodeId], classIds: [oid()] },
  });
  const mod = await CourseModule.create({ schoolId, courseId: course._id, title: 'Counting', orderIndex: 0, curriculumNodeId: nodeId });
  const notes = await ContentResource.collection.insertOne({ schoolId, createdBy: teacherId, title: 'Tens', type: 'study_notes', isDeleted: false, blocks: [{ blockId: 'b1', type: 'text', order: 0, content: 'Ten, twenty.' }] });
  const worked = await ContentResource.collection.insertOne({ schoolId, createdBy: teacherId, title: 'On', type: 'worked_example', isDeleted: false, blocks: [{ blockId: 'w1', type: 'step_reveal', order: 0, content: JSON.stringify({ steps: [{ title: 'Start', content: '47' }] }) }] });
  const questionIds = await mcqs(schoolId, 2);
  const [n1, w1, check, n2] = await CourseLesson.insertMany([
    { schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 0, title: 'Counting in tens', type: 'content', itemKind: 'notes', genStatus: 'ready', contentResourceId: notes.insertedId },
    { schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 1, title: 'Counting on', type: 'content', itemKind: 'worked_example', genStatus: 'ready', contentResourceId: worked.insertedId },
    { schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 2, title: 'Check: counting', type: 'quiz', itemKind: 'quick_check', genStatus: 'ready', quizQuestionIds: questionIds, passMarkPercent: 50 },
    { schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 3, title: 'More counting', type: 'content', itemKind: 'notes', genStatus: 'ready', contentResourceId: notes.insertedId },
  ]);
  const actor: CourseActor = { userId: String(teacherId), role: 'teacher' as CourseActor['role'], isHOD: false, isSchoolPrincipal: false };
  return { schoolId: String(schoolId), soid: schoolId, courseId: String(course._id), actor, n1, w1, check, n2, questionIds, notesId: notes.insertedId, workedId: worked.insertedId };
}

const q = (stem: string, right: string, wrong: string) => ({ stem, options: [{ text: right, isCorrect: true }, { text: wrong, isCorrect: false }] });

describe('UnitItemsService.saveContent', () => {
  it('saves edited notes and marks the item as the teacher\'s own', async () => {
    const f = await unit();
    await UnitItemsService.saveContent(f.courseId, String(f.n1._id), f.schoolId, f.actor, { blocks: [{ blockId: 'b1', type: 'text', content: 'Count in tens: 10, 20, 30.' }] });
    expect((await ContentResource.findById(f.notesId).lean())?.blocks[0].content).toBe('Count in tens: 10, 20, 30.');
    expect((await CourseLesson.findById(f.n1._id).lean())?.teacherEdited).toBe(true);
  });

  it('saves edited worked-example steps', async () => {
    const f = await unit('published');
    await UnitItemsService.saveContent(f.courseId, String(f.w1._id), f.schoolId, f.actor, { steps: [{ title: 'Start at 47', content: 'Say 47.' }, { title: 'Count on', content: '48, 49, 50.' }] });
    const saved = await ContentResource.findById(f.workedId).lean();
    expect(JSON.parse(saved!.blocks[0].content).steps).toHaveLength(2);
  });
});

describe('UnitItemsService.saveQuestions', () => {
  it('swaps in the edited questions and retires the old ones', async () => {
    const f = await unit();
    await UnitItemsService.saveQuestions(f.courseId, String(f.check._id), f.schoolId, f.actor, { questions: [q('What comes after 39?', '40', '30')] });
    const check = await CourseLesson.findById(f.check._id).lean();
    expect(check?.quizQuestionIds).toHaveLength(1);
    expect(check?.teacherEdited).toBe(true);
    const saved = await Question.findById(check!.quizQuestionIds[0]).lean();
    expect(saved).toMatchObject({ type: 'mcq', stem: 'What comes after 39?', answer: '40', options: [{ label: 'A', text: '40', isCorrect: true }, { label: 'B', text: '30', isCorrect: false }] });
    expect(await Question.countDocuments({ _id: { $in: f.questionIds }, isDeleted: true })).toBe(2);
  });

  it('refuses a question with no right answer and changes nothing', async () => {
    const f = await unit();
    await expect(UnitItemsService.saveQuestions(f.courseId, String(f.check._id), f.schoolId, f.actor, {
      questions: [{ stem: 'Q', options: [{ text: 'a', isCorrect: false }, { text: 'b', isCorrect: false }] }],
    })).rejects.toThrow('Question 1 needs exactly one right answer.');
    expect((await CourseLesson.findById(f.check._id).lean())?.quizQuestionIds.map(String)).toEqual(f.questionIds.map(String));
  });
});

describe('UnitItemsService.rewrite', () => {
  it('asks the AI for an easier version and keeps the teacher\'s choice', async () => {
    const f = await unit();
    const refine = vi.spyOn(GenerationService, 'refineContent').mockResolvedValue({} as never);
    await UnitItemsService.rewrite(f.courseId, String(f.n1._id), f.schoolId, f.actor, { action: 'easier' });
    expect(refine.mock.calls[0][3].instruction).toContain('easier for Grade 1');
    expect((await CourseLesson.findById(f.n1._id).lean())?.teacherEdited).toBe(true);
  });

  it('leaves the item as it was when the AI fails', async () => {
    const f = await unit();
    vi.spyOn(GenerationService, 'refineContent').mockRejectedValue(new Error("AI isn't set up on this server yet."));
    await expect(UnitItemsService.rewrite(f.courseId, String(f.n1._id), f.schoolId, f.actor, { action: 'shorter' })).rejects.toThrow("AI isn't set up");
    expect((await CourseLesson.findById(f.n1._id).lean())?.teacherEdited).toBe(false);
  });

  it('rewrites a quick check with new answerable questions', async () => {
    const f = await unit();
    const fresh = await mcqs(f.soid, 2);
    vi.mocked(generateAIQuestions).mockResolvedValue(fresh);
    await UnitItemsService.rewrite(f.courseId, String(f.check._id), f.schoolId, f.actor, { action: 'harder' });
    expect(vi.mocked(generateAIQuestions).mock.calls[0][0]).toMatchObject({ difficulty: 'hard', questionTypes: ['mcq'], count: 2 });
    expect((await CourseLesson.findById(f.check._id).lean())?.quizQuestionIds.map(String)).toEqual(fresh.map(String));
  });
});

describe('in-order setting', () => {
  it('opens every unfinished item when learners needn\'t go in order', async () => {
    const f = await unit('published');
    await UnitItemsService.updateSettings(f.courseId, f.schoolId, f.actor, { sequential: false });
    expect((await Course.findById(f.courseId).lean())?.sequential).toBe(false);
    const lessons = await CourseLesson.find({ courseId: f.courseId }).sort({ orderIndex: 1 }).lean();
    const inOrder = computeUnlockStatuses(lessons, new Map(), { sequential: true });
    const anyOrder = computeUnlockStatuses(lessons, new Map(), { sequential: false });
    expect([...inOrder.values()]).toEqual(['available', 'locked', 'locked', 'locked']);
    expect([...anyOrder.values()]).toEqual(['available', 'available', 'available', 'available']);
  });
});

describe('UnitItemsService.addRevisionItem', () => {
  it('writes a revision item on the missed questions and puts it after the check', async () => {
    const f = await unit('published');
    const gen = vi.spyOn(GenerationService, 'generateContent').mockResolvedValue({ _id: oid() } as never);
    const item = await UnitItemsService.addRevisionItem(f.courseId, f.schoolId, f.actor, { afterLessonId: String(f.check._id), questionIds: f.questionIds.map(String) });
    expect(gen.mock.calls[0][2].instructions).toContain('Q1');
    expect(item).toMatchObject({ title: 'Revision: counting', itemKind: 'notes', genStatus: 'ready', orderIndex: 3 });
    const order = await CourseLesson.find({ courseId: f.courseId, isDeleted: false }).sort({ orderIndex: 1 }).lean();
    expect(order.map((l) => l.title)).toEqual(['Counting in tens', 'Counting on', 'Check: counting', 'Revision: counting', 'More counting']);
  });

  it("won't let another teacher change someone else's unit", async () => {
    const f = await unit();
    const stranger: CourseActor = { ...f.actor, userId: String(oid()) };
    await expect(UnitItemsService.saveContent(f.courseId, String(f.n1._id), f.schoolId, stranger, { blocks: [{ blockId: 'b1', type: 'text', content: 'x' }] }))
      .rejects.toThrow('You can only edit your own courses');
  });
});
