import mongoose from 'mongoose';
import { logger } from '../../common/logger.js';
import { Homework, HomeworkSubmission } from './model.js';
import { Question, IQuestion } from '../QuestionBank/model.js';
import { gradeAnswer, applyLatePenalty } from './service-homework-grading.js';
import { publishHomeworkGrade } from '../Academic/service-gradebook-publish.js';

// ─── Per-school semaphore (single-instance only) ────────────────────────────

const PER_SCHOOL_CAP = 30;
const PER_SUBMISSION_CAP = 3;
const inFlightBySchool = new Map<string, number>();
const waitQueueBySchool = new Map<string, Array<() => void>>();

function acquireSchoolSlot(schoolId: string): Promise<void> {
  const inFlight = inFlightBySchool.get(schoolId) ?? 0;
  if (inFlight < PER_SCHOOL_CAP) {
    inFlightBySchool.set(schoolId, inFlight + 1);
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const queue = waitQueueBySchool.get(schoolId) ?? [];
    queue.push(() => {
      inFlightBySchool.set(schoolId, (inFlightBySchool.get(schoolId) ?? 0) + 1);
      resolve();
    });
    waitQueueBySchool.set(schoolId, queue);
  });
}

function releaseSchoolSlot(schoolId: string): void {
  const inFlight = inFlightBySchool.get(schoolId) ?? 1;
  inFlightBySchool.set(schoolId, Math.max(0, inFlight - 1));
  const queue = waitQueueBySchool.get(schoolId);
  const next = queue?.shift();
  if (next) next();
}

// ─── Concurrency-capped chunked Promise.allSettled ──────────────────────────

async function chunkedAll<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<Array<{ status: 'fulfilled'; value: R } | { status: 'rejected'; reason: unknown }>> {
  const results: Array<{ status: 'fulfilled'; value: R } | { status: 'rejected'; reason: unknown }> = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const slice = items.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      slice.map((item, idx) => worker(item, i + idx)),
    );
    for (const r of settled) {
      results.push(r.status === 'fulfilled'
        ? { status: 'fulfilled', value: r.value }
        : { status: 'rejected', reason: r.reason });
    }
  }
  return results;
}

// ─── Internal types ─────────────────────────────────────────────────────────

interface AnswerLike {
  studentAnswer: string;
  awarded?: number;
  maxMarks: number;
  rationale?: string;
  gradingMethod: string;
  questionId?: mongoose.Types.ObjectId;
  questionIndex?: number;
}

interface GradedItem {
  idx: number;
  awarded: number;
  rationale: string;
  method: 'deterministic' | 'ai';
}

// ─── Public entry ───────────────────────────────────────────────────────────

/**
 * Fire-and-forget. Iterates `gradingMethod='pending'` answers, calls AI, writes
 * results back to the submission. Honors gradingGeneration to abort if the
 * student has resubmitted mid-grade.
 */
export async function gradeSubmissionAsync(submissionId: string): Promise<void> {
  const submission = await HomeworkSubmission.findOne({ _id: submissionId, isDeleted: false });
  if (!submission) {
    logger.warn({ submissionId }, 'gradeSubmissionAsync: submission not found');
    return;
  }
  const homework = await Homework.findOne({
    _id: submission.homeworkId,
    schoolId: submission.schoolId,
    isDeleted: false,
  });
  if (!homework) {
    logger.warn({ submissionId, homeworkId: submission.homeworkId }, 'gradeSubmissionAsync: homework not found');
    return;
  }

  const capturedGeneration = submission.gradingGeneration;
  const schoolId = submission.schoolId.toString();
  await acquireSchoolSlot(schoolId);

  try {
    const sub = submission as unknown as { answers?: AnswerLike[]; comprehensionAnswers?: AnswerLike[]; type: string };
    const answersField: 'answers' | 'comprehensionAnswers' =
      submission.type === 'reading' ? 'comprehensionAnswers' : 'answers';
    const answers: AnswerLike[] = sub[answersField] ?? [];

    const pendingIndices = answers
      .map((a, i) => (a.gradingMethod === 'pending' ? i : -1))
      .filter((i) => i >= 0);

    if (pendingIndices.length === 0) {
      await finalizeSubmission(submissionId, capturedGeneration);
      return;
    }

    // Resolve Question docs for exercise/reading answers
    const questionIds = pendingIndices
      .map((i) => answers[i].questionId)
      .filter((id): id is mongoose.Types.ObjectId => !!id);
    const questions = questionIds.length
      ? await Question.find({ _id: { $in: questionIds }, isDeleted: false }).lean()
      : [];
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q as unknown as IQuestion]));

    // Quiz embedded questions
    let quizQuestions: Array<{ questionText: string; correctAnswer: string; points: number; questionType: string }> = [];
    if (submission.type === 'quiz' && homework.quizId) {
      const { Quiz } = await import('../Learning/model.js');
      const quiz = await Quiz.findOne({
        _id: homework.quizId,
        schoolId: submission.schoolId,
        isDeleted: false,
      }).lean();
      quizQuestions = quiz?.questions ?? [];
    }

    const results = await chunkedAll<number, GradedItem>(
      pendingIndices,
      async (idx) => {
        const ans = answers[idx];
        if (submission.type === 'quiz' && ans.questionIndex !== undefined) {
          const qq = quizQuestions[ans.questionIndex];
          if (!qq) return { idx, awarded: 0, rationale: 'Question not found', method: 'ai' };
          const fakeQ = {
            _id: new mongoose.Types.ObjectId(),
            stem: qq.questionText,
            answer: qq.correctAnswer,
            markingRubric: '',
            marks: qq.points,
            type: qq.questionType,
            options: [],
          } as unknown as IQuestion;
          const r = await gradeAnswer(fakeQ, ans.studentAnswer);
          return { idx, awarded: r.awarded, rationale: r.rationale, method: r.gradingMethod };
        }
        if (ans.questionId) {
          const q = questionMap.get(ans.questionId.toString());
          if (!q) return { idx, awarded: 0, rationale: 'Question not found', method: 'ai' };
          const r = await gradeAnswer(q, ans.studentAnswer);
          return { idx, awarded: r.awarded, rationale: r.rationale, method: r.gradingMethod };
        }
        return { idx, awarded: 0, rationale: 'Unable to resolve question', method: 'ai' };
      },
      PER_SUBMISSION_CAP,
    );

    // Re-load + generation guard
    const fresh = await HomeworkSubmission.findOne({ _id: submissionId });
    if (!fresh) return;
    if (fresh.gradingGeneration !== capturedGeneration) {
      logger.info({ submissionId }, 'Submission was resubmitted mid-grading; aborting');
      return;
    }

    const freshAny = fresh as unknown as { answers?: AnswerLike[]; comprehensionAnswers?: AnswerLike[] };
    const freshAnswers = freshAny[answersField] ?? [];
    for (const r of results) {
      if (r.status === 'rejected') {
        logger.error({ submissionId, reason: r.reason }, 'gradeAnswer rejected');
        continue;
      }
      const a = freshAnswers[r.value.idx];
      if (!a) continue;
      a.awarded = r.value.awarded;
      a.rationale = r.value.rationale;
      a.gradingMethod = r.value.method;
    }

    fresh.markModified(answersField);
    await fresh.save();
    await finalizeSubmission(submissionId, capturedGeneration);
  } catch (err: unknown) {
    logger.error({ err, submissionId }, 'gradeSubmissionAsync top-level error');
    await HomeworkSubmission.updateOne(
      { _id: submissionId, gradingGeneration: capturedGeneration },
      {
        $set: {
          gradingStatus: 'failed',
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        },
      },
    );
  } finally {
    releaseSchoolSlot(schoolId);
  }
}

async function finalizeSubmission(submissionId: string, capturedGeneration: number): Promise<void> {
  const sub = await HomeworkSubmission.findOne({ _id: submissionId, isDeleted: false });
  if (!sub) return;
  if (sub.gradingGeneration !== capturedGeneration) return;
  const homework = await Homework.findOne({
    _id: sub.homeworkId,
    schoolId: sub.schoolId,
    isDeleted: false,
  });
  if (!homework) return;

  const subAny = sub as unknown as { answers?: AnswerLike[]; comprehensionAnswers?: AnswerLike[] };
  const answers = (sub.type === 'reading' ? subAny.comprehensionAnswers : subAny.answers) ?? [];
  const rawMark = answers.reduce((acc, a) => acc + (a.awarded ?? 0), 0);

  let finalMark = rawMark;
  let lateAdj: ReturnType<typeof applyLatePenalty>['lateMarkAdjustment'];
  try {
    const result = applyLatePenalty(rawMark, sub.isLate, homework);
    finalMark = result.finalMark;
    lateAdj = result.lateMarkAdjustment;
  } catch (err: unknown) {
    logger.error({ err, submissionId }, 'Late penalty threw at finalize');
  }

  sub.mark = finalMark;
  sub.gradingStatus = 'graded';
  sub.gradedAt = new Date();
  if (lateAdj) sub.lateMarkAdjustment = lateAdj;
  await sub.save();

  if (homework.gradebookAutoPublish) {
    try {
      await publishHomeworkGrade(
        sub as unknown as {
          _id: mongoose.Types.ObjectId;
          studentId: mongoose.Types.ObjectId;
          schoolId: mongoose.Types.ObjectId;
          mark?: number;
          maxMarks: number;
        },
        homework,
      );
    } catch (err: unknown) {
      logger.error({ err, submissionId }, 'publishHomeworkGrade failed (non-fatal)');
    }
  }
}
