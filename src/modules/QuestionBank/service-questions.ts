import mongoose from 'mongoose';
import { Question } from './model.js';
import { resolveAcademicFilterIds } from '../Academic/services/global-academic-lookup.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  ReviewQuestionInput,
  QuestionQueryInput,
} from './validation.js';

const POPULATE_LIST = [
  { path: 'curriculumNodeId', select: 'title code type' },
  { path: 'subjectId', select: 'name' },
  { path: 'gradeId', select: 'name level' },
  { path: 'createdBy', select: 'firstName lastName email' },
];

const POPULATE_DETAIL = [
  ...POPULATE_LIST,
  { path: 'reviewedBy', select: 'firstName lastName email' },
];

export class QuestionsService {
  static async listQuestions(
    schoolId: string,
    userId: string,
    userRole: string,
    filters: QuestionQueryInput,
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uoid = new mongoose.Types.ObjectId(userId);
    const { subjectIds, gradeIds } = await resolveAcademicFilterIds({
      subjectId: filters.subjectId,
      gradeId: filters.gradeId,
    });
    const query: Record<string, unknown> = { isDeleted: false };

    // ── Visibility rules ──
    if (filters.mine) {
      query.createdBy = uoid;
    } else {
      const orConditions: Record<string, unknown>[] = [
        { schoolId: null, status: 'approved' },
        { schoolId: soid, status: 'approved' },
        { createdBy: uoid, schoolId: soid, status: { $in: ['draft', 'rejected'] } },
      ];

      const reviewRoles = ['super_admin', 'school_admin', 'principal', 'hod'];
      if (reviewRoles.includes(userRole)) {
        orConditions.push({ schoolId: soid, status: 'pending_review' });
      }

      query.$or = orConditions;
    }

    // ── Filters ──
    if (filters.curriculumNodeId) {
      query.curriculumNodeId = new mongoose.Types.ObjectId(filters.curriculumNodeId);
    }
    if (filters.type) query.type = filters.type;
    if (filters.capsLevel) query['cognitiveLevel.caps'] = filters.capsLevel;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (subjectIds) query.subjectId = { $in: subjectIds };
    if (gradeIds) query.gradeId = { $in: gradeIds };
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.stem = { $regex: filters.search, $options: 'i' };
    }

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    const [questions, total] = await Promise.all([
      Question.find(query)
        .populate(POPULATE_LIST)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(query),
    ]);

    return { questions, total, page: filters.page ?? 1, limit };
  }

  static async getQuestion(id: string, schoolId: string, userId: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uoid = new mongoose.Types.ObjectId(userId);

    const question = await Question.findOne({
      _id: oid,
      isDeleted: false,
      $or: [
        { schoolId: null, status: 'approved' },
        { schoolId: soid },
        { createdBy: uoid },
      ],
    })
      .populate(POPULATE_DETAIL)
      .lean();

    if (!question) throw new NotFoundError('Question not found');
    return question;
  }

  static async createQuestion(
    schoolId: string,
    userId: string,
    data: CreateQuestionInput,
  ) {
    const question = await Question.create({
      curriculumNodeId: new mongoose.Types.ObjectId(data.curriculumNodeId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      subjectId: new mongoose.Types.ObjectId(data.subjectId),
      gradeId: new mongoose.Types.ObjectId(data.gradeId),
      type: data.type,
      stem: data.stem,
      media: data.media,
      options: data.options,
      answer: data.answer,
      markingRubric: data.markingRubric,
      marks: data.marks,
      cognitiveLevel: data.cognitiveLevel,
      difficulty: data.difficulty,
      tags: data.tags,
      source: 'teacher',
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    return question.toObject();
  }

  static async updateQuestion(
    id: string,
    schoolId: string,
    userId: string,
    data: UpdateQuestionInput,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const question = await Question.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!question) throw new NotFoundError('Question not found');
    if (question.createdBy.toString() !== userId) {
      throw new ForbiddenError('Only the creator can edit this question');
    }
    if (question.status !== 'draft' && question.status !== 'rejected') {
      throw new ForbiddenError('Only draft or rejected questions can be edited');
    }

    const update: Record<string, unknown> = {};
    if (data.stem !== undefined) update.stem = data.stem;
    if (data.media !== undefined) update.media = data.media;
    if (data.options !== undefined) update.options = data.options;
    if (data.answer !== undefined) update.answer = data.answer;
    if (data.markingRubric !== undefined) update.markingRubric = data.markingRubric;
    if (data.marks !== undefined) update.marks = data.marks;
    if (data.cognitiveLevel !== undefined) update.cognitiveLevel = data.cognitiveLevel;
    if (data.difficulty !== undefined) update.difficulty = data.difficulty;
    if (data.tags !== undefined) update.tags = data.tags;

    if (question.status === 'rejected') {
      update.status = 'draft';
    }

    const updated = await Question.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate(POPULATE_DETAIL)
      .lean();

    return updated;
  }

  static async deleteQuestion(
    id: string,
    schoolId: string,
    userId: string,
    userRole: string,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const question = await Question.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!question) throw new NotFoundError('Question not found');

    const isAdmin = ['super_admin', 'school_admin', 'principal'].includes(userRole);
    const isCreator = question.createdBy.toString() === userId;
    if (!isAdmin && !isCreator) {
      throw new ForbiddenError('Only the creator or an admin can delete this question');
    }

    await Question.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { isDeleted: true } },
    );

    return { deleted: true };
  }

  // ─── Review Workflow ─────────────────────────────────────────────────────

  static async submitForReview(id: string, schoolId: string, userId: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const question = await Question.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!question) throw new NotFoundError('Question not found');
    if (question.createdBy.toString() !== userId) {
      throw new ForbiddenError('Only the creator can submit for review');
    }
    if (question.status !== 'draft' && question.status !== 'rejected') {
      throw new BadRequestError('Only draft or rejected questions can be submitted');
    }

    const updated = await Question.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { status: 'pending_review' } },
      { new: true },
    ).lean();

    return updated;
  }

  /**
   * One-step teacher commit: promote a draft / pending question straight to
   * `approved`. Used by the per-question "Save to bank" button on the paper
   * detail page. Bypasses the HOD review workflow because the standalone
   * teacher persona has no HOD. Auth: must be the question creator OR
   * carry a HOD-level role (gated at the route layer).
   */
  static async saveQuestionToBank(
    id: string,
    schoolId: string,
    reviewerId: string,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const question = await Question.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!question) throw new NotFoundError('Question not found');
    if (question.status === 'approved') return question;
    if (question.status === 'rejected') {
      throw new BadRequestError('Rejected questions cannot be saved to the bank.');
    }

    const updated = await Question.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      {
        $set: {
          status: 'approved',
          reviewedBy: new mongoose.Types.ObjectId(reviewerId),
          reviewedAt: new Date(),
        },
      },
      { new: true },
    ).lean();

    return updated;
  }

  static async reviewQuestion(
    id: string,
    schoolId: string,
    reviewerId: string,
    data: ReviewQuestionInput,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const question = await Question.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!question) throw new NotFoundError('Question not found');
    if (question.status !== 'pending_review') {
      throw new BadRequestError('Only questions with pending_review status can be reviewed');
    }

    const newStatus = data.action === 'approve' ? 'approved' : 'rejected';

    const updated = await Question.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      {
        $set: {
          status: newStatus,
          reviewedBy: new mongoose.Types.ObjectId(reviewerId),
          reviewedAt: new Date(),
        },
      },
      { new: true },
    ).lean();

    return updated;
  }
}
