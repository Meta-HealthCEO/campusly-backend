import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { UnitInsightService } from '../service-insight.js';
import { Course, CourseLesson, CourseModule, Enrolment, LessonProgress, QuizAttempt } from '../model.js';
import { Student } from '../../Student/model.js';
import { User } from '../../Auth/model.js';
import { Question } from '../../QuestionBank/model.js';
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

/** A released unit (notes → check → notes) with two learners: Jan stuck on the check, Lebo past it. */
async function releasedUnit() {
  const schoolId = oid();
  const teacherId = oid();
  const course = await Course.create({ schoolId, title: 'Numbers to 99', slug: `u-${oid()}`, createdBy: teacherId, status: 'published', kind: 'class_unit' });
  const mod = await CourseModule.create({ schoolId, courseId: course._id, title: 'Counting', orderIndex: 0 });
  const [q1, q2] = [oid(), oid()];
  await Question.collection.insertMany([
    { _id: q1, schoolId, stem: 'What comes next? 10, 20, 30', isDeleted: false },
    { _id: q2, schoolId, stem: 'One more than 79?', isDeleted: false },
  ]);
  const [notes, check, more] = await CourseLesson.insertMany([
    { schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 0, title: 'Counting in tens', type: 'content', itemKind: 'notes' },
    { schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 1, title: 'Check: counting', type: 'quiz', itemKind: 'quick_check', quizQuestionIds: [q1, q2] },
    { schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 2, title: 'Counting on', type: 'content', itemKind: 'notes' },
  ]);
  const learners = [];
  for (const [first, last] of [['Jan', 'Botha'], ['Lebo', 'Mthembu'], ['Gone', 'Learner'], ['Nomsa', 'Zulu']]) {
    const userId = oid();
    const studentId = oid();
    await User.collection.insertOne({ _id: userId, schoolId, firstName: first, lastName: last, email: `${first}${oid()}@t.local`, role: 'student', isDeleted: false });
    await Student.collection.insertOne({ _id: studentId, schoolId, userId, admissionNumber: `A-${studentId}`, isDeleted: first === 'Gone' });
    const enrolment = await Enrolment.create({ schoolId, courseId: course._id, studentId, enrolledBy: teacherId, progressPercent: 0 });
    learners.push({ enrolment, studentId });
  }
  const [jan, lebo] = learners;
  const progress = (e: typeof jan, lessonId: mongoose.Types.ObjectId, status: string) => LessonProgress.create({
    schoolId, enrolmentId: e.enrolment._id, studentId: e.studentId, courseId: course._id, lessonId, status,
  });
  await progress(jan, notes._id as mongoose.Types.ObjectId, 'completed');
  await progress(lebo, notes._id as mongoose.Types.ObjectId, 'completed');
  await progress(lebo, check._id as mongoose.Types.ObjectId, 'completed');
  const attempt = (e: typeof jan, n: number, correct: boolean[]) => QuizAttempt.create({
    schoolId, enrolmentId: e.enrolment._id, studentId: e.studentId, courseId: course._id, lessonId: check._id, attemptNumber: n,
    answers: [q1, q2].map((questionId, i) => ({ questionId, answer: 'x', isCorrect: correct[i], marks: correct[i] ? 1 : 0 })),
    totalMarks: 2, earnedMarks: correct.filter(Boolean).length, percent: 0, passed: correct.every(Boolean),
  });
  await attempt(jan, 1, [false, true]);
  await attempt(jan, 2, [false, false]);
  await attempt(lebo, 1, [true, true]);
  await Enrolment.updateOne({ _id: lebo.enrolment._id }, { $set: { progressPercent: 67 } });
  await Enrolment.updateOne({ _id: jan.enrolment._id }, { $set: { progressPercent: 33 } });
  const actor: CourseActor = { userId: String(teacherId), role: 'teacher' as CourseActor['role'], isHOD: false, isSchoolPrincipal: false };
  return { schoolId: String(schoolId), courseId: String(course._id), checkId: String(check._id), actor, more, q1 };
}

describe('UnitInsightService.get', () => {
  it('shows who is where, who is stuck and why, and the most-missed questions', async () => {
    const f = await releasedUnit();
    const insight = await UnitInsightService.get(f.courseId, f.schoolId, f.actor);

    expect(insight.learners.map((l) => l.name)).toEqual(['Jan Botha', 'Nomsa Zulu', 'Lebo Mthembu']);
    expect(insight.learners[0]).toMatchObject({ progressPercent: 33, currentItem: { title: 'Check: counting' }, stuck: { kind: 'failed_check', itemTitle: 'Check: counting', count: 2 } });
    expect(insight.learners[2]).toMatchObject({ currentItem: { title: 'Counting on' }, stuck: null });
    // Never opened the unit: no activity to report, and not stuck on release day.
    expect(insight.learners[1]).toMatchObject({ name: 'Nomsa Zulu', lastActivityAt: null, stuck: null, progressPercent: 0 });
    expect(insight.mostMissed[0]).toMatchObject({ itemId: f.checkId, stem: 'What comes next? 10, 20, 30', wrong: 2, answered: 3, wrongPercent: 67 });
    expect(insight.items.map((i) => [i.title, i.completed])).toEqual([['Counting in tens', 2], ['Check: counting', 1], ['Counting on', 0]]);
    expect(insight.totals).toEqual({ enrolled: 3, completed: 0, stuck: 1 });
  });

  it("won't show one teacher's class to another", async () => {
    const f = await releasedUnit();
    const stranger: CourseActor = { ...f.actor, userId: String(oid()) };
    await expect(UnitInsightService.get(f.courseId, f.schoolId, stranger)).rejects.toThrow('You can only edit your own courses');
  });
});

describe('insight indexes', () => {
  it('finds the progress and attempts of one unit without scanning the school', () => {
    const byCourse = (indexes: Array<[Record<string, unknown>, unknown]>) => indexes.some(([keys]) => Object.keys(keys)[0] === 'courseId');
    expect(byCourse(LessonProgress.schema.indexes() as Array<[Record<string, unknown>, unknown]>)).toBe(true);
    expect(byCourse(QuizAttempt.schema.indexes() as Array<[Record<string, unknown>, unknown]>)).toBe(true);
  });
});

describe('UnitInsight after a check is edited', () => {
  it('still lists a question the teacher has since replaced: the class really got it wrong', async () => {
    const f = await releasedUnit();
    await Question.updateOne({ _id: f.q1 }, { $set: { isDeleted: true } });
    const insight = await UnitInsightService.get(f.courseId, f.schoolId, f.actor);
    expect(insight.mostMissed.map((m) => m.stem)).toContain('What comes next? 10, 20, 30');
  });
});
