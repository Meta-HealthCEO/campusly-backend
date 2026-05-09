import mongoose from 'mongoose';
import { Homework, HomeworkSubmission, IHomeworkSubmissionBase } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { gradeAnswer, applyLatePenalty, DETERMINISTIC_TYPES } from './service-homework-grading.js';
import { gradeSubmissionAsync } from './service-homework-grading-runner.js';
import { Question, IQuestion } from '../QuestionBank/model.js';
import { Quiz } from '../Learning/model.js';
import { publishHomeworkGrade } from '../Academic/service-gradebook-publish.js';
import { logger } from '../../common/logger.js';
import type { SubmitHomeworkInput } from './validation.js';

export async function submitHomework(
  homeworkId: string,
  studentId: string,
  schoolId: string,
  payload: SubmitHomeworkInput,
): Promise<IHomeworkSubmissionBase> {
  const homework = await Homework.findOne({ _id: homeworkId, schoolId, isDeleted: false });
  if (!homework) throw new NotFoundError('Homework not found');
  if (homework.type !== payload.type) {
    throw new BadRequestError(
      `Payload type "${payload.type}" does not match homework type "${homework.type}"`,
    );
  }

  const submittedAt = new Date();
  const isLate = submittedAt > homework.dueDate;
  if (isLate && homework.latePolicy === 'block') {
    throw new BadRequestError('Late submissions not accepted');
  }

  let questions: IQuestion[] = [];
  let quizQuestionsSnap: Array<{ questionText: string; correctAnswer: string; points: number; questionType: string }> = [];

  if (payload.type === 'exercise') {
    questions = (await Question.find({
      _id: { $in: payload.answers.map((a) => a.questionId) },
      isDeleted: false,
    }).lean()) as unknown as IQuestion[];
  } else if (payload.type === 'reading') {
    questions = (await Question.find({
      _id: { $in: payload.comprehensionAnswers.map((a) => a.questionId) },
      isDeleted: false,
    }).lean()) as unknown as IQuestion[];
  } else if (payload.type === 'quiz') {
    const quiz = await Quiz.findOne({ _id: homework.quizId, schoolId, isDeleted: false }).lean();
    quizQuestionsSnap = quiz?.questions ?? [];
  }
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  let totalMaxMarks = 0;
  let answersOut: Array<Record<string, unknown>> = [];

  if (payload.type === 'exercise') {
    answersOut = await Promise.all(payload.answers.map(async (a) => {
      const q = questionMap.get(a.questionId);
      if (!q) {
        return { questionId: new mongoose.Types.ObjectId(a.questionId), studentAnswer: a.studentAnswer, questionSnapshot: '(missing question)', maxMarks: 0, gradingMethod: 'pending' };
      }
      totalMaxMarks += q.marks;
      const base = { questionId: new mongoose.Types.ObjectId(a.questionId), studentAnswer: a.studentAnswer, questionSnapshot: q.stem, maxMarks: q.marks };
      if (DETERMINISTIC_TYPES.has(q.type)) {
        const r = await gradeAnswer(q, a.studentAnswer);
        return { ...base, awarded: r.awarded, rationale: r.rationale, gradingMethod: r.gradingMethod };
      }
      return { ...base, gradingMethod: 'pending' };
    }));
  } else if (payload.type === 'reading') {
    answersOut = await Promise.all(payload.comprehensionAnswers.map(async (a) => {
      const q = questionMap.get(a.questionId);
      if (!q) {
        return { questionId: new mongoose.Types.ObjectId(a.questionId), studentAnswer: a.studentAnswer, questionSnapshot: '(missing)', maxMarks: 0, gradingMethod: 'pending' };
      }
      totalMaxMarks += q.marks;
      const base = { questionId: new mongoose.Types.ObjectId(a.questionId), studentAnswer: a.studentAnswer, questionSnapshot: q.stem, maxMarks: q.marks };
      if (DETERMINISTIC_TYPES.has(q.type)) {
        const r = await gradeAnswer(q, a.studentAnswer);
        return { ...base, awarded: r.awarded, rationale: r.rationale, gradingMethod: r.gradingMethod };
      }
      return { ...base, gradingMethod: 'pending' };
    }));
  } else if (payload.type === 'quiz') {
    answersOut = await Promise.all(payload.answers.map(async (a) => {
      const qq = quizQuestionsSnap[a.questionIndex];
      if (!qq) {
        return { questionIndex: a.questionIndex, studentAnswer: a.studentAnswer, questionSnapshot: '(missing)', maxMarks: 0, gradingMethod: 'pending' };
      }
      totalMaxMarks += qq.points;
      const base = { questionIndex: a.questionIndex, studentAnswer: a.studentAnswer, questionSnapshot: qq.questionText, maxMarks: qq.points };
      const fakeQ = { _id: new mongoose.Types.ObjectId(), type: qq.questionType, stem: qq.questionText, answer: qq.correctAnswer, markingRubric: '', marks: qq.points, options: [] } as unknown as IQuestion;
      if (DETERMINISTIC_TYPES.has(qq.questionType as IQuestion['type'])) {
        const r = await gradeAnswer(fakeQ, a.studentAnswer);
        return { ...base, awarded: r.awarded, rationale: r.rationale, gradingMethod: r.gradingMethod };
      }
      return { ...base, gradingMethod: 'pending' };
    }));
  }

  const hasPending = answersOut.some((a) => a.gradingMethod === 'pending');
  const rawMark = answersOut.reduce((acc, a) => acc + (typeof a.awarded === 'number' ? a.awarded : 0), 0);

  const baseDoc: Record<string, unknown> = {
    homeworkId: new mongoose.Types.ObjectId(homeworkId),
    studentId: new mongoose.Types.ObjectId(studentId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    type: payload.type,
    homeworkVersion: homework.version,
    submittedAt,
    isLate,
    gradingStatus: hasPending ? 'pending' : 'graded',
    maxMarks: totalMaxMarks,
    isDeleted: false,
  };

  const variantFields: Record<string, unknown> =
    payload.type === 'reading'
      ? { markedReadAt: new Date(payload.markedReadAt), comprehensionAnswers: answersOut }
      : { answers: answersOut };

  const updated = await HomeworkSubmission.findOneAndUpdate(
    { homeworkId, studentId, isDeleted: false },
    { $set: { ...baseDoc, ...variantFields }, $inc: { gradingGeneration: 1 } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  if (!updated) throw new NotFoundError('Submission upsert failed');

  if (!hasPending) {
    const result = applyLatePenalty(rawMark, isLate, homework);
    updated.mark = result.finalMark;
    if (result.lateMarkAdjustment) updated.lateMarkAdjustment = result.lateMarkAdjustment;
    updated.gradedAt = new Date();
    await updated.save();
    if (homework.gradebookAutoPublish) {
      try {
        await publishHomeworkGrade(
          updated as unknown as { _id: mongoose.Types.ObjectId; studentId: mongoose.Types.ObjectId; schoolId: mongoose.Types.ObjectId; mark?: number; maxMarks: number },
          homework,
        );
      } catch (err: unknown) {
        logger.error({ err, submissionId: updated._id }, 'Sync publishHomeworkGrade failed');
      }
    }
  } else {
    void gradeSubmissionAsync(updated._id.toString());
  }

  return updated;
}
