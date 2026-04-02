import {
  AssignmentSubmission,
  StudentProgress,
  type IAssignmentSubmission,
  type IStudentProgress,
} from '../model.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../../common/constants.js';

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

export class SubmissionService {
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
    }).lean();

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
    schoolId?: string,
  ): Promise<IAssignmentSubmission> {
    const filter: Record<string, unknown> = { _id: submissionId, isDeleted: false };
    if (schoolId) filter.schoolId = schoolId;
    const submission = await AssignmentSubmission.findOneAndUpdate(
      filter,
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

  static async enablePeerReview(homeworkId: string, schoolId?: string): Promise<void> {
    const filter: Record<string, unknown> = { homeworkId, isDeleted: false };
    if (schoolId) filter.schoolId = schoolId;
    const result = await AssignmentSubmission.updateMany(
      filter,
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
    schoolId?: string,
  ): Promise<IAssignmentSubmission> {
    const checkFilter: Record<string, unknown> = {
      _id: submissionId,
      isDeleted: false,
      peerReviewEnabled: true,
    };
    if (schoolId) checkFilter.schoolId = schoolId;
    const check = await AssignmentSubmission.findOne(checkFilter).lean();

    if (!check) throw new NotFoundError('Submission not found or peer review not enabled');

    if (check.studentId.toString() === reviewerId) {
      throw new BadRequestError('Cannot review your own submission');
    }

    const result = await AssignmentSubmission.findOneAndUpdate(
      {
        _id: submissionId,
        isDeleted: false,
        peerReviewEnabled: true,
        'peerReviews.reviewerId': { $ne: reviewerId },
      },
      {
        $push: {
          peerReviews: {
            reviewerId,
            rating,
            comments,
            reviewedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (!result) throw new BadRequestError('You have already reviewed this submission');

    return result;
  }

  static async requestRevision(submissionId: string, schoolId?: string): Promise<IAssignmentSubmission> {
    const filter: Record<string, unknown> = { _id: submissionId, isDeleted: false };
    if (schoolId) filter.schoolId = schoolId;
    const submission = await AssignmentSubmission.findOneAndUpdate(
      filter,
      { $set: { isDraft: true } },
      { new: true },
    );
    if (!submission) throw new NotFoundError('Submission not found');
    return submission;
  }

  static async getSubmission(id: string, schoolId?: string): Promise<IAssignmentSubmission> {
    const filter: Record<string, unknown> = { _id: id, isDeleted: false };
    if (schoolId) filter.schoolId = schoolId;
    const submission = await AssignmentSubmission.findOne(filter)
      .populate('studentId', 'userId')
      .populate('gradedBy', 'firstName lastName email')
      .lean();
    if (!submission) throw new NotFoundError('Submission not found');
    return submission;
  }

  static async getSubmissionsForHomework(
    homeworkId: string,
    query: ListQuery,
    schoolId?: string,
  ): Promise<PaginatedResult<IAssignmentSubmission>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { homeworkId, isDeleted: false };
    if (schoolId) filter.schoolId = schoolId;

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
    schoolId?: string,
  ): Promise<IStudentProgress[]> {
    const filter: Record<string, unknown> = { studentId, isDeleted: false };
    if (schoolId) filter.schoolId = schoolId;
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

  // ─── Assignment Analytics ────────────────────────────────────────────

  static async getAssignmentAnalytics(homeworkId: string, schoolId?: string): Promise<{
    totalSubmissions: number;
    submissionRate: number;
    lateRate: number;
    averageMark: number;
    scoreDistribution: { range: string; count: number }[];
  }> {
    const analyticsFilter: Record<string, unknown> = {
      homeworkId,
      isDeleted: false,
      isDraft: false,
    };
    if (schoolId) analyticsFilter.schoolId = schoolId;
    const submissions = await AssignmentSubmission.find(analyticsFilter).lean();

    const total = submissions.length;
    const lateCount = submissions.filter((s) => s.isLate).length;
    const graded = submissions.filter((s) => s.mark !== undefined && s.mark !== null);
    const avgMark =
      graded.length > 0 ? graded.reduce((s, sub) => s + (sub.mark ?? 0), 0) / graded.length : 0;

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
      submissionRate: total,
      lateRate: total > 0 ? Math.round((lateCount / total) * 100) : 0,
      averageMark: Math.round(avgMark * 100) / 100,
      scoreDistribution,
    };
  }
}
