import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { migrateLearningQuizzes } from '../service-quiz-migration.js';
import { Quiz } from '../model.js';
import { Homework } from '../../Homework/model.js';
import { HomeworkTemplate } from '../../Homework/model-template.js';
import { Lesson } from '../../Lesson/model.js';
import { Question } from '../../QuestionBank/model.js';
import { Class, Grade, Subject } from '../../Academic/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { CurriculumFramework } from '../../TeacherWorkbench/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
afterEach(() => vi.restoreAllMocks());

async function capsFramework(): Promise<mongoose.Types.ObjectId> {
  const existing = await CurriculumFramework.collection.findOne({ name: 'CAPS' });
  if (existing) return existing._id as mongoose.Types.ObjectId;
  const created = await CurriculumFramework.collection.insertOne({ name: 'CAPS', isDeleted: false });
  return created.insertedId;
}

/** A school with a Grade 7 Maths quiz, a homework and a template set from it, and (optionally) a lesson that uses it. */
async function school(opts: { withCaps?: boolean; withLesson?: boolean; title?: string } = {}) {
  const schoolId = oid();
  const teacherId = oid();
  const tag = String(oid()).slice(-6);
  const [subjectId, gradeId, classId] = [oid(), oid(), oid()];
  await Subject.collection.insertOne({ _id: subjectId, schoolId, name: `Maths ${tag}`, code: `M${tag}`, isDeleted: false });
  await Grade.collection.insertOne({ _id: gradeId, schoolId, name: `Grade 7 ${tag}`, level: 7, isDeleted: false });
  await Class.collection.insertOne({ _id: classId, schoolId, name: '7A', classroomCode: `c-${oid()}`, gradeId, isDeleted: false });
  let fractionsId: mongoose.Types.ObjectId | null = null;
  if (opts.withCaps !== false) {
    const frameworkId = await capsFramework();
    const [ns, ng, whole] = [oid(), oid(), oid()];
    fractionsId = oid();
    await CurriculumNode.collection.insertMany([
      { _id: ns, frameworkId, type: 'subject', title: `Maths ${tag}`, code: `S${tag}`, order: 0, subjectId: ns, schoolId: null, isDeleted: false },
      { _id: ng, frameworkId, type: 'grade', title: `Grade 7 ${tag}`, code: `G${tag}`, order: 0, gradeId: ng, schoolId: null, isDeleted: false },
      // Inserted first, so an arbitrary pick would land here.
      { _id: whole, frameworkId, type: 'topic', title: 'Whole numbers', code: `W${tag}`, order: 0, termNumber: 1, subjectId: ns, gradeId: ng, schoolId: null, isDeleted: false },
      { _id: fractionsId, frameworkId, type: 'topic', title: 'Common fractions', code: `F${tag}`, order: 1, termNumber: 2, subjectId: ns, gradeId: ng, schoolId: null, isDeleted: false },
    ]);
  }
  const quiz = await Quiz.create({
    schoolId, teacherId, subjectId, classId, title: opts.title ?? 'Fractions', type: 'mixed', totalPoints: 3, status: 'published',
    questions: [
      { questionText: 'Half of 10?', questionType: 'mcq', options: [{ text: '2', isCorrect: false }, { text: '5', isCorrect: true }], correctAnswer: '5', points: 2 },
      { questionText: 'Match them', questionType: 'matching', options: [], correctAnswer: 'a-1', points: 1 },
    ],
  });
  const hw = await Homework.collection.insertOne({ title: 'Fractions quiz', type: 'quiz', quizId: quiz._id, exerciseQuestionIds: [], totalMarks: 3, version: 1, subjectId, classId, schoolId, teacherId, isDeleted: false });
  const tpl = await HomeworkTemplate.collection.insertOne({ schoolId, teacherId, title: 'Fractions', type: 'quiz', quizId: quiz._id, exerciseQuestionIds: [], isDeleted: false });
  const lesson = opts.withLesson === false ? null : await Lesson.collection.insertOne({
    schoolId, teacherId, title: 'Fractions lesson', isDeleted: false,
    materials: [{ _id: oid(), kind: 'reading', title: 'Read' }, { _id: oid(), kind: 'quiz', title: 'Quick quiz', quizId: quiz._id }],
  });
  return { schoolId: String(schoolId), quizId: quiz._id, hwId: hw.insertedId, tplId: tpl.insertedId, lessonId: lesson?.insertedId ?? null, fractionsId };
}

describe('migrateLearningQuizzes', () => {
  it('a dry run reports the plan and changes nothing', async () => {
    const f = await school();
    const report = await migrateLearningQuizzes({ apply: false, schoolId: f.schoolId });
    expect(report.lines).toHaveLength(1);
    expect(report.lines[0]).toContain('Fractions');
    expect(report.lines[0]).toContain('CAPS topic "Common fractions"');
    expect(report.lines[0]).toContain('1 question (1 left out), 1 homework, 1 homework template');
    expect(report.lines[0]).toContain('1 lesson still uses the old quiz');
    expect(report.applied).toBe(false);
    expect(await Homework.findById(f.hwId).lean()).toMatchObject({ type: 'quiz' });
    expect(await Question.countDocuments({ schoolId: f.schoolId })).toBe(0);
  });

  it('moves the questions to the matching topic, and the homework and template onto them, once', async () => {
    const f = await school();
    const report = await migrateLearningQuizzes({ apply: true, schoolId: f.schoolId });
    expect(report).toMatchObject({ applied: true, moved: 1, skipped: [] });

    const questions = await Question.find({ schoolId: f.schoolId }).lean();
    expect(questions.map((q) => [q.stem, q.type, String(q.curriculumNodeId)])).toEqual([['Half of 10?', 'mcq', String(f.fractionsId)]]);
    const ids = questions.map((q) => String(q._id));

    const hw = await Homework.findById(f.hwId).lean();
    expect(hw).toMatchObject({ type: 'exercise', totalMarks: 2 });
    expect(hw!.exerciseQuestionIds.map(String)).toEqual(ids);
    // The quiz stays linked, so old quiz submissions still regrade against it.
    expect(String(hw!.quizId)).toBe(String(f.quizId));
    expect(await HomeworkTemplate.findById(f.tplId).lean()).toMatchObject({ type: 'exercise', quizId: null });

    // Lessons keep the old quiz until lesson practice questions show for learners; so the quiz stays open.
    const lesson = await Lesson.collection.findOne({ _id: f.lessonId! });
    expect((lesson!.materials as Array<Record<string, unknown>>)[1]).toMatchObject({ kind: 'quiz' });
    expect(await Quiz.findById(f.quizId).lean()).toMatchObject({ status: 'published' });

    const again = await migrateLearningQuizzes({ apply: true, schoolId: f.schoolId });
    expect(again).toMatchObject({ moved: 0, lines: [] });
    expect(await Question.countDocuments({ schoolId: f.schoolId })).toBe(1);
  });

  it('closes a quiz once nothing uses it any more', async () => {
    const f = await school({ withLesson: false });
    await migrateLearningQuizzes({ apply: true, schoolId: f.schoolId });
    expect(await Quiz.findById(f.quizId).lean()).toMatchObject({ status: 'closed' });
  });

  it('leaves a quiz with no CAPS topic alone, and says why', async () => {
    const f = await school({ withCaps: false });
    const report = await migrateLearningQuizzes({ apply: true, schoolId: f.schoolId });
    expect(report.moved).toBe(0);
    expect(report.skipped).toEqual([expect.objectContaining({ quiz: 'Fractions', reason: 'No CAPS topic matches its subject and grade.' })]);
    expect(await Homework.findById(f.hwId).lean()).toMatchObject({ type: 'quiz' });
  });

  it('a quiz that fails part-way is reported, the rest still move, and a re-run finishes it without duplicating questions', async () => {
    const f = await school();
    const other = await Quiz.create({
      schoolId: new mongoose.Types.ObjectId(f.schoolId), teacherId: oid(), subjectId: (await Quiz.findById(f.quizId).lean())!.subjectId,
      classId: (await Quiz.findById(f.quizId).lean())!.classId, title: 'Decimals', type: 'mcq', totalPoints: 1, status: 'published',
      questions: [{ questionText: '0.5 as a fraction?', questionType: 'mcq', options: [{ text: '1/2', isCorrect: true }, { text: '1/5', isCorrect: false }], correctAnswer: '1/2', points: 1 }],
    });
    const failOnce = vi.spyOn(HomeworkTemplate, 'updateMany').mockRejectedValueOnce(new Error('network'));

    const first = await migrateLearningQuizzes({ apply: true, schoolId: f.schoolId });
    expect(first.moved).toBe(1);
    expect(first.skipped).toEqual([expect.objectContaining({ quiz: 'Fractions', reason: 'Failed part-way (network). Run again to finish it.' })]);
    expect((await Quiz.findById(other._id).lean())?.migratedAt).toBeTruthy();
    failOnce.mockRestore();

    const second = await migrateLearningQuizzes({ apply: true, schoolId: f.schoolId });
    expect(second.moved).toBe(1);
    expect(await Question.countDocuments({ schoolId: f.schoolId, stem: 'Half of 10?' })).toBe(1);
    expect(await HomeworkTemplate.findById(f.tplId).lean()).toMatchObject({ type: 'exercise' });
  });
});
