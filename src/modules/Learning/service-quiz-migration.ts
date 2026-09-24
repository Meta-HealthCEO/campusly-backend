// src/modules/Learning/service-quiz-migration.ts
//
// Moves old Learning quizzes into the question bank (one quiz system). For
// each quiz: find a CAPS topic for its subject and grade, create its
// questions, point its homework, homework templates and lesson materials at
// them (as exercises and practice questions), then close the quiz and record
// what it became, so a second run skips it. A dry run only reports.

import mongoose from 'mongoose';
import { Quiz, type IQuiz } from './model.js';
import { MIGRATED_TAG, migrationLine, questionsFromQuiz } from './quiz-migration.js';
import { Homework } from '../Homework/model.js';
import { HomeworkTemplate } from '../Homework/model-template.js';
import { Lesson } from '../Lesson/model.js';
import { Question } from '../QuestionBank/model.js';
import { Class } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { resolveAcademicAncestor } from '../CurriculumStructure/service-academic-bridge.js';

type Id = mongoose.Types.ObjectId;

export interface MigrationReport {
  applied: boolean;
  /** One line per quiz that moves (or would move). */
  lines: string[];
  moved: number;
  skipped: Array<{ quiz: string; reason: string }>;
}

/** A CAPS topic under both the quiz's subject and its class's grade, if there is one. */
async function capsTopicFor(schoolId: Id, subjectId: Id, gradeId: Id): Promise<Id | null> {
  const [bySubject, byGrade] = await Promise.all([
    resolveAcademicAncestor(String(subjectId), 'subject', schoolId),
    resolveAcademicAncestor(String(gradeId), 'grade', schoolId),
  ]);
  if (!bySubject || !byGrade) return null;
  const inGrade = new Set(byGrade.map(String));
  const both = bySubject.filter((id) => inGrade.has(String(id)));
  if (both.length === 0) return null;
  const topic = await CurriculumNode.findOne({ _id: { $in: both }, type: 'topic', isDeleted: false }).select('_id').lean();
  return (topic?._id as Id | undefined) ?? both[0];
}

async function linksOf(quiz: IQuiz) {
  const where = { quizId: quiz._id, schoolId: quiz.schoolId, isDeleted: false };
  const [homeworks, templates, lessons] = await Promise.all([
    Homework.countDocuments(where),
    HomeworkTemplate.countDocuments(where),
    Lesson.countDocuments({ 'materials.quizId': quiz._id, schoolId: quiz.schoolId, isDeleted: false }),
  ]);
  return { homeworks, templates, lessons };
}

async function applyMove(quiz: IQuiz, ids: Id[]): Promise<void> {
  const where = { quizId: quiz._id, schoolId: quiz.schoolId, isDeleted: false };
  const asExercise = { $set: { type: 'exercise', exerciseQuestionIds: ids, quizId: null } };
  await Homework.updateMany(where, asExercise);
  await HomeworkTemplate.updateMany(where, asExercise);
  await Lesson.updateMany(
    { 'materials.quizId': quiz._id, schoolId: quiz.schoolId, isDeleted: false },
    { $set: { 'materials.$[m].kind': 'practice_questions', 'materials.$[m].questionIds': ids }, $unset: { 'materials.$[m].quizId': '' } },
    { arrayFilters: [{ 'm.quizId': quiz._id }] },
  );
  await Quiz.updateOne({ _id: quiz._id, schoolId: quiz.schoolId }, { $set: { status: 'closed', migratedQuestionIds: ids } });
}

export async function migrateLearningQuizzes(opts: { apply: boolean; schoolId?: string }): Promise<MigrationReport> {
  const report: MigrationReport = { applied: opts.apply, lines: [], moved: 0, skipped: [] };
  const filter: Record<string, unknown> = { isDeleted: false, migratedQuestionIds: { $exists: false } };
  if (opts.schoolId) filter.schoolId = new mongoose.Types.ObjectId(opts.schoolId);
  const quizzes = await Quiz.find(filter).lean() as IQuiz[];

  for (const quiz of quizzes) {
    const klass = await Class.findOne({ _id: quiz.classId, schoolId: quiz.schoolId }).select('gradeId').lean();
    if (!klass?.gradeId) {
      report.skipped.push({ quiz: quiz.title, reason: 'Its class no longer exists.' });
      continue;
    }
    const topic = await capsTopicFor(quiz.schoolId, quiz.subjectId, klass.gradeId as Id);
    if (!topic) {
      report.skipped.push({ quiz: quiz.title, reason: 'No CAPS topic matches its subject and grade.' });
      continue;
    }
    const { docs, skipped } = questionsFromQuiz(quiz, {
      schoolId: quiz.schoolId, subjectId: quiz.subjectId, gradeId: klass.gradeId as Id, curriculumNodeId: topic, createdBy: quiz.teacherId,
    });
    if (docs.length === 0) {
      report.skipped.push({ quiz: quiz.title, reason: 'None of its questions can move to the question bank.' });
      continue;
    }
    report.lines.push(migrationLine(quiz, { questions: docs.length, skipped: skipped.length, ...(await linksOf(quiz)) }));
    if (!opts.apply) continue;

    const created = await Question.insertMany(docs);
    await applyMove(quiz, created.map((q) => q._id as Id));
    report.moved += 1;
  }
  return report;
}

export { MIGRATED_TAG };
