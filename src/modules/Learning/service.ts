import {
  Quiz,
  QuizAttempt,
  StudyMaterial,
  Rubric,
  AssignmentSubmission,
  StudentProgress,
  type IQuiz,
  type IQuizAttempt,
  type IStudyMaterial,
  type IRubric,
  type IAssignmentSubmission,
  type IStudentProgress,
  type IQuizAnswer,
} from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

// ─── Pagination ────────────────────────────────────────────────────────────────

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

// ─── Quiz Service ──────────────────────────────────────────────────────────────

export class LearningService {
  // ─── Quizzes ─────────────────────────────────────────────────────────

  static async createQuiz(data: Partial<IQuiz>, teacherId: string): Promise<IQuiz> {
    const quiz = new Quiz({ ...data, teacherId });
    return quiz.save();
  }

  static async getQuiz(id: string): Promise<IQuiz> {
    const quiz = await Quiz.findOne({ _id: id, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email');
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
        { title: new RegExp(query.search, 'i') },
        { description: new RegExp(query.search, 'i') },
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
    const quiz = await Quiz.findOne({ _id: quizId, isDeleted: false, status: 'published' });
    if (!quiz) throw new NotFoundError('Quiz not found or not published');

    // Check attempt count
    const existingAttempts = await QuizAttempt.countDocuments({
      quizId,
      studentId,
      isDeleted: false,
    });
    if (existingAttempts >= quiz.attempts) {
      throw new BadRequestError('Maximum number of attempts reached');
    }

    // Auto-grade
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

  // ─── Study Materials ─────────────────────────────────────────────────

  static async uploadStudyMaterial(
    data: Partial<IStudyMaterial>,
    teacherId: string,
  ): Promise<IStudyMaterial> {
    const material = new StudyMaterial({ ...data, teacherId });
    return material.save();
  }

  static async getStudyMaterials(query: ListQuery): Promise<PaginatedResult<IStudyMaterial>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.gradeId) filter.gradeId = query.gradeId;
    if (query.term) filter.term = query.term;
    if (query.topic) filter.topic = new RegExp(query.topic, 'i');
    if (query.type) filter.type = query.type;

    if (query.search) {
      filter.$or = [
        { title: new RegExp(query.search, 'i') },
        { description: new RegExp(query.search, 'i') },
        { tags: { $in: [new RegExp(query.search, 'i')] } },
      ];
    }

    const [data, total] = await Promise.all([
      StudyMaterial.find(filter)
        .populate('subjectId', 'name code')
        .populate('gradeId', 'name')
        .populate('teacherId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      StudyMaterial.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getStudyMaterial(id: string): Promise<IStudyMaterial> {
    const material = await StudyMaterial.findOne({ _id: id, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name')
      .populate('teacherId', 'firstName lastName email');
    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  static async updateStudyMaterial(
    id: string,
    data: Partial<IStudyMaterial>,
  ): Promise<IStudyMaterial> {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  static async deleteStudyMaterial(id: string): Promise<IStudyMaterial> {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  static async incrementDownloads(id: string): Promise<IStudyMaterial> {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $inc: { downloads: 1 } },
      { new: true },
    );
    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  // ─── Rubrics ─────────────────────────────────────────────────────────

  static async createRubric(data: Partial<IRubric>, teacherId: string): Promise<IRubric> {
    const rubric = new Rubric({ ...data, teacherId });
    return rubric.save();
  }

  static async getRubric(id: string): Promise<IRubric> {
    const rubric = await Rubric.findOne({ _id: id, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName email');
    if (!rubric) throw new NotFoundError('Rubric not found');
    return rubric;
  }

  static async listRubrics(query: ListQuery): Promise<PaginatedResult<IRubric>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.teacherId) filter.teacherId = query.teacherId;
    if (query.subjectId) filter.subjectId = query.subjectId;

    const [data, total] = await Promise.all([
      Rubric.find(filter)
        .populate('subjectId', 'name code')
        .populate('teacherId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Rubric.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async updateRubric(id: string, data: Partial<IRubric>): Promise<IRubric> {
    const rubric = await Rubric.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!rubric) throw new NotFoundError('Rubric not found');
    return rubric;
  }

  static async deleteRubric(id: string): Promise<IRubric> {
    const rubric = await Rubric.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!rubric) throw new NotFoundError('Rubric not found');
    return rubric;
  }

  // ─── Assignment Submissions (Enhanced) ────────────────────────────────

  static async submitDraft(
    homeworkId: string,
    studentId: string,
    schoolId: string,
    files: string[],
  ): Promise<IAssignmentSubmission> {
    const submission = await AssignmentSubmission.findOneAndUpdate(
      { homeworkId, studentId, isDeleted: false },
      {
        $set: {
          homeworkId,
          studentId,
          schoolId,
          files,
          isDraft: true,
          draftSavedAt: new Date(),
          submittedAt: new Date(),
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    return submission;
  }

  static async submitFinal(
    homeworkId: string,
    studentId: string,
    schoolId: string,
    files: string[],
    isLate: boolean,
  ): Promise<IAssignmentSubmission> {
    const existing = await AssignmentSubmission.findOne({
      homeworkId,
      studentId,
      isDeleted: false,
    });

    const version = existing ? existing.revisionHistory.length + 1 : 1;
    const now = new Date();

    const updateData: Record<string, unknown> = {
      homeworkId,
      studentId,
      schoolId,
      files,
      isDraft: false,
      submittedAt: now,
      isLate,
    };

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { homeworkId, studentId, isDeleted: false },
      {
        $set: updateData,
        $push: {
          revisionHistory: { fileUrl: files[0], submittedAt: now, version },
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    return submission;
  }

  static async gradeWithRubric(
    submissionId: string,
    gradedBy: string,
    feedback: { comments: string; rubricScores: { criterionId: string; level: string; points: number }[]; audioFeedbackUrl?: string },
    mark?: number,
  ): Promise<IAssignmentSubmission> {
    const submission = await AssignmentSubmission.findOneAndUpdate(
      { _id: submissionId, isDeleted: false },
      {
        $set: {
          teacherFeedback: feedback,
          mark,
          gradedBy,
          gradedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!submission) throw new NotFoundError('Submission not found');
    return submission;
  }

  static async enablePeerReview(homeworkId: string): Promise<void> {
    const result = await AssignmentSubmission.updateMany(
      { homeworkId, isDeleted: false },
      { $set: { peerReviewEnabled: true } },
    );
    if (result.matchedCount === 0) {
      throw new NotFoundError('No submissions found for this assignment');
    }
  }

  static async submitPeerReview(
    submissionId: string,
    reviewerId: string,
    rating: number,
    comments: string,
  ): Promise<IAssignmentSubmission> {
    const submission = await AssignmentSubmission.findOne({
      _id: submissionId,
      isDeleted: false,
      peerReviewEnabled: true,
    });

    if (!submission) throw new NotFoundError('Submission not found or peer review not enabled');

    if (submission.studentId.toString() === reviewerId) {
      throw new BadRequestError('Cannot review your own submission');
    }

    const alreadyReviewed = submission.peerReviews.some(
      (r) => r.reviewerId.toString() === reviewerId,
    );
    if (alreadyReviewed) throw new BadRequestError('You have already reviewed this submission');

    submission.peerReviews.push({
      reviewerId: reviewerId as unknown as import('mongoose').Types.ObjectId,
      rating,
      comments,
      reviewedAt: new Date(),
    });

    return submission.save();
  }

  static async requestRevision(submissionId: string): Promise<IAssignmentSubmission> {
    const submission = await AssignmentSubmission.findOneAndUpdate(
      { _id: submissionId, isDeleted: false },
      { $set: { isDraft: true } },
      { new: true },
    );
    if (!submission) throw new NotFoundError('Submission not found');
    return submission;
  }

  static async getSubmission(id: string): Promise<IAssignmentSubmission> {
    const submission = await AssignmentSubmission.findOne({ _id: id, isDeleted: false })
      .populate('studentId', 'userId')
      .populate('gradedBy', 'firstName lastName email');
    if (!submission) throw new NotFoundError('Submission not found');
    return submission;
  }

  static async getSubmissionsForHomework(
    homeworkId: string,
    query: ListQuery,
  ): Promise<PaginatedResult<IAssignmentSubmission>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { homeworkId, isDeleted: false };

    const [data, total] = await Promise.all([
      AssignmentSubmission.find(filter)
        .populate('studentId', 'userId')
        .populate('gradedBy', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      AssignmentSubmission.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Student Progress ────────────────────────────────────────────────

  static async getStudentProgress(
    studentId: string,
    subjectId?: string,
  ): Promise<IStudentProgress[]> {
    const filter: Record<string, unknown> = { studentId, isDeleted: false };
    if (subjectId) filter.subjectId = subjectId;

    return StudentProgress.find(filter)
      .populate('subjectId', 'name code')
      .sort('-year -term')
      .lean()
      .exec();
  }

  static async calculateMasteryLevel(
    studentId: string,
    subjectId: string,
    schoolId: string,
    term: number,
    year: number,
  ): Promise<IStudentProgress> {
    // Gather all submissions for this student + subject
    const submissions = await AssignmentSubmission.find({
      studentId,
      schoolId,
      isDeleted: false,
      isDraft: false,
    }).lean();

    const graded = submissions.filter((s) => s.mark !== undefined && s.mark !== null);
    const total = submissions.length;
    const completed = graded.length;
    const avgMark = completed > 0 ? graded.reduce((sum, s) => sum + (s.mark ?? 0), 0) / completed : 0;
    const mastery = Math.round(avgMark);

    // Determine trend from last 3+ marks
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (graded.length >= 3) {
      const recentMarks = graded.slice(-3).map((s) => s.mark ?? 0);
      const isImproving = recentMarks[2]! > recentMarks[0]!;
      const isDeclining = recentMarks[2]! < recentMarks[0]!;
      if (isImproving) trend = 'improving';
      if (isDeclining) trend = 'declining';
    }

    const progress = await StudentProgress.findOneAndUpdate(
      { studentId, subjectId, term, year, isDeleted: false },
      {
        $set: {
          studentId,
          subjectId,
          schoolId,
          term,
          year,
          masteryPercentage: mastery,
          assignmentsCompleted: completed,
          assignmentsTotal: total,
          averageMark: Math.round(avgMark * 100) / 100,
          trend,
          lastUpdated: new Date(),
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    return progress;
  }

  static async flagStrugglingStudents(
    classId: string,
  ): Promise<{ studentId: string; subjectId: string; averageMark: number; trend: string }[]> {
    // Find students with declining performance (3+ consecutive low marks)
    const quizAttempts = await QuizAttempt.find({ isDeleted: false })
      .populate({
        path: 'quizId',
        match: { classId, isDeleted: false },
        select: 'subjectId classId',
      })
      .lean()
      .exec();

    const filtered = quizAttempts.filter((a) => a.quizId !== null);

    // Group by student
    const studentScores: Record<string, { subjectId: string; scores: number[] }> = {};
    for (const attempt of filtered) {
      const key = attempt.studentId.toString();
      const quiz = attempt.quizId as unknown as { subjectId: string };
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

  // ─── Assignment Analytics ────────────────────────────────────────────

  static async getAssignmentAnalytics(homeworkId: string): Promise<{
    totalSubmissions: number;
    submissionRate: number;
    lateRate: number;
    averageMark: number;
    scoreDistribution: { range: string; count: number }[];
  }> {
    const submissions = await AssignmentSubmission.find({
      homeworkId,
      isDeleted: false,
      isDraft: false,
    }).lean();

    const total = submissions.length;
    const lateCount = submissions.filter((s) => s.isLate).length;
    const graded = submissions.filter((s) => s.mark !== undefined && s.mark !== null);
    const avgMark =
      graded.length > 0 ? graded.reduce((s, sub) => s + (sub.mark ?? 0), 0) / graded.length : 0;

    // Score distribution buckets
    const ranges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 },
    ];

    const scoreDistribution = ranges.map((r) => ({
      range: r.range,
      count: graded.filter((s) => (s.mark ?? 0) >= r.min && (s.mark ?? 0) <= r.max).length,
    }));

    return {
      totalSubmissions: total,
      submissionRate: total, // Without knowing class size, return absolute count
      lateRate: total > 0 ? Math.round((lateCount / total) * 100) : 0,
      averageMark: Math.round(avgMark * 100) / 100,
      scoreDistribution,
    };
  }
}
