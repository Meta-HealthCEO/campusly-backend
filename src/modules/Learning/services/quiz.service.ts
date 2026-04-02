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

  static async getQuiz(id: string, schoolId: string): Promise<IQuiz> {
    const quiz = await Quiz.findOne({ _id: id, schoolId, isDeleted: false })
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

  static async updateQuiz(id: string, data: Partial<IQuiz>, schoolId: string): Promise<IQuiz> {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email');
    if (!quiz) throw new NotFoundError('Quiz not found');
    return quiz;
  }

  static async publishQuiz(id: string, status: 'published' | 'closed', schoolId: string): Promise<IQuiz> {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { status } },
      { new: true, runValidators: true },
    );
    if (!quiz) throw new NotFoundError('Quiz not found');
    return quiz;
  }

  static async deleteQuiz(id: string, schoolId: string): Promise<IQuiz> {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!quiz) throw new NotFoundError('Quiz not found');
    return quiz;
  }

  // ─── Quiz Attempts ───────────────────────────────────────────────────

  static async startQuizAttempt(
    studentId: string,
    schoolId: string,
    quizId: string,
  ): Promise<{ quiz: IQuiz; attemptNumber: number }> {
    const quiz = await Quiz.findOne({ _id: quizId, schoolId, isDeleted: false, status: 'published' })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .lean();
    if (!quiz) throw new NotFoundError('Quiz not found or not published');

    const existingAttempts = await QuizAttempt.countDocuments({
      quizId,
      studentId,
      isDeleted: false,
    });
    if (existingAttempts >= quiz.attempts) {
      throw new BadRequestError('Maximum number of attempts reached');
    }

    // Shuffle questions if enabled
    if (quiz.shuffleQuestions) {
      for (let i = quiz.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [quiz.questions[i], quiz.questions[j]] = [quiz.questions[j]!, quiz.questions[i]!];
      }
    }

    // Shuffle options within each question if enabled
    if (quiz.shuffleOptions) {
      for (const q of quiz.questions) {
        for (let i = q.options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [q.options[i], q.options[j]] = [q.options[j]!, q.options[i]!];
        }
      }
    }

    return { quiz, attemptNumber: existingAttempts + 1 };
  }

  static async submitQuizAttempt(
    quizId: string,
    studentId: string,
    answers: { questionIndex: number; selectedOption?: number; textAnswer?: string }[],
    startedAt: string,
    schoolId: string,
    timeSpent?: number,
  ): Promise<IQuizAttempt> {
    const quiz = await Quiz.findOne({ _id: quizId, schoolId, isDeleted: false, status: 'published' }).lean();
    if (!quiz) throw new NotFoundError('Quiz not found or not published');

    const existingAttempts = await QuizAttempt.countDocuments({
      quizId,
      studentId,
      isDeleted: false,
    });
    if (existingAttempts >= quiz.attempts) {
      throw new BadRequestError('Maximum number of attempts reached');
    }

    // Validate time limit: if quiz has a time limit, check timeSpent
    if (quiz.timeLimit && timeSpent !== undefined) {
      const maxSeconds = quiz.timeLimit * 60 + 10; // 10s grace
      if (timeSpent > maxSeconds) {
        throw new BadRequestError('Quiz submission exceeded the time limit');
      }
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
      timeSpent,
      attempt: existingAttempts + 1,
    });

    return attempt.save();
  }

  static async getQuizLeaderboard(schoolId: string, quizId: string, limit = 10) {
    const quiz = await Quiz.findOne({ _id: quizId, schoolId, isDeleted: false }).lean();
    if (!quiz) throw new NotFoundError('Quiz not found');

    return QuizAttempt.aggregate([
      { $match: { quizId: quiz._id, isDeleted: false } },
      { $group: { _id: '$studentId', bestScore: { $max: '$totalScore' }, bestPercentage: { $max: '$percentage' }, attempts: { $sum: 1 } } },
      { $sort: { bestPercentage: -1, bestScore: -1 } },
      { $limit: limit },
      { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'student.userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, studentId: '$_id', firstName: { $ifNull: ['$user.firstName', 'Unknown'] }, lastName: { $ifNull: ['$user.lastName', ''] }, bestScore: 1, bestPercentage: 1, attempts: 1 } },
    ]);
  }

  static async getQuizResults(
    quizId: string,
    schoolId: string,
  ): Promise<{ attempts: IQuizAttempt[]; averageScore: number; submissionCount: number }> {
    // Verify the quiz belongs to this school before returning results
    const quiz = await Quiz.findOne({ _id: quizId, schoolId, isDeleted: false }).lean();
    if (!quiz) throw new NotFoundError('Quiz not found');

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
    schoolId: string,
  ): Promise<{ studentId: string; subjectId: string; averageMark: number; trend: string }[]> {
    // Step 1: Find quizzes that belong to this class and school
    const quizzes = await Quiz.find(
      { classId, schoolId, isDeleted: false },
      { _id: 1, subjectId: 1 },
    ).lean().exec();

    if (quizzes.length === 0) return [];

    const quizIds = quizzes.map((q) => q._id);
    const quizSubjectMap = new Map<string, string>(
      quizzes.map((q) => [q._id.toString(), q.subjectId?.toString() ?? '']),
    );

    // Step 2: Only fetch attempts for those specific quizzes
    const quizAttempts = await QuizAttempt.find({
      quizId: { $in: quizIds },
      isDeleted: false,
    }).lean().exec();

    const studentScores: Record<string, { subjectId: string; scores: number[] }> = {};
    for (const attempt of quizAttempts) {
      const key = attempt.studentId.toString();
      const subjectId = quizSubjectMap.get(attempt.quizId.toString()) ?? '';
      if (!studentScores[key]) {
        studentScores[key] = { subjectId, scores: [] };
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
