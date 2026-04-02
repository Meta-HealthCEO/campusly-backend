import {
  Quiz,
  QuizAttempt,
  type IQuiz,
  type IQuizAttempt,
  type IQuizAnswer,
} from '../model.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../../common/constants.js';
import { escapeRegex } from '../../../common/utils.js';
import type { PopulatedQuiz } from '../../../types/populated.js';
import { getPopulated } from '../../../types/populated.js';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  schoolId?: string;
  classId?: string;
  subjectId?: string;
  gradeId?: string;
  teacherId?: string;
  term?: number;
  topic?: string;
  type?: string;
  status?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  const skip = (page - 1) * limit;
  const sortField = query.sort ?? '-createdAt';
  return { page, limit, skip, sortField };
}

export class QuizService {
  static async createQuiz(data: Partial<IQuiz>, teacherId: string): Promise<IQuiz> {
    const quiz = new Quiz({ ...data, teacherId });
    return quiz.save();
  }

  static async getQuiz(id: string): Promise<IQuiz> {
    const quiz = await Quiz.findOne({ _id: id, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .lean();
    if (!quiz) throw new NotFoundError('Quiz not found');
    return quiz;
  }

  static async listQuizzes(query: ListQuery): Promise<PaginatedResult<IQuiz>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.classId) filter.classId = query.classId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.teacherId) filter.teacherId = query.teacherId;
    if (query.status) filter.status = query.status;

    if (query.search) {
      filter.$or = [
        { title: new RegExp(escapeRegex(query.search), 'i') },
        { description: new RegExp(escapeRegex(query.search), 'i') },
      ];
    }

    const [data, total] = await Promise.all([
      Quiz.find(filter)
        .populate('subjectId', 'name code')
        .populate('classId', 'name')
        .populate('teacherId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Quiz.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async updateQuiz(id: string, data: Partial<IQuiz>): Promise<IQuiz> {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email');
    if (!quiz) throw new NotFoundError('Quiz not found');
    return quiz;
  }

  static async publishQuiz(id: string, status: 'published' | 'closed'): Promise<IQuiz> {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status } },
      { new: true, runValidators: true },
    );
    if (!quiz) throw new NotFoundError('Quiz not found');
    return quiz;
  }

  static async deleteQuiz(id: string): Promise<IQuiz> {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!quiz) throw new NotFoundError('Quiz not found');
    return quiz;
  }

  // ─── Quiz Attempts ───────────────────────────────────────────────────

  static async submitQuizAttempt(
    quizId: string,
    studentId: string,
    answers: { questionIndex: number; selectedOption?: number; textAnswer?: string }[],
    startedAt: string,
  ): Promise<IQuizAttempt> {
    const quiz = await Quiz.findOne({ _id: quizId, isDeleted: false, status: 'published' }).lean();
    if (!quiz) throw new NotFoundError('Quiz not found or not published');

    const existingAttempts = await QuizAttempt.countDocuments({
      quizId,
      studentId,
      isDeleted: false,
    });
    if (existingAttempts >= quiz.attempts) {
      throw new BadRequestError('Maximum number of attempts reached');
    }

    const gradedAnswers: IQuizAnswer[] = answers.map((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (!question) {
        return { ...answer, isCorrect: false, pointsEarned: 0 };
      }

      let isCorrect = false;
      if (answer.selectedOption !== undefined && question.options[answer.selectedOption]) {
        isCorrect = question.options[answer.selectedOption]!.isCorrect;
      } else if (answer.textAnswer) {
        isCorrect =
          answer.textAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      }

      return {
        questionIndex: answer.questionIndex,
        selectedOption: answer.selectedOption,
        textAnswer: answer.textAnswer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      };
    });

    const totalScore = gradedAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const percentage = quiz.totalPoints > 0 ? Math.round((totalScore / quiz.totalPoints) * 100) : 0;

    const attempt = new QuizAttempt({
      quizId,
      studentId,
      answers: gradedAnswers,
      totalScore,
      percentage,
      startedAt: new Date(startedAt),
      completedAt: new Date(),
      attempt: existingAttempts + 1,
    });

    return attempt.save();
  }

  static async getQuizResults(
    quizId: string,
  ): Promise<{ attempts: IQuizAttempt[]; averageScore: number; submissionCount: number }> {
    const attempts = await QuizAttempt.find({ quizId, isDeleted: false })
      .populate('studentId', 'userId')
      .lean()
      .exec();

    const totalScore = attempts.reduce((sum, a) => sum + a.percentage, 0);
    const averageScore = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;

    return { attempts, averageScore, submissionCount: attempts.length };
  }

  static async flagStrugglingStudents(
    classId: string,
  ): Promise<{ studentId: string; subjectId: string; averageMark: number; trend: string }[]> {
    const quizAttempts = await QuizAttempt.find({ isDeleted: false })
      .populate({
        path: 'quizId',
        match: { classId, isDeleted: false },
        select: 'subjectId classId',
      })
      .lean()
      .exec();

    const filtered = quizAttempts.filter((a) => a.quizId !== null);

    const studentScores: Record<string, { subjectId: string; scores: number[] }> = {};
    for (const attempt of filtered) {
      const key = attempt.studentId.toString();
      const quiz = getPopulated<PopulatedQuiz>(attempt.quizId);
      if (!studentScores[key]) {
        studentScores[key] = { subjectId: quiz.subjectId?.toString() ?? '', scores: [] };
      }
      studentScores[key].scores.push(attempt.percentage);
    }

    const struggling: { studentId: string; subjectId: string; averageMark: number; trend: string }[] = [];
    for (const [studentId, data] of Object.entries(studentScores)) {
      if (data.scores.length >= 3) {
        const last3 = data.scores.slice(-3);
        const avg = last3.reduce((s, v) => s + v, 0) / 3;
        if (avg < 50 || (last3[2]! < last3[0]! && last3[1]! < last3[0]!)) {
          struggling.push({
            studentId,
            subjectId: data.subjectId,
            averageMark: Math.round(avg),
            trend: 'declining',
          });
        }
      }
    }

    return struggling;
  }
}
