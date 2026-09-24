import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../QuestionBank/service-questions-generation.js', () => ({ generateAIQuestions: vi.fn() }));

import { generateAIQuestions } from '../../QuestionBank/service-questions-generation.js';
import { GenerationService } from '../../ContentLibrary/service-generation.js';
import { AIService } from '../../../services/ai.service.js';
import { AppError } from '../../../common/errors.js';
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
  const notes = await ContentResource.collection.insertOne({
    schoolId, createdBy: teacherId, title: 'Tens', type: 'study_notes', isDeleted: false, tags: ['class_unit'],
    blocks: [{ blockId: 'b1', type: 'text', order: 0, content: 'Ten, twenty.' }, { blockId: 'qz', type: 'quiz', order: 1, content: 'What comes after 20?', points: 1 }],
  });
  const worked = await ContentResource.collection.insertOne({
    schoolId, createdBy: teacherId, title: 'On', type: 'worked_example', isDeleted: false, tags: ['class_unit'],
    blocks: [
      { blockId: 'p', type: 'text', order: 0, content: 'A taxi has 47 passengers.' },
      { blockId: 'w1', type: 'step_reveal', order: 1, content: JSON.stringify({ steps: [{ title: 'Start', content: '47' }] }) },
      { blockId: 'fb', type: 'fill_blank', order: 2, content: '47 + 3 = ___' },
    ],
  });
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
    const saved = await ContentResource.findById(f.notesId).lean();
    expect(saved?.blocks[0].content).toBe('Count in tens: 10, 20, 30.');
    // The practice question the editor doesn't show is still there.
    expect(saved?.blocks.map((b) => b.type)).toEqual(['text', 'quiz']);
    expect((await CourseLesson.findById(f.n1._id).lean())?.teacherEdited).toBe(true);
  });

  it('saves edited worked-example steps', async () => {
    const f = await unit('published');
    await UnitItemsService.saveContent(f.courseId, String(f.w1._id), f.schoolId, f.actor, { steps: [{ title: 'Start at 47', content: 'Say 47.' }, { title: 'Count on', content: '48, 49, 50.' }] });
    const saved = await ContentResource.findById(f.workedId).lean();
    expect(saved!.blocks.map((b) => b.type)).toEqual(['text', 'step_reveal', 'fill_blank']);
    expect(JSON.parse(saved!.blocks[1].content).steps).toHaveLength(2);
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
    const ai = vi.spyOn(AIService, 'generateCompletion').mockResolvedValue(JSON.stringify([{ blockId: 'b1', type: 'text', order: 0, content: 'Ten. Twenty.' }]));
    await UnitItemsService.rewrite(f.courseId, String(f.n1._id), f.schoolId, f.actor, { action: 'easier' });
    expect(ai.mock.calls[0][1]).toContain('easier for Grade 1');
    expect((await ContentResource.findById(f.notesId).lean())?.blocks.map((b) => b.content)).toEqual(['Ten. Twenty.']);
    expect((await CourseLesson.findById(f.n1._id).lean())?.teacherEdited).toBe(true);
  });

  it('leaves the item as it was when the AI fails', async () => {
    const f = await unit();
    vi.spyOn(AIService, 'generateCompletion').mockRejectedValue(new AppError("AI isn't set up on this server yet.", 503));
    await expect(UnitItemsService.rewrite(f.courseId, String(f.n1._id), f.schoolId, f.actor, { action: 'shorter' })).rejects.toThrow("AI isn't set up");
    expect((await CourseLesson.findById(f.n1._id).lean())?.teacherEdited).toBe(false);
  });

  it('refuses a garbled AI reply and leaves the notes as they were', async () => {
    const f = await unit('published');
    vi.spyOn(AIService, 'generateCompletion').mockResolvedValue('[{"blockId":"b1","type":"text","content":"Ten, tw');
    await expect(UnitItemsService.rewrite(f.courseId, String(f.n1._id), f.schoolId, f.actor, { action: 'translate', language: 'zu' }))
      .rejects.toThrow("The AI's version came back incomplete");
    expect((await ContentResource.findById(f.notesId).lean())?.blocks.map((b) => b.content)).toEqual(['Ten, twenty.', 'What comes after 20?']);
    expect((await CourseLesson.findById(f.n1._id).lean())?.teacherEdited).toBe(false);
  });

  it('says plainly when the AI cannot rewrite a quick check, and changes nothing', async () => {
    const f = await unit();
    vi.spyOn(AIService, 'assertConfigured').mockImplementation(() => undefined);
    vi.mocked(generateAIQuestions).mockRejectedValue(new Error('AI question generation failed after 2 attempts: boom'));
    const err = await UnitItemsService.rewrite(f.courseId, String(f.check._id), f.schoolId, f.actor, { action: 'easier' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({ statusCode: 503, message: "The AI couldn't rewrite this just now, so nothing changed. Try again in a moment." });
    expect((await CourseLesson.findById(f.check._id).lean())?.quizQuestionIds.map(String)).toEqual(f.questionIds.map(String));
  });

  it('says AI is not set up before trying to rewrite a quick check', async () => {
    const f = await unit();
    vi.spyOn(AIService, 'assertConfigured').mockImplementation(() => { throw new AppError("AI isn't set up on this server yet.", 503); });
    await expect(UnitItemsService.rewrite(f.courseId, String(f.check._id), f.schoolId, f.actor, { action: 'easier' })).rejects.toThrow("AI isn't set up");
    expect(generateAIQuestions).not.toHaveBeenCalled();
  });

  it('rewrites a quick check with new answerable questions', async () => {
    const f = await unit();
    const fresh = await mcqs(f.soid, 2);
    vi.spyOn(AIService, 'assertConfigured').mockImplementation(() => undefined);
    vi.mocked(generateAIQuestions).mockResolvedValue(fresh);
    await UnitItemsService.rewrite(f.courseId, String(f.check._id), f.schoolId, f.actor, { action: 'harder' });
    expect(vi.mocked(generateAIQuestions).mock.calls[0][0]).toMatchObject({ difficulty: 'hard', questionTypes: ['mcq'], count: 2 });
    // The AI works from the teacher's current questions, not from a blank page.
    expect(vi.mocked(generateAIQuestions).mock.calls[0][0].topicHint).toContain('1. Q1 Choices: right (right), wrong');
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

describe('3B review fixes', () => {
  it("won't rewrite or overwrite content that isn't the unit's own", async () => {
    const f = await unit();
    // A colleague's library resource, attached through the course builder (no item kind).
    const theirs = await ContentResource.collection.insertOne({ schoolId: f.soid, createdBy: oid(), title: 'Theirs', type: 'study_notes', isDeleted: false, blocks: [{ blockId: 'x', type: 'text', order: 0, content: 'Mine.' }] });
    const borrowed = await CourseLesson.create({ schoolId: f.soid, courseId: f.courseId, moduleId: f.n1.moduleId, orderIndex: 9, title: 'Borrowed', type: 'content', contentResourceId: theirs.insertedId });
    const ai = vi.spyOn(AIService, 'generateCompletion').mockResolvedValue('[]');
    await expect(UnitItemsService.rewrite(f.courseId, String(borrowed._id), f.schoolId, f.actor, { action: 'translate', language: 'zu' })).rejects.toThrow('Only items the course builder wrote can be edited here');
    await expect(UnitItemsService.saveContent(f.courseId, String(borrowed._id), f.schoolId, f.actor, { blocks: [{ blockId: 'x', type: 'text', content: 'Gone.' }] })).rejects.toThrow('Only items the course builder wrote can be edited here');
    // Even labelled as a unit item, a resource that isn't the unit's own is left alone.
    await CourseLesson.updateOne({ _id: borrowed._id }, { $set: { itemKind: 'notes', genStatus: 'ready' } });
    await expect(UnitItemsService.saveContent(f.courseId, String(borrowed._id), f.schoolId, f.actor, { blocks: [{ blockId: 'x', type: 'text', content: 'Gone.' }] })).rejects.toThrow("This item's content was not found");
    expect(ai).not.toHaveBeenCalled();
    expect((await ContentResource.findById(theirs.insertedId).lean())?.blocks[0].content).toBe('Mine.');
  });

  it('keeps unchanged questions when a check is saved, so what the class got wrong stays on record', async () => {
    const f = await unit();
    const [q1, q2] = f.questionIds.map(String);
    await UnitItemsService.saveQuestions(f.courseId, String(f.check._id), f.schoolId, f.actor, {
      questions: [{ id: q1, ...q('Q1', 'right', 'wrong') }, { id: q2, ...q('Q2 fixed', 'right', 'wrong') }],
    });
    const ids = (await CourseLesson.findById(f.check._id).lean())!.quizQuestionIds.map(String);
    expect(ids[0]).toBe(q1);
    expect(ids[1]).not.toBe(q2);
    expect((await Question.findById(q1).lean())?.isDeleted).toBe(false);
    expect((await Question.findById(q2).lean())?.isDeleted).toBe(true);
  });

  it('makes a revision item optional, so it never locks what comes after it', async () => {
    const f = await unit('published');
    vi.spyOn(GenerationService, 'generateContent').mockResolvedValue({ _id: oid() } as never);
    const rev = await UnitItemsService.addRevisionItem(f.courseId, f.schoolId, f.actor, { afterLessonId: String(f.check._id), questionIds: f.questionIds.map(String) });
    expect(rev.optional).toBe(true);
    const lessons = await CourseLesson.find({ courseId: f.courseId, isDeleted: false }).sort({ orderIndex: 1 }).lean();
    const done = new Map([f.n1, f.w1, f.check].map((l) => [String(l._id), { status: 'completed' }])) as never;
    expect([...computeUnlockStatuses(lessons, done, { sequential: true }).values()]).toEqual(['completed', 'completed', 'completed', 'available', 'available']);
  });
});
