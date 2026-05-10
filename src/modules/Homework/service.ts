import mongoose from 'mongoose';
import { Homework, IHomework, HomeworkSubmission, IHomeworkSubmission, IHomeworkSubmissionBase } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { escapeRegex } from '../../common/utils.js';
import { generateComprehensionQuestions } from './service-homework-comprehension.js';
import { gradeSubmissionAsync } from './service-homework-grading-runner.js';
import { Question } from '../QuestionBank/model.js';
import { logger } from '../../common/logger.js';
import { submitHomework as _submitHomework } from './service-homework-submit.js';
import type { CreateHomeworkInput, SubmitHomeworkInput } from './validation.js';

// IHomeworkSubmission is re-exported for consumers of this module
export type { IHomeworkSubmission };

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string;
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

export class HomeworkService {
  // ─── Homework CRUD ───────────────────────────────────────────────────────

  static async create(data: CreateHomeworkInput, teacherId: string): Promise<IHomework> {
    let comprehensionIds: mongoose.Types.ObjectId[] | undefined;

    if (data.type === 'reading' && (!data.comprehensionQuestionIds || data.comprehensionQuestionIds.length === 0)) {
      const { Class } = await import('../Academic/model.js');
      const cls = await Class.findOne({ _id: data.classId, schoolId: data.schoolId, isDeleted: false }).lean();
      if (!cls) throw new NotFoundError('Class not found');
      const gradeId = cls.gradeId.toString();

      const { CurriculumNode } = await import('../CurriculumStructure/model.js');
      const node = await CurriculumNode.findOne({ schoolId: data.schoolId, isDeleted: false }).sort({ createdAt: 1 }).lean();
      if (!node) {
        throw new BadRequestError(
          'No curriculum node available for this school. Create one first or pass comprehensionQuestionIds explicitly.',
        );
      }

      comprehensionIds = await generateComprehensionQuestions(
        data.contentResourceId, data.schoolId, teacherId, data.subjectId,
        gradeId, node._id.toString(), 4,
      );
    } else if (data.type === 'reading' && data.comprehensionQuestionIds) {
      comprehensionIds = data.comprehensionQuestionIds.map((id) => new mongoose.Types.ObjectId(id));
    }

    try {
      const homework = await Homework.create({
        ...data, teacherId, version: 1,
        ...(comprehensionIds ? { comprehensionQuestionIds: comprehensionIds } : {}),
      });
      return homework.toObject() as unknown as IHomework;
    } catch (err: unknown) {
      if (comprehensionIds?.length) {
        try {
          await Question.deleteMany({ _id: { $in: comprehensionIds } });
        } catch (delErr: unknown) {
          logger.error({ delErr }, 'Comprehension Q rollback failed during homework create');
        }
      }
      throw err;
    }
  }

  static async list(schoolId: string, query: ListQuery): Promise<PaginatedResult<IHomework>> {
    const { page, limit, skip, sortField } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.classId) filter.classId = query.classId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.teacherId) filter.teacherId = query.teacherId;
    if (query.search) filter.$or = [{ title: new RegExp(escapeRegex(query.search), 'i') }];

    const [data, total] = await Promise.all([
      Homework.find(filter)
        .populate('subjectId', 'name code')
        .populate('classId', 'name')
        .populate('teacherId', 'firstName lastName email')
        .populate('contentResourceId', 'title type status blocks')
        .populate('quizId', 'title totalPoints')
        .populate('exerciseQuestionIds', 'stem type marks')
        .populate('comprehensionQuestionIds', 'stem type marks')
        .sort(sortField).skip(skip).limit(limit).lean().exec(),
      Homework.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getById(id: string, schoolId: string): Promise<IHomework> {
    const homework = await Homework.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .populate('contentResourceId', 'title type status blocks')
      .populate('quizId', 'title totalPoints questions')
      .populate('exerciseQuestionIds', 'stem type marks options answer markingRubric')
      .populate('comprehensionQuestionIds', 'stem type marks options answer markingRubric')
      .lean();
    if (!homework) throw new NotFoundError('Homework not found');
    return homework;
  }

  static async update(id: string, schoolId: string, data: Partial<IHomework>): Promise<IHomework> {
    const homework = await Homework.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data, $inc: { version: 1 } },
      { new: true, runValidators: true },
    )
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .populate('contentResourceId', 'title type status blocks')
      .populate('quizId', 'title totalPoints')
      .populate('exerciseQuestionIds', 'stem type marks')
      .populate('comprehensionQuestionIds', 'stem type marks');
    if (!homework) throw new NotFoundError('Homework not found');
    return homework;
  }

  static async delete(id: string, schoolId: string): Promise<IHomework> {
    const homework = await Homework.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!homework) throw new NotFoundError('Homework not found');
    return homework;
  }

  // ─── Submission Operations ───────────────────────────────────────────────

  static async submitHomework(
    homeworkId: string,
    studentId: string,
    schoolId: string,
    payload: SubmitHomeworkInput,
  ): Promise<IHomeworkSubmissionBase> {
    return _submitHomework(homeworkId, studentId, schoolId, payload);
  }

  static async gradeSubmission(
    submissionId: string,
    schoolId: string,
    mark: number,
    feedback: string | undefined,
    gradedBy: string,
  ): Promise<IHomeworkSubmissionBase> {
    if (mark < 0) throw new BadRequestError('Mark must be non-negative');

    const existing = await HomeworkSubmission.findOne({
      _id: submissionId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Submission not found');

    const parentHomework = await Homework.findOne({
      _id: existing.homeworkId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!parentHomework) throw new NotFoundError('Parent homework not found');
    if (mark > parentHomework.totalMarks) {
      throw new BadRequestError(`Mark (${mark}) cannot exceed homework total (${parentHomework.totalMarks})`);
    }

    const submission = await HomeworkSubmission.findOneAndUpdate(
      { _id: submissionId, schoolId, isDeleted: false },
      { $set: { mark, feedback, gradedAt: new Date(), gradedBy, gradingStatus: 'graded' } },
      { new: true, runValidators: true },
    )
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } })
      .populate('homeworkId');
    if (!submission) throw new NotFoundError('Submission not found');
    return submission;
  }

  static async regrade(submissionId: string, schoolId: string): Promise<IHomeworkSubmissionBase> {
    const sub = await HomeworkSubmission.findOne({ _id: submissionId, schoolId, isDeleted: false });
    if (!sub) throw new NotFoundError('Submission not found');

    const subAny = sub as unknown as {
      answers?: Array<{ gradingMethod: string }>;
      comprehensionAnswers?: Array<{ gradingMethod: string }>;
    };
    const answersField: 'answers' | 'comprehensionAnswers' =
      sub.type === 'reading' ? 'comprehensionAnswers' : 'answers';
    const arr = subAny[answersField];
    if (arr) {
      for (const a of arr) a.gradingMethod = 'pending';
      sub.markModified(answersField);
    }
    sub.gradingStatus = 'pending';
    sub.errorMessage = undefined;
    sub.gradingGeneration += 1;
    await sub.save();

    void gradeSubmissionAsync(submissionId);

    const fresh = await HomeworkSubmission.findOne({ _id: submissionId, schoolId, isDeleted: false });
    if (!fresh) throw new NotFoundError('Submission disappeared');
    return fresh;
  }

  static async getSubmissionById(submissionId: string, schoolId: string): Promise<IHomeworkSubmissionBase> {
    const sub = await HomeworkSubmission.findOne({
      _id: submissionId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } })
      .lean();
    if (!sub) throw new NotFoundError('Submission not found');
    return sub as unknown as IHomeworkSubmissionBase;
  }

  static async getSubmissions(homeworkId: string, schoolId: string): Promise<IHomeworkSubmissionBase[]> {
    const homework = await Homework.findOne({
      _id: homeworkId, schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false,
    }).lean();
    if (!homework) throw new NotFoundError('Homework not found');

    return HomeworkSubmission.find({
      homeworkId: new mongoose.Types.ObjectId(homeworkId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } })
      .populate('gradedBy', 'firstName lastName email')
      .sort('-submittedAt').lean().exec();
  }

  static async getHomeworkForStudent(studentId: string, schoolId: string): Promise<Array<Record<string, unknown>>> {
    const { Student } = await import('../Student/model.js');
    const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false }).lean();
    if (!student) throw new NotFoundError('Student not found');

    const homeworks = await Homework.find({ classId: student.classId, schoolId, isDeleted: false })
      .populate('subjectId', 'name code').populate('classId', 'name').populate('teacherId', 'firstName lastName')
      .populate('contentResourceId', 'title type status blocks').populate('quizId', 'title totalPoints')
      .populate('exerciseQuestionIds', 'stem type marks').populate('comprehensionQuestionIds', 'stem type marks')
      .sort({ dueDate: -1 }).lean();

    const homeworkIds = homeworks.map((h) => h._id);
    const submissions = await HomeworkSubmission.find({ homeworkId: { $in: homeworkIds }, studentId, isDeleted: false }).lean();
    const submissionMap = new Map(submissions.map((s) => [s.homeworkId.toString(), s]));
    return homeworks.map((hw) => ({ ...hw, submission: submissionMap.get(hw._id.toString()) }));
  }

  static async getStudentSubmissions(studentId: string, schoolId: string): Promise<IHomeworkSubmissionBase[]> {
    return HomeworkSubmission.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate({ path: 'homeworkId', populate: [{ path: 'subjectId', select: 'name code' }, { path: 'classId', select: 'name' }] })
      .populate('gradedBy', 'firstName lastName email')
      .sort('-submittedAt').lean().exec();
  }
}

// ─── Dashboard helpers (extracted to keep this file under 350 lines) ─────────
export { getStudentDashboardCounts, getParentDashboardCounts } from './service-homework-dashboards.js';
