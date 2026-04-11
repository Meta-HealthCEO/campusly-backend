import mongoose from 'mongoose';
import {
  Course,
  CourseLesson,
  Enrolment,
  LessonProgress,
  QuizAttempt,
  Certificate,
} from './model.js';
import {
  NotFoundError,
  ForbiddenError,
} from '../../common/errors.js';
import { UserRole } from '../../common/enums.js';
import type { CourseActor } from './service.js';

export interface CourseAnalytics {
  enrolmentCount: number;
  activeCount: number;
  completedCount: number;
  droppedCount: number;
  completionRate: number; // 0-100
  avgQuizScore: number; // 0-100, avg of best-per-lesson per enrolment
  certificatesIssued: number;
  perLessonDropOff: Array<{
    lessonId: string;
    title: string;
    orderIndex: number;
    studentsReached: number;
    studentsCompleted: number;
  }>;
  perClassBreakdown: Array<{
    classId: string | null;
    enroled: number;
    completed: number;
  }>;
}

/**
 * Teacher-facing analytics. Gated by canAuthor — any teacher who owns
 * the course, plus school_admin / super_admin / HOD / principal, can
 * read this. Returns the full dashboard in one request.
 */
export class CourseAnalyticsService {
  static async getCourseAnalytics(
    courseId: string,
    schoolId: string,
    actor: CourseActor,
  ): Promise<CourseAnalytics> {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new NotFoundError('Course not found');
    }
    const soid = new mongoose.Types.ObjectId(schoolId);
    const course = await Course.findOne({
      _id: new mongoose.Types.ObjectId(courseId),
      schoolId: soid,
      isDeleted: false,
    })
      .select('createdBy')
      .lean();
    if (!course) throw new NotFoundError('Course not found');

    // Teachers without HOD/principal flag can only see analytics for
    // courses they authored. Admin-tier roles (super_admin, school_admin)
    // plus isHOD / isSchoolPrincipal flags see any course in their school.
    const isAdminTier = actor.role === UserRole.SUPER_ADMIN
      || actor.role === UserRole.SCHOOL_ADMIN
      || actor.isHOD
      || actor.isSchoolPrincipal;
    if (!isAdminTier && course.createdBy.toString() !== actor.userId) {
      throw new ForbiddenError('You can only view analytics for your own courses');
    }

    const courseOid = new mongoose.Types.ObjectId(courseId);

    // ─── Enrolment counts ─────────────────────────────────────────────────
    const enrolCounts = await Enrolment.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { courseId: courseOid, schoolId: soid, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const countByStatus = new Map<string, number>();
    for (const row of enrolCounts) countByStatus.set(row._id, row.count);
    const activeCount = countByStatus.get('active') ?? 0;
    const completedCount = countByStatus.get('completed') ?? 0;
    const droppedCount = countByStatus.get('dropped') ?? 0;
    const enrolmentCount = activeCount + completedCount + droppedCount;
    const completionRate = enrolmentCount === 0
      ? 0
      : Math.round((completedCount / enrolmentCount) * 100);

    // ─── Certificates issued ─────────────────────────────────────────────
    const certificatesIssued = await Certificate.countDocuments({
      courseId: courseOid,
      schoolId: soid,
      isDeleted: false,
    });

    // ─── Average quiz score across enrolments ───────────────────────────
    // Pipeline:
    //   1. Match all non-deleted quiz attempts for this course
    //   2. Group by (enrolmentId, lessonId) → keep the best percent
    //   3. Group by enrolmentId → average best-per-lesson
    //   4. Group all → average the per-enrolment scores
    //
    // This matches Plan C's certificate issuance logic (best-per-lesson
    // averaged) so the analytics and the cert gate are internally
    // consistent.
    const avgScoreAgg = await QuizAttempt.aggregate<{
      avgScore: number;
    }>([
      {
        $match: {
          courseId: courseOid,
          schoolId: soid,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { enrolmentId: '$enrolmentId', lessonId: '$lessonId' },
          bestPercent: { $max: '$percent' },
        },
      },
      {
        $group: {
          _id: '$_id.enrolmentId',
          perEnrolmentAvg: { $avg: '$bestPercent' },
        },
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$perEnrolmentAvg' },
        },
      },
    ]);
    const avgQuizScore = avgScoreAgg.length > 0
      ? Math.round(avgScoreAgg[0]!.avgScore)
      : 0;

    // ─── Per-lesson drop-off ────────────────────────────────────────────
    // For each lesson, count how many students have a LessonProgress row
    // (regardless of status) vs. how many completed it. "Reached" means
    // any row exists; "completed" is specifically status='completed'.
    const lessons = await CourseLesson.find({
      courseId: courseOid,
      schoolId: soid,
      isDeleted: false,
    })
      .select('_id title orderIndex moduleId')
      .sort({ orderIndex: 1 })
      .lean();

    const progressCounts = await LessonProgress.aggregate<{
      _id: mongoose.Types.ObjectId;
      reached: number;
      completed: number;
    }>([
      {
        $match: {
          courseId: courseOid,
          schoolId: soid,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$lessonId',
          reached: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    const progressByLesson = new Map<
      string,
      { reached: number; completed: number }
    >();
    for (const row of progressCounts) {
      progressByLesson.set(row._id.toString(), {
        reached: row.reached,
        completed: row.completed,
      });
    }

    const perLessonDropOff = lessons.map((l) => {
      const p = progressByLesson.get(l._id.toString());
      return {
        lessonId: l._id.toString(),
        title: l.title,
        orderIndex: l.orderIndex,
        studentsReached: p?.reached ?? 0,
        studentsCompleted: p?.completed ?? 0,
      };
    });

    // ─── Per-class breakdown ────────────────────────────────────────────
    // If the course is assigned to multiple classes, show the split.
    // classId may be null for self-enroled rows (Plan B out-of-scope but
    // the aggregation handles the case defensively).
    const classBreakdown = await Enrolment.aggregate<{
      _id: mongoose.Types.ObjectId | null;
      enroled: number;
      completed: number;
    }>([
      {
        $match: {
          courseId: courseOid,
          schoolId: soid,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$classId',
          enroled: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);
    const perClassBreakdown = classBreakdown.map((row) => ({
      classId: row._id ? row._id.toString() : null,
      enroled: row.enroled,
      completed: row.completed,
    }));

    return {
      enrolmentCount,
      activeCount,
      completedCount,
      droppedCount,
      completionRate,
      avgQuizScore,
      certificatesIssued,
      perLessonDropOff,
      perClassBreakdown,
    };
  }
}
