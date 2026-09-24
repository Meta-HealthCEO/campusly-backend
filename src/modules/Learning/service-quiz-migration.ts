// src/modules/Learning/service-quiz-migration.ts
//
// Moves old Learning quizzes into the question bank (one quiz system). For
// each quiz: find the CAPS topic it is about (under its subject and its
// class's grade), create its questions there, and turn its homework and
// homework templates into exercises on them. Lessons keep the old quiz until
// lesson practice questions show for learners; a quiz nothing uses any more
// is closed. A dry run only reports.
//
// Safe to re-run, even after a failure part-way: the new question ids are
// saved on the quiz straight after they are created and reused next time, and
// a quiz is marked done (migratedAt) only once everything has moved. Each quiz
// is its own step, so one failing quiz never stops the rest.

import mongoose from 'mongoose';
import { Quiz, type IQuiz } from './model.js';
import { migrationLine, pickTopic, questionsFromQuiz, type QuestionDoc } from './quiz-migration.js';
import { Homework } from '../Homework/model.js';
import { HomeworkTemplate } from '../Homework/model-template.js';
import { Lesson } from '../Lesson/model.js';
import { Question } from '../QuestionBank/model.js';
import { Class } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { CurriculumFramework } from '../TeacherWorkbench/model.js';
import { resolveAcademicAncestor } from '../CurriculumStructure/service-academic-bridge.js';

type Id = mongoose.Types.ObjectId;

export interface SkippedQuiz {
  quiz: string;
  quizId: string;
  schoolId: string;
  reason: string;
}

export interface MigrationReport {
  applied: boolean;
  /** One line per quiz that moves (or would move). */
  lines: string[];
  moved: number;
  skipped: SkippedQuiz[];
}

interface Options {
  apply: boolean;
  schoolId?: string;
  /** Called as each quiz moves, so a long run can be followed. */
  onProgress?: (line: string) => void;
}

/** The CAPS topic under both the quiz's subject and its class's grade that the quiz is about. */
async function capsTopicFor(quiz: IQuiz, gradeId: Id, capsId: Id): Promise<{ id: Id; title: string } | null> {
  const [bySubject, byGrade] = await Promise.all([
    resolveAcademicAncestor(String(quiz.subjectId), 'subject', quiz.schoolId),
    resolveAcademicAncestor(String(gradeId), 'grade', quiz.schoolId),
  ]);
  if (!bySubject || !byGrade) return null;
  const inGrade = new Set(byGrade.map(String));
  const both = bySubject.filter((id) => inGrade.has(String(id)));
  if (both.length === 0) return null;
  const topics = await CurriculumNode.find({
    _id: { $in: both }, frameworkId: capsId, type: { $in: ['topic', 'subtopic'] }, isDeleted: false,
  }).select('title termNumber order').lean();
  const picked = pickTopic(quiz.title, topics.map((t) => ({ id: String(t._id), title: t.title, termNumber: t.termNumber ?? null, order: t.order ?? 0 })));
  const topic = topics.find((t) => String(t._id) === picked);
  return topic ? { id: topic._id as Id, title: topic.title } : null;
}

async function linksOf(quiz: IQuiz) {
  const where = { quizId: quiz._id, schoolId: quiz.schoolId, isDeleted: false, type: 'quiz' };
  const [homeworks, templates, lessons] = await Promise.all([
    Homework.countDocuments(where),
    HomeworkTemplate.countDocuments(where),
    Lesson.countDocuments({ 'materials.quizId': quiz._id, schoolId: quiz.schoolId, isDeleted: false }),
  ]);
  return { homeworks, templates, lessons };
}

/** The quiz's questions in the bank: reused from an earlier, unfinished run, or created now. */
async function questionIdsFor(quiz: IQuiz, docs: QuestionDoc[]): Promise<Id[]> {
  if (quiz.migratedQuestionIds && quiz.migratedQuestionIds.length > 0) return quiz.migratedQuestionIds as Id[];
  const created = await Question.insertMany(docs);
  const ids = created.map((q) => q._id as Id);
  await Quiz.updateOne({ _id: quiz._id, schoolId: quiz.schoolId }, { $set: { migratedQuestionIds: ids } });
  return ids;
}

async function migrateOne(quiz: IQuiz, capsId: Id | null, opts: Options, report: MigrationReport): Promise<void> {
  const skip = (reason: string) => report.skipped.push({ quiz: quiz.title, quizId: String(quiz._id), schoolId: String(quiz.schoolId), reason });
  const klass = await Class.findOne({ _id: quiz.classId, schoolId: quiz.schoolId, isDeleted: false }).select('gradeId').lean();
  if (!klass?.gradeId) return void skip('Its class no longer exists.');
  const topic = capsId ? await capsTopicFor(quiz, klass.gradeId as Id, capsId) : null;
  if (!topic) return void skip('No CAPS topic matches its subject and grade.');
  const { docs, skipped } = questionsFromQuiz(quiz, {
    schoolId: quiz.schoolId, subjectId: quiz.subjectId, gradeId: klass.gradeId as Id, curriculumNodeId: topic.id, createdBy: quiz.teacherId,
  });
  if (docs.length === 0) return void skip('None of its questions can move to the question bank.');

  const links = await linksOf(quiz);
  const line = migrationLine(quiz, { questions: docs.length, skipped: skipped.length, ...links }, topic.title);
  report.lines.push(line);
  if (!opts.apply) return;

  const ids = await questionIdsFor(quiz, docs);
  const totalMarks = docs.reduce((sum, d) => sum + d.marks, 0);
  const where = { quizId: quiz._id, schoolId: quiz.schoolId, isDeleted: false, type: 'quiz' };
  // Homework keeps its quizId: old quiz submissions still regrade against the quiz.
  await Homework.updateMany(where, { $set: { type: 'exercise', exerciseQuestionIds: ids, totalMarks } });
  await HomeworkTemplate.updateMany(where, { $set: { type: 'exercise', exerciseQuestionIds: ids, quizId: null } });
  await Quiz.updateOne(
    { _id: quiz._id, schoolId: quiz.schoolId },
    { $set: { migratedAt: new Date(), ...(links.lessons === 0 ? { status: 'closed' } : {}) } },
  );
  report.moved += 1;
  opts.onProgress?.(line);
}

export async function migrateLearningQuizzes(opts: Options): Promise<MigrationReport> {
  const report: MigrationReport = { applied: opts.apply, lines: [], moved: 0, skipped: [] };
  const filter: Record<string, unknown> = { isDeleted: false, migratedAt: { $exists: false } };
  if (opts.schoolId) filter.schoolId = new mongoose.Types.ObjectId(opts.schoolId);
  const caps = await CurriculumFramework.findOne({ name: 'CAPS' }).select('_id').lean();
  const quizzes = await Quiz.find(filter).lean() as IQuiz[];

  for (const quiz of quizzes) {
    try {
      await migrateOne(quiz, (caps?._id as Id | undefined) ?? null, opts, report);
    } catch (err: unknown) {
      const why = err instanceof Error ? err.message : String(err);
      report.skipped.push({
        quiz: quiz.title, quizId: String(quiz._id), schoolId: String(quiz.schoolId),
        reason: `Failed part-way (${why}). Run again to finish it.`,
      });
    }
  }
  return report;
}
