import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { migrateLearningQuizzes } from '../service-quiz-migration.js';
import { Quiz } from '../model.js';
import { Homework } from '../../Homework/model.js';
import { HomeworkTemplate } from '../../Homework/model-template.js';
import { Lesson } from '../../Lesson/model.js';
import { Question } from '../../QuestionBank/model.js';
import { Class, Grade, Subject } from '../../Academic/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

/** A school with a Grade 7 Maths quiz, a homework and a template set from it, and a lesson that uses it. */
async function school(opts: { withCaps?: boolean } = {}) {
  const schoolId = oid();
  const teacherId = oid();
  const tag = String(oid()).slice(-6);
  const [subjectId, gradeId, classId] = [oid(), oid(), oid()];
  await Subject.collection.insertOne({ _id: subjectId, schoolId, name: `Maths ${tag}`, code: `M${tag}`, isDeleted: false });
  await Grade.collection.insertOne({ _id: gradeId, schoolId, name: `Grade 7 ${tag}`, level: 7, isDeleted: false });
  await Class.collection.insertOne({ _id: classId, schoolId, name: '7A', classroomCode: `c-${oid()}`, gradeId, isDeleted: false });
  let topicId: mongoose.Types.ObjectId | null = null;
  if (opts.withCaps !== false) {
    const [ns, ng] = [oid(), oid()];
    topicId = oid();
    const frameworkId = oid();
    await CurriculumNode.collection.insertMany([
      { _id: ns, frameworkId, type: 'subject', title: `Maths ${tag}`, code: `S${tag}`, order: 0, subjectId: ns, schoolId: null, isDeleted: false },
      { _id: ng, frameworkId, type: 'grade', title: `Grade 7 ${tag}`, code: `G${tag}`, order: 0, gradeId: ng, schoolId: null, isDeleted: false },
      { _id: topicId, frameworkId, type: 'topic', title: 'Fractions', code: `T${tag}`, order: 0, subjectId: ns, gradeId: ng, schoolId: null, isDeleted: false },
    ]);
  }
  const quiz = await Quiz.create({
    schoolId, teacherId, subjectId, classId, title: 'Fractions', type: 'mixed', totalPoints: 3, status: 'published',
    questions: [
      { questionText: 'Half of 10?', questionType: 'mcq', options: [{ text: '2', isCorrect: false }, { text: '5', isCorrect: true }], correctAnswer: '5', points: 2 },
      { questionText: 'Match them', questionType: 'matching', options: [], correctAnswer: 'a-1', points: 1 },
    ],
  });
  const hw = await Homework.collection.insertOne({ title: 'Fractions quiz', type: 'quiz', quizId: quiz._id, exerciseQuestionIds: [], subjectId, classId, schoolId, teacherId, isDeleted: false });
  const tpl = await HomeworkTemplate.collection.insertOne({ schoolId, teacherId, title: 'Fractions', type: 'quiz', quizId: quiz._id, exerciseQuestionIds: [], isDeleted: false });
  const lesson = await Lesson.collection.insertOne({
    schoolId, teacherId, title: 'Fractions lesson', isDeleted: false,
    materials: [{ _id: oid(), kind: 'reading', title: 'Read' }, { _id: oid(), kind: 'quiz', title: 'Quick quiz', quizId: quiz._id }],
  });
  return { schoolId: String(schoolId), quizId: quiz._id, hwId: hw.insertedId, tplId: tpl.insertedId, lessonId: lesson.insertedId, topicId };
}

describe('migrateLearningQuizzes', () => {
  it('a dry run reports the plan and changes nothing', async () => {
    const f = await school();
    const report = await migrateLearningQuizzes({ apply: false, schoolId: f.schoolId });
    expect(report.lines).toEqual(['Fractions: 1 question (1 left out), 1 homework, 1 homework template, 1 lesson']);
    expect(report.applied).toBe(false);
    expect(await Homework.findById(f.hwId).lean()).toMatchObject({ type: 'quiz' });
    expect(await Question.countDocuments({ schoolId: f.schoolId })).toBe(0);
  });

  it('moves the questions into the bank and the homework, template and lesson onto them, once', async () => {
    const f = await school();
    const report = await migrateLearningQuizzes({ apply: true, schoolId: f.schoolId });
    expect(report).toMatchObject({ applied: true, moved: 1, skipped: [] });

    const questions = await Question.find({ schoolId: f.schoolId }).lean();
    expect(questions.map((q) => [q.stem, q.type, String(q.curriculumNodeId)])).toEqual([['Half of 10?', 'mcq', String(f.topicId)]]);
    const ids = questions.map((q) => String(q._id));
    expect(await Homework.findById(f.hwId).lean()).toMatchObject({ type: 'exercise', quizId: null });
    expect((await Homework.findById(f.hwId).lean())!.exerciseQuestionIds.map(String)).toEqual(ids);
    expect((await HomeworkTemplate.findById(f.tplId).lean())).toMatchObject({ type: 'exercise' });
    const lesson = await Lesson.collection.findOne({ _id: f.lessonId });
    const moved = (lesson!.materials as Array<Record<string, unknown>>)[1];
    expect(moved.kind).toBe('practice_questions');
    expect((moved.questionIds as mongoose.Types.ObjectId[]).map(String)).toEqual(ids);
    expect(moved.quizId).toBeUndefined();
    expect(await Quiz.findById(f.quizId).lean()).toMatchObject({ status: 'closed' });

    const again = await migrateLearningQuizzes({ apply: true, schoolId: f.schoolId });
    expect(again).toMatchObject({ moved: 0, lines: [] });
    expect(await Question.countDocuments({ schoolId: f.schoolId })).toBe(1);
  });

  it('leaves a quiz with no CAPS topic alone, and says why', async () => {
    const f = await school({ withCaps: false });
    const report = await migrateLearningQuizzes({ apply: true, schoolId: f.schoolId });
    expect(report).toMatchObject({ moved: 0, skipped: [{ quiz: 'Fractions', reason: 'No CAPS topic matches its subject and grade.' }] });
    expect(await Homework.findById(f.hwId).lean()).toMatchObject({ type: 'quiz' });
    expect(await Quiz.findById(f.quizId).lean()).toMatchObject({ status: 'published' });
  });
});
