import mongoose from 'mongoose';
import type { HydratedDocument } from 'mongoose';
import type { IStudent } from './model.js';
import { Lesson } from '../Lesson/model.js';
import { Homework, HomeworkSubmission } from '../Homework/model.js';
import { AssessmentPaper } from '../QuestionBank/model-papers.js';
import { findDonePaperIds, learnerTestState } from '../QuestionBank/service-learner-tests.js';
// Side-effect imports: ensure referenced models are registered with Mongoose
// so .populate() works without a MissingSchemaError when this service is
// imported standalone (e.g. from a test or one-off script).
import '../Academic/model.js'; // Subject
import '../ContentLibrary/model.js'; // ContentResource

// ─── DTO shape ─────────────────────────────────────────────────────────────

export interface DashboardLessonRef {
  id: string;
  title: string;
  subject: string;
  scheduledDate: string;
}

export interface DashboardHomeworkRef {
  id: string;
  title: string;
  subject: string;
  dueAt: string;
}

export interface DashboardTestRef {
  paperId: string;
  title: string;
  subject: string;
  releaseAt?: string;
  dueAt?: string;
}

export interface StudentDashboardCounts {
  lessonsThisWeek: number;
  homeworkDueThisWeek: number;
  /** Tests still to come that the learner hasn't written. */
  testsScheduled: number;
  homeworkOverdue: number;
  /** Tests past their due date that the learner hasn't written. */
  testsOverdue: number;
}

export interface StudentDashboardDto {
  recentLesson: DashboardLessonRef | null;
  nextHomework: DashboardHomeworkRef | null;
  nextTest: DashboardTestRef | null;
  counts: StudentDashboardCounts;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Monday-based start of week. South African convention treats Monday as the
 * first day of the school week. Returns a new Date at 00:00:00 local time.
 */
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, …, 6 = Saturday
  // Days to subtract to land on Monday. Sunday → 6 back; Monday → 0; Tuesday → 1; …
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return end;
}

interface PopulatedSubjectShape {
  _id: mongoose.Types.ObjectId;
  name?: string;
  title?: string;
}

function readSubjectName(
  value: PopulatedSubjectShape | mongoose.Types.ObjectId | null | undefined,
): string {
  if (!value) return '';
  if (value instanceof mongoose.Types.ObjectId) return '';
  if (typeof value !== 'object') return '';
  const record = value as PopulatedSubjectShape;
  return record.name ?? record.title ?? '';
}

interface RecentLessonRow {
  _id: mongoose.Types.ObjectId;
  title: string;
  subjectId: PopulatedSubjectShape | mongoose.Types.ObjectId | null;
  heldAt: Date;
}

/** A class assignment that has been held: ticked taught, or its date has passed. */
function heldFilter(now: Date, prefix = ''): Record<string, unknown> {
  return { $or: [{ [`${prefix}status`]: 'taught' }, { [`${prefix}scheduledDate`]: { $lte: now } }] };
}

// ─── Aggregator ────────────────────────────────────────────────────────────

export async function buildStudentDashboard(
  student: HydratedDocument<IStudent>,
): Promise<StudentDashboardDto> {
  const { schoolId, classId } = student;
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  // 1. Find homeworkIds the student has already submitted. These are excluded
  //    from nextHomework, homeworkDueThisWeek, and homeworkOverdue.
  const submittedDocs = await HomeworkSubmission.find({
    schoolId,
    studentId: student._id,
    isDeleted: false,
  })
    .select('homeworkId')
    .lean()
    .exec();
  const submittedHwIds = submittedDocs.map(
    (s) => (s as unknown as { homeworkId: mongoose.Types.ObjectId }).homeworkId,
  );

  // 2. Fan out the remaining queries in parallel.
  const [
    recentLessonRows,
    nextHomeworkDoc,
    nextPaperDoc,
    lessonsThisWeek,
    homeworkDueThisWeek,
    homeworkOverdue,
    donePaperIds,
  ] = await Promise.all([
    // recentLesson: the class's latest published lesson that has been taught
    // or whose date has passed — teachers don't always tick "taught". One row
    // per assignment, so a lesson shared with other classes sorts by ours.
    Lesson.aggregate<RecentLessonRow>([
      {
        $match: {
          schoolId,
          isDeleted: false,
          publishedAt: { $ne: null },
          assignedClasses: { $elemMatch: { classId, ...heldFilter(now) } },
        },
      },
      { $unwind: '$assignedClasses' },
      { $match: { 'assignedClasses.classId': classId, ...heldFilter(now, 'assignedClasses.') } },
      { $addFields: { heldAt: { $ifNull: ['$assignedClasses.taughtAt', '$assignedClasses.scheduledDate'] } } },
      { $sort: { heldAt: -1, updatedAt: -1 } },
      { $limit: 1 },
      { $project: { title: 1, subjectId: 1, heldAt: 1 } },
    ]),

    // nextHomework: soonest-due, in the future, not yet submitted.
    Homework.findOne({
      schoolId,
      classId,
      isDeleted: false,
      status: 'assigned',
      dueDate: { $gte: now },
      _id: { $nin: submittedHwIds },
    })
      .sort({ dueDate: 1 })
      .populate('subjectId', 'name title')
      .lean()
      .exec(),

    // nextTest: assessment paper assigned to this class with the earliest
    // upcoming release/due, not yet written and not past its due date. We
    // pull candidate papers then pick the assignment with the soonest
    // forthcoming date in JS — assignment dates live inside an array and a
    // top-level sort cannot project the per-class entry.
    AssessmentPaper.find({
      schoolId,
      isDeleted: false,
      'assignments.classId': classId,
    })
      .populate('subjectId', 'name title')
      .lean()
      .exec(),

    // lessonsThisWeek: published lessons assigned to this class with a
    // scheduledDate inside the current week.
    Lesson.countDocuments({
      schoolId,
      isDeleted: false,
      publishedAt: { $ne: null },
      assignedClasses: {
        $elemMatch: {
          classId,
          scheduledDate: { $gte: weekStart, $lt: weekEnd },
        },
      },
    }),

    // homeworkDueThisWeek: due in current week, not submitted.
    Homework.countDocuments({
      schoolId,
      classId,
      isDeleted: false,
      status: 'assigned',
      dueDate: { $gte: weekStart, $lt: weekEnd },
      _id: { $nin: submittedHwIds },
    }),

    // homeworkOverdue: due before now, not submitted.
    Homework.countDocuments({
      schoolId,
      classId,
      isDeleted: false,
      status: 'assigned',
      dueDate: { $lt: now },
      _id: { $nin: submittedHwIds },
    }),

    // Papers the learner has already written — never "next" or "overdue".
    findDonePaperIds(schoolId, student._id),
  ]);

  // ─── Shape recentLesson ──────────────────────────────────────────────────
  let recentLesson: DashboardLessonRef | null = null;
  const recentRow = recentLessonRows[0];
  if (recentRow) {
    await Lesson.populate(recentRow, { path: 'subjectId', select: 'name title' });
    recentLesson = {
      id: recentRow._id.toString(),
      title: recentRow.title,
      subject: readSubjectName(recentRow.subjectId),
      scheduledDate: recentRow.heldAt.toISOString(),
    };
  }

  // ─── Shape nextHomework ──────────────────────────────────────────────────
  let nextHomework: DashboardHomeworkRef | null = null;
  if (nextHomeworkDoc) {
    const hwRecord = nextHomeworkDoc as unknown as Record<string, unknown>;
    nextHomework = {
      id: (hwRecord._id as mongoose.Types.ObjectId).toString(),
      title: hwRecord.title as string,
      subject: readSubjectName(
        hwRecord.subjectId as
          | PopulatedSubjectShape
          | mongoose.Types.ObjectId
          | null
          | undefined,
      ),
      dueAt: (hwRecord.dueDate as Date).toISOString(),
    };
  }

  // ─── Shape nextTest ──────────────────────────────────────────────────────
  let nextTest: DashboardTestRef | null = null;
  let testsScheduled = 0;
  let testsOverdue = 0;
  if (nextPaperDoc.length > 0) {
    // For each paper, find its class-specific assignment and pick the earliest
    // upcoming release/due date. Then sort papers by that date ascending.
    interface PaperPick {
      paperId: string;
      title: string;
      subject: string;
      releaseAt?: Date | null;
      dueAt?: Date | null;
      sortKey: number;
    }
    const picks: PaperPick[] = [];
    for (const raw of nextPaperDoc) {
      const paper = raw as unknown as Record<string, unknown>;
      const assignments = (paper.assignments as Array<{
        classId: mongoose.Types.ObjectId;
        releaseAt: Date | null;
        dueAt: Date | null;
      }>) ?? [];
      const mine = assignments.filter(
        (a) => a.classId.toString() === classId.toString(),
      );
      if (mine.length === 0) continue;
      // Choose the assignment with the earliest forthcoming date.
      const candidate = mine
        .map((a) => {
          const date = a.releaseAt ?? a.dueAt;
          return { releaseAt: a.releaseAt, dueAt: a.dueAt, when: date };
        })
        .sort((a, b) => {
          const ta = a.when ? a.when.getTime() : Number.POSITIVE_INFINITY;
          const tb = b.when ? b.when.getTime() : Number.POSITIVE_INFINITY;
          return ta - tb;
        })[0];
      const paperId = (paper._id as mongoose.Types.ObjectId).toString();
      const state = learnerTestState(paperId, candidate.dueAt, donePaperIds, now);
      if (state === 'done') continue;
      if (state === 'overdue') {
        testsOverdue += 1;
        continue;
      }
      picks.push({
        paperId,
        title: paper.title as string,
        subject: readSubjectName(
          paper.subjectId as
            | PopulatedSubjectShape
            | mongoose.Types.ObjectId
            | null
            | undefined,
        ),
        releaseAt: candidate.releaseAt,
        dueAt: candidate.dueAt,
        sortKey: candidate.when ? candidate.when.getTime() : Number.POSITIVE_INFINITY,
      });
    }
    testsScheduled = picks.length;
    picks.sort((a, b) => a.sortKey - b.sortKey);
    const first = picks[0];
    if (first) {
      nextTest = {
        paperId: first.paperId,
        title: first.title,
        subject: first.subject,
        releaseAt: first.releaseAt ? first.releaseAt.toISOString() : undefined,
        dueAt: first.dueAt ? first.dueAt.toISOString() : undefined,
      };
    }
  }

  return {
    recentLesson,
    nextHomework,
    nextTest,
    counts: {
      lessonsThisWeek,
      homeworkDueThisWeek,
      testsScheduled,
      homeworkOverdue,
      testsOverdue,
    },
  };
}
