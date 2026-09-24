// src/modules/Course/service-insight.ts
//
// What a teacher sees about a released unit: each learner's place in it, who
// is stuck and why, how far the class got through each item, and the quick
// check questions answered wrong most. Built from enrolments, progress and
// quiz attempts; only the unit's owner (or an admin, principal or HOD) sees it.

import mongoose from 'mongoose';
import { Course, CourseLesson, CourseModule, Enrolment, LessonProgress, QuizAttempt } from './model.js';
import { assertCanEditCourse, type CourseActor } from './service.js';
import { mostMissed, orderLearners, stuckReason, type MissedQuestion, type StuckReason } from './insight.js';
import { Student } from '../Student/model.js';
import { User } from '../Auth/model.js';
import { Question } from '../QuestionBank/model.js';
import { NotFoundError } from '../../common/errors.js';

const MOST_MISSED_LIMIT = 5;

export interface InsightLearner {
  enrolmentId: string;
  name: string;
  progressPercent: number;
  status: 'active' | 'completed' | 'dropped';
  currentItem: { id: string; title: string } | null;
  lastActivityAt: Date | null;
  stuck: StuckReason | null;
}

export interface UnitInsight {
  items: Array<{ id: string; title: string; itemKind: string | null; reached: number; completed: number }>;
  learners: InsightLearner[];
  mostMissed: MissedQuestion[];
  totals: { enrolled: number; completed: number; stuck: number };
}

const latest = (...dates: Array<Date | null | undefined>): Date | null =>
  dates.reduce<Date | null>((max, d) => (d && (!max || d > max) ? d : max), null);

export class UnitInsightService {
  static async get(courseId: string, schoolId: string, actor: CourseActor): Promise<UnitInsight> {
    if (!mongoose.Types.ObjectId.isValid(courseId)) throw new NotFoundError('Course not found');
    const soid = new mongoose.Types.ObjectId(schoolId);
    const course = await Course.findOne({ _id: new mongoose.Types.ObjectId(courseId), schoolId: soid, isDeleted: false });
    if (!course) throw new NotFoundError('Course not found');
    assertCanEditCourse(course, actor);

    const scope = { courseId: course._id, schoolId: soid, isDeleted: false };
    const [modules, lessons, allEnrolments, progress, attempts] = await Promise.all([
      CourseModule.find(scope).sort({ orderIndex: 1 }).select('_id').lean(),
      CourseLesson.find(scope).select('_id moduleId orderIndex title itemKind').lean(),
      Enrolment.find({ ...scope, status: { $in: ['active', 'completed'] } }).lean(),
      LessonProgress.find(scope).select('enrolmentId lessonId status updatedAt').lean(),
      QuizAttempt.find(scope).sort({ submittedAt: 1 }).lean(),
    ]);

    // Items in unit order: module by module, then by position.
    const moduleOrder = new Map(modules.map((m, i) => [String(m._id), i]));
    const items = lessons
      .filter((l) => moduleOrder.has(String(l.moduleId)))
      .sort((a, b) => (moduleOrder.get(String(a.moduleId))! - moduleOrder.get(String(b.moduleId))!) || a.orderIndex - b.orderIndex);
    const titleOf = new Map(items.map((l) => [String(l._id), l.title]));

    // Learners who are still at the school, with their names.
    const students = await Student.find({ _id: { $in: allEnrolments.map((e) => e.studentId) }, schoolId: soid, isDeleted: false })
      .select('_id userId admissionNumber').lean();
    const userIds = students.map((s) => s.userId).filter((id): id is mongoose.Types.ObjectId => !!id);
    const users = await User.find({ _id: { $in: userIds }, schoolId: soid })
      .select('firstName lastName').lean();
    const userName = new Map(users.map((u) => [String(u._id), `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()]));
    const studentName = new Map(students.map((s) => [String(s._id), (s.userId && userName.get(String(s.userId))) || `Learner ${s.admissionNumber}`]));
    const enrolments = allEnrolments.filter((e) => studentName.has(String(e.studentId)));

    const learners: InsightLearner[] = enrolments.map((e) => {
      const mine = progress.filter((p) => String(p.enrolmentId) === String(e._id));
      const myAttempts = attempts.filter((a) => String(a.enrolmentId) === String(e._id));
      const done = new Set(mine.filter((p) => p.status === 'completed').map((p) => String(p.lessonId)));
      const next = items.find((l) => !done.has(String(l._id)));
      // Only what the learner did counts as activity: null means they haven't started.
      const lastActivityAt = latest(...mine.map((p) => p.updatedAt), ...myAttempts.map((a) => a.submittedAt));
      return {
        enrolmentId: String(e._id),
        name: studentName.get(String(e.studentId)) ?? 'Learner',
        progressPercent: e.progressPercent,
        status: e.status,
        currentItem: e.status === 'completed' || !next ? null : { id: String(next._id), title: next.title },
        lastActivityAt,
        stuck: stuckReason({
          status: e.status,
          // A learner who never started is idle from the day the unit was released to them.
          lastActivityAt: lastActivityAt ?? e.enrolledAt,
          attempts: myAttempts.map((a) => ({ lessonId: String(a.lessonId), lessonTitle: titleOf.get(String(a.lessonId)) ?? 'a quick check', passed: a.passed })),
        }),
      };
    });

    const live = new Set(enrolments.map((e) => String(e._id)));
    const liveAttempts = attempts.filter((a) => live.has(String(a.enrolmentId)));
    const questionIds = [...new Set(liveAttempts.flatMap((a) => a.answers.map((ans) => String(ans.questionId))))];
    const questions = await Question.find({
      _id: { $in: questionIds.map((id) => new mongoose.Types.ObjectId(id)) },
      isDeleted: false,
      $or: [{ schoolId: soid }, { schoolId: null }],
    }).select('stem').lean();
    const stems = new Map(questions.map((q) => [String(q._id), q.stem]));

    const liveProgress = progress.filter((p) => live.has(String(p.enrolmentId)));
    return {
      items: items.map((l) => {
        const rows = liveProgress.filter((p) => String(p.lessonId) === String(l._id));
        return {
          id: String(l._id),
          title: l.title,
          itemKind: l.itemKind ?? null,
          reached: new Set(rows.map((p) => String(p.enrolmentId))).size,
          completed: rows.filter((p) => p.status === 'completed').length,
        };
      }),
      learners: orderLearners(learners),
      mostMissed: mostMissed(
        liveAttempts.map((a) => ({
          lessonTitle: titleOf.get(String(a.lessonId)) ?? 'Quick check',
          answers: a.answers.map((ans) => ({ questionId: String(ans.questionId), isCorrect: ans.isCorrect })),
        })),
        stems,
        MOST_MISSED_LIMIT,
      ),
      totals: {
        enrolled: learners.length,
        completed: learners.filter((l) => l.status === 'completed').length,
        stuck: learners.filter((l) => l.stuck !== null).length,
      },
    };
  }
}
