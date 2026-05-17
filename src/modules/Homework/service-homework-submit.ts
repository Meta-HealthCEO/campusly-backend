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
import { toObjectId } from './service-access.js';

function assertUniqueKeys(keys: string[], label: string): void {
  const seen = new Set<string>();
  for (const key of keys) {
    if (seen.has(key)) throw new BadRequestError(`${label} must not contain duplicate answers`);
    seen.add(key);
  }
}

function assertExactStringSet(actual: string[], expected: string[], label: string): void {
  assertUniqueKeys(actual, label);
  if (actual.length !== expected.length) {
    throw new BadRequestError(`${label} must answer every assigned question exactly once`);
  }
  const actualSet = new Set(actual);
  for (const id of expected) {
    if (!actualSet.has(id)) {
      throw new BadRequestError(`${label} must answer every assigned question exactly once`);
    }
  }
}

function assertExactNumberSet(actual: number[], expected: number[], label: string): void {
  assertUniqueKeys(actual.map(String), label);
  if (actual.length !== expected.length) {
    throw new BadRequestError(`${label} must answer every assigned question exactly once`);
  }
  const actualSet = new Set(actual);
  for (const index of expected) {
    if (!actualSet.has(index)) {
      throw new BadRequestError(`${label} must answer every assigned question exactly once`);
    }
  }
}

export async function submitHomework(
  homeworkId: string,
  studentId: string,
  schoolId: string,
  payload: SubmitHomeworkInput,
): Promise<IHomeworkSubmissionBase> {
  const schoolOid = toObjectId(schoolId, 'schoolId');
  const homeworkOid = toObjectId(homeworkId, 'homeworkId');
  const studentOid = toObjectId(studentId, 'studentId');
  const homework = await Homework.findOne({ _id: homeworkOid, schoolId: schoolOid, isDeleted: false });
  if (!homework) throw new NotFoundError('Homework not found');
  if (homework.type !== payload.type) {
    throw new BadRequestError(
      `Payload type "${payload.type}" does not match homework type "${homework.type}"`,
    );
  }
  if (homework.status !== 'assigned') {
    throw new BadRequestError('This homework is closed and no longer accepts submissions');
  }

  const { Student } = await import('../Student/model.js');
  const student = await Student.findOne({
    _id: studentOid,
    schoolId: schoolOid,
    isDeleted: false,
  }).select('_id classId enrollmentStatus').lean<{
    _id: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
    enrollmentStatus?: string;
  } | null>();
  if (!student) throw new NotFoundError('Student not found');
  if (student.enrollmentStatus && student.enrollmentStatus !== 'active') {
    throw new BadRequestError('Only active students can submit homework');
  }
  if (student.classId.toString() !== homework.classId.toString()) {
    throw new NotFoundError('Homework not found');
  }

  const submittedAt = new Date();
  const isLate = submittedAt > homework.dueDate;
  if (isLate && homework.latePolicy === 'block') {
    throw new BadRequestError('Late submissions not accepted');
  }

  let questions: IQuestion[] = [];
  let quizQuestionsSnap: Array<{ questionText: string; correctAnswer: string; points: number; questionType: string }> = [];

  if (payload.type === 'exercise') {
    const assignedIds = homework.exerciseQuestionIds.map((id) => id.toString());
    assertExactStringSet(payload.answers.map((a) => a.questionId), assignedIds, 'answers');
    questions = (await Question.find({
      _id: { $in: homework.exerciseQuestionIds },
      isDeleted: false,
    }).lean()) as unknown as IQuestion[];
    if (questions.length !== assignedIds.length) {
      throw new BadRequestError('Assigned exercise questions are no longer available');
    }
  } else if (payload.type === 'reading') {
    const assignedIds = (homework.comprehensionQuestionIds ?? []).map((id) => id.toString());
    assertExactStringSet(
      payload.comprehensionAnswers.map((a) => a.questionId),
      assignedIds,
      'comprehensionAnswers',
    );
    questions = (await Question.find({
      _id: { $in: homework.comprehensionQuestionIds ?? [] },
      isDeleted: false,
    }).lean()) as unknown as IQuestion[];
    if (questions.length !== assignedIds.length) {
      throw new BadRequestError('Assigned comprehension questions are no longer available');
    }
  } else if (payload.type === 'quiz') {
    const quiz = await Quiz.findOne({ _id: homework.quizId, schoolId: schoolOid, isDeleted: false }).lean();
    quizQuestionsSnap = quiz?.questions ?? [];
    if (quizQuestionsSnap.length === 0) throw new BadRequestError('Quiz has no assigned questions');
    assertExactNumberSet(
      payload.answers.map((a) => a.questionIndex),
      quizQuestionsSnap.map((_, index) => index),
      'answers',
    );
  }
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  let totalMaxMarks = 0;
  let answersOut: Array<Record<string, unknown>> = [];

  if (payload.type === 'exercise') {
    const answerMap = new Map(payload.answers.map((a) => [a.questionId, a.studentAnswer]));
    answersOut = await Promise.all(homework.exerciseQuestionIds.map(async (questionId) => {
      const key = questionId.toString();
      const studentAnswer = answerMap.get(key) ?? '';
      const q = questionMap.get(key);
      if (!q) throw new BadRequestError('Assigned exercise questions are no longer available');
      totalMaxMarks += q.marks;
      const base = { questionId, studentAnswer, questionSnapshot: q.stem, maxMarks: q.marks };
      if (DETERMINISTIC_TYPES.has(q.type)) {
        const r = await gradeAnswer(q, studentAnswer);
        return { ...base, awarded: r.awarded, rationale: r.rationale, gradingMethod: r.gradingMethod };
      }
      return { ...base, gradingMethod: 'pending' };
    }));
  } else if (payload.type === 'reading') {
    const answerMap = new Map(payload.comprehensionAnswers.map((a) => [a.questionId, a.studentAnswer]));
    answersOut = await Promise.all((homework.comprehensionQuestionIds ?? []).map(async (questionId) => {
      const key = questionId.toString();
      const studentAnswer = answerMap.get(key) ?? '';
      const q = questionMap.get(key);
      if (!q) throw new BadRequestError('Assigned comprehension questions are no longer available');
      totalMaxMarks += q.marks;
      const base = { questionId, studentAnswer, questionSnapshot: q.stem, maxMarks: q.marks };
      if (DETERMINISTIC_TYPES.has(q.type)) {
        const r = await gradeAnswer(q, studentAnswer);
        return { ...base, awarded: r.awarded, rationale: r.rationale, gradingMethod: r.gradingMethod };
      }
      return { ...base, gradingMethod: 'pending' };
    }));
  } else if (payload.type === 'quiz') {
    const answerMap = new Map(payload.answers.map((a) => [a.questionIndex, a.studentAnswer]));
    answersOut = await Promise.all(quizQuestionsSnap.map(async (qq, questionIndex) => {
      const studentAnswer = answerMap.get(questionIndex) ?? '';
      totalMaxMarks += qq.points;
      const base = { questionIndex, studentAnswer, questionSnapshot: qq.questionText, maxMarks: qq.points };
      const fakeQ = { _id: new mongoose.Types.ObjectId(), type: qq.questionType, stem: qq.questionText, answer: qq.correctAnswer, markingRubric: '', marks: qq.points, options: [] } as unknown as IQuestion;
      if (DETERMINISTIC_TYPES.has(qq.questionType as IQuestion['type'])) {
        const r = await gradeAnswer(fakeQ, studentAnswer);
        return { ...base, awarded: r.awarded, rationale: r.rationale, gradingMethod: r.gradingMethod };
      }
      return { ...base, gradingMethod: 'pending' };
    }));
  }

  const hasPending = answersOut.some((a) => a.gradingMethod === 'pending');
  const rawMark = answersOut.reduce((acc, a) => acc + (typeof a.awarded === 'number' ? a.awarded : 0), 0);

  const baseDoc: Record<string, unknown> = {
    homeworkId: homeworkOid,
    studentId: studentOid,
    schoolId: schoolOid,
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
    { homeworkId: homeworkOid, studentId: studentOid, schoolId: schoolOid, isDeleted: false },
    {
      $set: { ...baseDoc, ...variantFields },
      $unset: {
        mark: '',
        feedback: '',
        gradedAt: '',
        gradedBy: '',
        errorMessage: '',
        lateMarkAdjustment: '',
      },
      $inc: { gradingGeneration: 1 },
    },
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
