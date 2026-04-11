import mongoose from 'mongoose';
import {
  Course,
  CourseLesson,
  Enrolment,
  LessonProgress,
  QuizAttempt,
} from './model.js';
import type { IQuestion } from '../QuestionBank/model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { HomeworkSubmission } from '../Homework/model.js';
import { Question } from '../QuestionBank/model.js';
import { Student } from '../Student/model.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../common/errors.js';

const INTERACTIVE_BLOCK_TYPES = new Set([
  'quiz',
  'fill_blank',
  'match',
  'ordering',
]);

export class CourseProgressService {
  /**
   * Update a student's progress on a single lesson. Idempotent — safe to
   * call repeatedly. Server-side completion logic determines whether the
   * lesson is now complete and whether the next lesson should unlock.
   *
   * For content lessons, on first call we compute interactionsTotal by
   * counting interactive blocks in the referenced ContentResource and
   * store it on the LessonProgress row. Subsequent calls just update
   * interactionsDone via $max-style logic so reordered or out-of-order
   * writes don't regress the count.
   */
  static async writeLessonProgress(
    enrolmentId: string,
    lessonId: string,
    userId: string,
    schoolId: string,
    body: { interactionsDone?: number; scrolledToEnd?: boolean },
  ) {
    const ctx = await loadStudentLessonContext(enrolmentId, lessonId, userId, schoolId);
    const { enrolment, lesson, soid } = ctx;

    let progress = await LessonProgress.findOne({
      enrolmentId: enrolment._id,
      lessonId: lesson._id,
      schoolId: soid,
      isDeleted: false,
    });

    if (!progress) {
      const interactionsTotal = await computeInteractionsTotal(lesson, soid);
      progress = await LessonProgress.create({
        enrolmentId: enrolment._id,
        studentId: enrolment.studentId,
        courseId: enrolment.courseId,
        lessonId: lesson._id,
        schoolId: soid,
        status: 'in_progress',
        interactionsDone: 0,
        interactionsTotal,
        scrolledToEnd: false,
      });
    }

    // $max-style: never let the count regress.
    const newInteractionsDone = Math.min(
      Math.max(progress.interactionsDone, body.interactionsDone ?? 0),
      progress.interactionsTotal === 0 ? 0 : progress.interactionsTotal,
    );
    const newScrolledToEnd = progress.scrolledToEnd || body.scrolledToEnd === true;

    progress.interactionsDone = newInteractionsDone;
    progress.scrolledToEnd = newScrolledToEnd;

    const completed = await isLessonComplete(lesson, progress, enrolment, soid);
    if (completed) {
      progress.status = 'completed';
      progress.completedAt = new Date();
    } else if (progress.status === 'locked') {
      progress.status = 'in_progress';
    }
    await progress.save();

    await recomputeEnrolmentProgress(enrolment._id, soid);

    return {
      progress,
      lessonStatus: progress.status,
      nextLessonUnlocked: completed,
    };
  }

  /**
   * Submit a quiz attempt for a quiz lesson. Server grades it against the
   * Question Bank's canonical answers and writes a QuizAttempt row. If the
   * student passes, the corresponding LessonProgress row is marked
   * completed.
   */
  static async submitQuizAttempt(
    enrolmentId: string,
    lessonId: string,
    userId: string,
    schoolId: string,
    body: { answers: { questionId: string; answer: unknown }[] },
  ) {
    const ctx = await loadStudentLessonContext(enrolmentId, lessonId, userId, schoolId);
    const { enrolment, lesson, soid } = ctx;

    if (lesson.type !== 'quiz') {
      throw new BadRequestError('This lesson is not a quiz');
    }
    if (!lesson.quizQuestionIds || lesson.quizQuestionIds.length === 0) {
      throw new BadRequestError('Quiz lesson has no questions');
    }

    const previousAttempts = await QuizAttempt.countDocuments({
      enrolmentId: enrolment._id,
      lessonId: lesson._id,
      schoolId: soid,
      isDeleted: false,
    });
    if (lesson.maxAttempts !== null && previousAttempts >= lesson.maxAttempts) {
      throw new BadRequestError('Maximum attempts exceeded for this quiz');
    }

    const questions = await Question.find({
      _id: { $in: lesson.quizQuestionIds },
      isDeleted: false,
      $or: [{ schoolId: soid }, { schoolId: null }],
    }).lean();

    const questionsById = new Map<string, typeof questions[number]>();
    for (const q of questions) questionsById.set(q._id.toString(), q);

    let totalMarks = 0;
    let earnedMarks = 0;
    const gradedAnswers = body.answers.map((a) => {
      const q = questionsById.get(a.questionId);
      if (!q) {
        return {
          questionId: new mongoose.Types.ObjectId(a.questionId),
          answer: a.answer,
          isCorrect: false,
          marks: 0,
        };
      }
      totalMarks += q.marks;
      const isCorrect = gradeAnswer(q, a.answer);
      const earned = isCorrect ? q.marks : 0;
      earnedMarks += earned;
      return {
        questionId: q._id,
        answer: a.answer,
        isCorrect,
        marks: earned,
      };
    });

    // Add unanswered questions to totalMarks (so percent reflects the
    // whole quiz, not just attempted questions).
    for (const q of questions) {
      const wasAnswered = body.answers.some((a) => a.questionId === q._id.toString());
      if (!wasAnswered) totalMarks += q.marks;
    }

    const percent = totalMarks === 0 ? 0 : Math.round((earnedMarks / totalMarks) * 100);
    const passMark = lesson.passMarkPercent ?? 70;
    const passed = percent >= passMark;

    const attempt = await QuizAttempt.create({
      schoolId: soid,
      enrolmentId: enrolment._id,
      studentId: enrolment.studentId,
      courseId: enrolment.courseId,
      lessonId: lesson._id,
      attemptNumber: previousAttempts + 1,
      answers: gradedAnswers,
      totalMarks,
      earnedMarks,
      percent,
      passed,
      submittedAt: new Date(),
    });

    if (passed) {
      let progress = await LessonProgress.findOne({
        enrolmentId: enrolment._id,
        lessonId: lesson._id,
        schoolId: soid,
        isDeleted: false,
      });
      if (!progress) {
        progress = await LessonProgress.create({
          enrolmentId: enrolment._id,
          studentId: enrolment.studentId,
          courseId: enrolment.courseId,
          lessonId: lesson._id,
          schoolId: soid,
          status: 'completed',
          completedAt: new Date(),
          interactionsDone: 0,
          interactionsTotal: 0,
          scrolledToEnd: false,
        });
      } else {
        progress.status = 'completed';
        progress.completedAt = new Date();
        await progress.save();
      }
      await recomputeEnrolmentProgress(enrolment._id, soid);
    }

    const canRetry = lesson.maxAttempts === null
      || previousAttempts + 1 < lesson.maxAttempts;
    return {
      attempt,
      passed,
      canRetry,
      nextLessonUnlocked: passed,
    };
  }

  /**
   * Drop / unassign an enrolment. Soft-deletes the Enrolment row but
   * preserves LessonProgress and QuizAttempt history for audit purposes.
   *
   * Authorization: the calling user must be either the enrolled student
   * (dropping themselves) or the course author (unassigning a student).
   */
  static async dropEnrolment(
    enrolmentId: string,
    userId: string,
    schoolId: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(enrolmentId)) {
      throw new NotFoundError('Enrolment not found');
    }
    const soid = new mongoose.Types.ObjectId(schoolId);
    const enrolment = await Enrolment.findOne({
      _id: new mongoose.Types.ObjectId(enrolmentId),
      schoolId: soid,
      isDeleted: false,
    });
    if (!enrolment) throw new NotFoundError('Enrolment not found');

    const student = await Student.findOne({
      _id: enrolment.studentId,
      schoolId: soid,
      isDeleted: false,
    })
      .select('userId')
      .lean();
    const callerIsStudent = student?.userId.toString() === userId;

    let callerIsAuthor = false;
    if (!callerIsStudent) {
      const course = await Course.findOne({
        _id: enrolment.courseId,
        schoolId: soid,
        isDeleted: false,
      })
        .select('createdBy')
        .lean();
      callerIsAuthor = course?.createdBy.toString() === userId;
    }

    if (!callerIsStudent && !callerIsAuthor) {
      throw new ForbiddenError('You do not have permission to drop this enrolment');
    }

    enrolment.isDeleted = true;
    enrolment.status = 'dropped';
    await enrolment.save();
    return { dropped: true };
  }
}

// ─── Module-private helpers ────────────────────────────────────────────────

/**
 * Shared loader: validates enrolment, ownership, and lesson belonging.
 * Used by every progress / quiz mutation. Throws on any failure.
 */
async function loadStudentLessonContext(
  enrolmentId: string,
  lessonId: string,
  userId: string,
  schoolId: string,
): Promise<{
  enrolment: NonNullable<Awaited<ReturnType<typeof Enrolment.findOne>>>;
  lesson: NonNullable<Awaited<ReturnType<typeof CourseLesson.findOne>>>;
  course: NonNullable<Awaited<ReturnType<typeof Course.findOne>>>;
  soid: mongoose.Types.ObjectId;
}> {
  if (
    !mongoose.Types.ObjectId.isValid(enrolmentId)
    || !mongoose.Types.ObjectId.isValid(lessonId)
  ) {
    throw new NotFoundError('Lesson not found');
  }
  const soid = new mongoose.Types.ObjectId(schoolId);
  const enrolment = await Enrolment.findOne({
    _id: new mongoose.Types.ObjectId(enrolmentId),
    schoolId: soid,
    isDeleted: false,
    status: 'active',
  });
  if (!enrolment) throw new NotFoundError('Enrolment not found');

  const student = await Student.findOne({
    _id: enrolment.studentId,
    schoolId: soid,
    isDeleted: false,
  })
    .select('userId')
    .lean();
  if (!student || student.userId.toString() !== userId) {
    throw new ForbiddenError('You do not have access to this lesson');
  }

  const lesson = await CourseLesson.findOne({
    _id: new mongoose.Types.ObjectId(lessonId),
    courseId: enrolment.courseId,
    schoolId: soid,
    isDeleted: false,
  });
  if (!lesson) throw new NotFoundError('Lesson not found');

  const course = await Course.findOne({
    _id: enrolment.courseId,
    schoolId: soid,
    isDeleted: false,
  });
  if (!course) throw new NotFoundError('Course not found');

  return { enrolment, lesson, course, soid };
}

/**
 * For a content lesson, count how many interactive blocks live inside the
 * referenced ContentResource. Returns 0 for chapter / homework / quiz
 * lessons (chapter completion is scroll-to-end only in Plan B because
 * Textbook chapters can have multiple resources and counting their
 * combined interactive blocks is complex enough to defer to Plan C).
 */
async function computeInteractionsTotal(
  lesson: NonNullable<Awaited<ReturnType<typeof CourseLesson.findOne>>>,
  schoolId: mongoose.Types.ObjectId,
): Promise<number> {
  if (lesson.type !== 'content' || !lesson.contentResourceId) return 0;
  const resource = await ContentResource.findOne({
    _id: lesson.contentResourceId,
    isDeleted: false,
    $or: [{ schoolId }, { schoolId: null }],
  })
    .select('blocks')
    .lean();
  if (!resource) return 0;
  return resource.blocks.filter((b) => INTERACTIVE_BLOCK_TYPES.has(b.type)).length;
}

/**
 * Determine whether a lesson should be marked complete given its current
 * progress row and lesson type.
 */
async function isLessonComplete(
  lesson: NonNullable<Awaited<ReturnType<typeof CourseLesson.findOne>>>,
  progress: NonNullable<Awaited<ReturnType<typeof LessonProgress.findOne>>>,
  enrolment: NonNullable<Awaited<ReturnType<typeof Enrolment.findOne>>>,
  schoolId: mongoose.Types.ObjectId,
): Promise<boolean> {
  if (lesson.type === 'content') {
    if (progress.interactionsTotal > 0) {
      return progress.interactionsDone >= progress.interactionsTotal;
    }
    return progress.scrolledToEnd === true;
  }
  if (lesson.type === 'chapter') {
    return progress.scrolledToEnd === true;
  }
  if (lesson.type === 'homework') {
    if (!lesson.homeworkId) return false;
    const submission = await HomeworkSubmission.findOne({
      homeworkId: lesson.homeworkId,
      studentId: enrolment.studentId,
      schoolId,
      isDeleted: false,
    })
      .select('_id')
      .lean();
    return submission !== null;
  }
  // Quiz completion is handled by submitQuizAttempt — never reaches here.
  return false;
}

/**
 * Recompute and persist the enrolment's progressPercent based on how many
 * lessons are completed vs total active lessons in the course.
 */
async function recomputeEnrolmentProgress(
  enrolmentId: mongoose.Types.ObjectId,
  schoolId: mongoose.Types.ObjectId,
): Promise<void> {
  const enrolment = await Enrolment.findById(enrolmentId);
  if (!enrolment) return;

  const totalLessons = await CourseLesson.countDocuments({
    courseId: enrolment.courseId,
    schoolId,
    isDeleted: false,
  });
  if (totalLessons === 0) {
    enrolment.progressPercent = 0;
    await enrolment.save();
    return;
  }

  const completedLessons = await LessonProgress.countDocuments({
    enrolmentId,
    schoolId,
    isDeleted: false,
    status: 'completed',
  });

  enrolment.progressPercent = Math.round((completedLessons / totalLessons) * 100);
  if (enrolment.progressPercent >= 100 && enrolment.status === 'active') {
    enrolment.status = 'completed';
    enrolment.completedAt = new Date();
    // Plan C will issue the certificate here.
  }
  await enrolment.save();
}

/**
 * Compare a student's answer against a Question's canonical answer.
 * Only handles the three auto-gradable types: mcq, true_false, fill_blank.
 * Other types are rejected at lesson creation time so they should never
 * reach the grader.
 */
function gradeAnswer(
  question: Pick<IQuestion, 'type' | 'options' | 'answer'>,
  studentAnswer: unknown,
): boolean {
  if (question.type === 'mcq' || question.type === 'true_false') {
    if (typeof studentAnswer !== 'string') return false;
    const correct = question.options.find((o) => o.isCorrect);
    if (!correct) return false;
    return correct.label.trim().toLowerCase() === studentAnswer.trim().toLowerCase();
  }
  if (question.type === 'fill_blank') {
    if (typeof studentAnswer !== 'string') return false;
    const expected = (question.answer ?? '').trim().toLowerCase();
    const got = studentAnswer.trim().toLowerCase();
    return expected !== '' && expected === got;
  }
  return false;
}
