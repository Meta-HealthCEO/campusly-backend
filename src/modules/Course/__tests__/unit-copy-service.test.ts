import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { UnitCopyService } from '../service-unit-copy.js';
import { UnitItemsService } from '../service-unit-items.js';
import { Course, CourseLesson, CourseModule, Enrolment } from '../model.js';
import { Class, Grade, Subject } from '../../Academic/model.js';
import { ContentResource } from '../../ContentLibrary/model.js';
import { Question } from '../../QuestionBank/model.js';
import { User } from '../../Auth/model.js';
import { QuestionsService } from '../../QuestionBank/service-questions.js';
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

const teacher = (userId: mongoose.Types.ObjectId): CourseActor => ({ userId: String(userId), role: 'teacher' as CourseActor['role'], isHOD: false, isSchoolPrincipal: false });

/** A school with Lindiwe's released Grade 1 unit, and Thandi, who teaches Grade 1 - B and Grade 2 - A. */
async function school(opts: { status?: 'draft' | 'published'; writing?: boolean } = {}) {
  const schoolId = oid();
  const [lindiwe, thandi] = [oid(), oid()];
  const [g1, g2] = [oid(), oid()];
  const subjectId = oid();
  const nodeId = oid();
  await Grade.collection.insertMany([
    { _id: g1, schoolId, name: 'Grade 1', level: 1, isDeleted: false },
    { _id: g2, schoolId, name: 'Grade 2', level: 2, isDeleted: false },
  ]);
  await Subject.collection.insertOne({ _id: subjectId, schoolId, name: 'Mathematics', code: `M${oid()}`, isDeleted: false });
  await User.collection.insertMany([
    { _id: lindiwe, schoolId, firstName: 'Lindiwe', lastName: 'Dube', email: `l${oid()}@t.local`, role: 'teacher', isDeleted: false },
    { _id: thandi, schoolId, firstName: 'Thandi', lastName: 'Molefe', email: `t${oid()}@t.local`, role: 'teacher', isDeleted: false },
  ]);
  const [classA, classB, class2] = [oid(), oid(), oid()];
  await Class.collection.insertMany([
    { _id: classA, schoolId, name: 'Grade 1 - A', classroomCode: `c-${oid()}`, gradeId: g1, teacherId: lindiwe, isDeleted: false },
    { _id: classB, schoolId, name: 'Grade 1 - B', classroomCode: `c-${oid()}`, gradeId: g1, teacherId: thandi, isDeleted: false },
    { _id: class2, schoolId, name: 'Grade 2 - A', classroomCode: `c-${oid()}`, gradeId: g2, teacherId: thandi, isDeleted: false },
  ]);
  const status = opts.status ?? 'published';
  const unit = await Course.create({
    schoolId, title: 'Numbers to 99 · Grade 1 Mathematics · Term 3', slug: `u-${oid()}`, createdBy: lindiwe, status, kind: 'class_unit',
    outlineStatus: 'approved', aiGenerated: true, sequential: false, publishedAt: status === 'published' ? new Date('2026-09-20T08:00:00Z') : null,
    scope: { gradeId: g1, subjectId, termNumber: 3, topicNodeIds: [nodeId], classIds: [classA] },
    generation: { status: opts.writing ? 'running' : 'done', total: 3, done: 2, failed: 1 },
  });
  const mod = await CourseModule.create({ schoolId, courseId: unit._id, title: 'Counting to 99', orderIndex: 0, curriculumNodeId: nodeId, objectives: ['I can count in tens'] });
  const notes = await ContentResource.collection.insertOne({
    schoolId, createdBy: lindiwe, title: 'Tens', type: 'study_notes', isDeleted: false, tags: ['class_unit'],
    blocks: [{ blockId: 'b1', type: 'text', order: 0, content: 'Ten, twenty.' }, { blockId: 'q', type: 'quiz', order: 1, content: 'After 20?' }],
  });
  const q = await Question.collection.insertOne({
    schoolId, type: 'mcq', stem: 'What comes after 29?', status: 'approved', isDeleted: false, tags: ['class_unit'], curriculumNodeId: nodeId,
    options: [{ label: 'A', text: '30', isCorrect: true }, { label: 'B', text: '28', isCorrect: false }], answer: '30',
  });
  await CourseLesson.insertMany([
    { schoolId, courseId: unit._id, moduleId: mod._id, orderIndex: 0, title: 'Counting in tens', type: 'content', itemKind: 'notes', genStatus: 'ready', minutes: 6, capsRef: '1.1', teacherEdited: true, contentResourceId: notes.insertedId },
    { schoolId, courseId: unit._id, moduleId: mod._id, orderIndex: 1, title: 'Check: counting', type: 'quiz', itemKind: 'quick_check', genStatus: 'ready', minutes: 5, quizQuestionIds: [q.insertedId], passMarkPercent: 50 },
    { schoolId, courseId: unit._id, moduleId: mod._id, orderIndex: 2, title: 'Counting on', type: 'content', itemKind: 'worked_example', genStatus: opts.writing ? 'generating' : 'failed', genError: 'The AI timed out', minutes: 6 },
  ]);
  await Enrolment.create({ schoolId, courseId: unit._id, studentId: oid(), enrolledBy: lindiwe });
  return { schoolId: String(schoolId), soid: schoolId, g1, unitId: String(unit._id), lindiwe, thandi, classA, classB, class2, notesId: notes.insertedId, questionId: q.insertedId };
}

describe('UnitCopyService.copy', () => {
  it("copies a colleague's released unit to my class for next term, as my own draft ready to release", async () => {
    const f = await school();
    const copy = await UnitCopyService.copy(f.unitId, f.schoolId, teacher(f.thandi), { classId: String(f.classB), termNumber: 4 });

    expect(copy).toMatchObject({ title: 'Numbers to 99 · Grade 1 Mathematics · Term 4', status: 'draft', kind: 'class_unit', outlineStatus: 'approved', aiGenerated: false, sequential: false });
    expect(String(copy.createdBy)).toBe(String(f.thandi));
    expect(String(copy.copiedFrom)).toBe(f.unitId);
    expect(copy.scope).toMatchObject({ termNumber: 4 });
    // Not released yet — only /release adds a class to `classIds`. The copy
    // target is tracked separately, just to pre-tick the release dialog.
    expect(copy.scope!.classIds).toEqual([]);
    expect(String(copy.scope!.builtForClassId)).toBe(String(f.classB));

    const lessons = await CourseLesson.find({ courseId: copy._id, isDeleted: false }).sort({ orderIndex: 1 }).lean();
    expect(lessons.map((l) => [l.title, l.itemKind, l.genStatus, l.minutes])).toEqual([
      ['Counting in tens', 'notes', 'ready', 6], ['Check: counting', 'quick_check', 'ready', 5], ['Counting on', 'worked_example', 'failed', 6],
    ]);
    // The source author's "Edited by you" doesn't carry over to the copier.
    expect(lessons[0].teacherEdited).toBe(false);
    const modules = await CourseModule.find({ courseId: copy._id, isDeleted: false }).lean();
    expect(modules.map((m) => [m.title, m.objectives])).toEqual([['Counting to 99', ['I can count in tens']]]);
    // Nothing learner-side comes along.
    expect(await Enrolment.countDocuments({ courseId: copy._id })).toBe(0);
  });

  it('makes an independent copy: editing it leaves the original and its learners alone', async () => {
    const f = await school();
    const copy = await UnitCopyService.copy(f.unitId, f.schoolId, teacher(f.thandi), { classId: String(f.classB), termNumber: 3 });
    const [notes, check] = await CourseLesson.find({ courseId: copy._id }).sort({ orderIndex: 1 }).lean();
    expect(String(notes.contentResourceId)).not.toBe(String(f.notesId));
    expect(String(check.quizQuestionIds[0])).not.toBe(String(f.questionId));

    await UnitItemsService.saveContent(String(copy._id), String(notes._id), f.schoolId, teacher(f.thandi), { blocks: [{ blockId: 'b1', type: 'text', content: 'Count in tens.' }] });
    await UnitItemsService.saveQuestions(String(copy._id), String(check._id), f.schoolId, teacher(f.thandi), { questions: [{ stem: 'After 39?', options: [{ text: '40', isCorrect: true }, { text: '38', isCorrect: false }] }] });

    expect((await ContentResource.findById(f.notesId).lean())?.blocks.map((b) => b.content)).toEqual(['Ten, twenty.', 'After 20?']);
    expect(await Question.findById(f.questionId).lean()).toMatchObject({ stem: 'What comes after 29?', isDeleted: false });
  });

  it('refuses a class of another grade, and a class I do not teach, creating nothing', async () => {
    const f = await school();
    const before = await Course.countDocuments({ schoolId: f.soid });
    await expect(UnitCopyService.copy(f.unitId, f.schoolId, teacher(f.thandi), { classId: String(f.class2), termNumber: 3 }))
      .rejects.toThrow('This unit is for Grade 1. Pick a Grade 1 class.');
    await expect(UnitCopyService.copy(f.unitId, f.schoolId, teacher(f.thandi), { classId: String(f.classA), termNumber: 3 }))
      .rejects.toThrow('You can only build units for classes you teach');
    expect(await Course.countDocuments({ schoolId: f.soid })).toBe(before);
  });

  it("refuses someone else's unreleased unit, and a unit still being written", async () => {
    const draft = await school({ status: 'draft' });
    await expect(UnitCopyService.copy(draft.unitId, draft.schoolId, teacher(draft.thandi), { classId: String(draft.classB), termNumber: 3 }))
      .rejects.toThrow('Only released units can be copied.');
    const writing = await school({ writing: true });
    await expect(UnitCopyService.copy(writing.unitId, writing.schoolId, teacher(writing.lindiwe), { classId: String(writing.classA), termNumber: 4 }))
      .rejects.toThrow('Wait until the items are written, then copy the unit.');
  });
});

describe('UnitCopyService.library', () => {
  it("lists the school's released units, newest first, with who made them", async () => {
    const f = await school();
    await Course.create({ schoolId: f.soid, title: 'A draft', slug: `d-${oid()}`, createdBy: f.thandi, status: 'draft', kind: 'class_unit' });
    await Course.create({ schoolId: f.soid, title: 'A catalogue course', slug: `c-${oid()}`, createdBy: f.thandi, status: 'published', kind: 'catalogue' });
    const entries = await UnitCopyService.library(f.schoolId, teacher(f.thandi), {});
    expect(entries).toEqual([{
      id: f.unitId, title: 'Numbers to 99 · Grade 1 Mathematics · Term 3', gradeId: String(f.g1), gradeName: 'Grade 1', subjectName: 'Mathematics', termNumber: 3,
      authorName: 'Lindiwe Dube', items: 3, minutes: 17, releasedAt: '2026-09-20T08:00:00.000Z', mine: false,
    }]);
    expect(await UnitCopyService.library(String(oid()), teacher(f.thandi), {})).toEqual([]);
  });

  it('pages the library instead of always returning everything', async () => {
    const f = await school();
    // f.unitId is already one published unit; add 20 more so there are 21 total.
    await Course.insertMany(Array.from({ length: 20 }, (_, i) => ({
      schoolId: f.soid, title: `Extra ${i}`, slug: `extra-${i}-${oid()}`, createdBy: f.thandi, status: 'published', kind: 'class_unit',
      publishedAt: new Date(Date.now() - i * 1000), isDeleted: false,
    })));
    const page1 = await UnitCopyService.library(f.schoolId, teacher(f.thandi), { page: 1 });
    const page2 = await UnitCopyService.library(f.schoolId, teacher(f.thandi), { page: 2 });
    expect(page1).toHaveLength(20);
    expect(page2).toHaveLength(1);
    expect(new Set([...page1, ...page2].map((e) => e.id)).size).toBe(21);
  });
});

describe('3E review fixes', () => {
  it("a copy's questions stay out of the school's shared question bank, so copying doesn't fill it with duplicates", async () => {
    const f = await school();
    const copy = await UnitCopyService.copy(f.unitId, f.schoolId, teacher(f.thandi), { classId: String(f.classB), termNumber: 3 });
    const check = await CourseLesson.findOne({ courseId: copy._id, itemKind: 'quick_check' }).lean();
    const clone = await Question.findById(check!.quizQuestionIds[0]).lean();
    expect(clone?.tags).toContain('unit_copy');

    const shared = await QuestionsService.listQuestions(f.schoolId, String(f.lindiwe), 'teacher', { page: 1, limit: 50 } as never);
    expect(shared.questions.map((q) => q.stem)).toEqual(['What comes after 29?']);
    const mine = await QuestionsService.listQuestions(f.schoolId, String(f.thandi), 'teacher', { mine: true, page: 1, limit: 50 } as never);
    expect(mine.questions.map((q) => String(q._id))).toContain(String(clone!._id));
  });
});
