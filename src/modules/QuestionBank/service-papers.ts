import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import {
  clonePaper as clonePaperHelper,
  checkCompliance as checkComplianceHelper,
} from './service-papers-helpers.js';
import { assertCanEditPaper } from './service-papers-auth.js';
import { cascadeMemoOnPaperDelete } from './service-papers-pdf-finalise.js';
import type {
  CreatePaperInput,
  UpdatePaperInput,
  PaperQueryInput,
} from './validation.js';

const POPULATE_LIST = [
  { path: 'subjectId', select: 'name' },
  { path: 'gradeId', select: 'name level' },
  { path: 'createdBy', select: 'firstName lastName email' },
];

const POPULATE_DETAIL = [
  ...POPULATE_LIST,
  { path: 'sections.questions.questionId' },
];

const REVIEW_ROLES = ['super_admin', 'school_admin', 'principal', 'hod'];

export class PapersService {
  static async listPapers(
    schoolId: string,
    userId: string,
    userRole: string,
    filters: PaperQueryInput,
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uoid = new mongoose.Types.ObjectId(userId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };
    if (!REVIEW_ROLES.includes(userRole)) {
      query.createdBy = uoid;
    }

    if (filters.subjectId) {
      query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    }
    if (filters.gradeId) {
      query.gradeId = new mongoose.Types.ObjectId(filters.gradeId);
    }
    if (filters.status) query.status = filters.status;
    if (filters.paperType) query.paperType = filters.paperType;
    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    const [papers, total] = await Promise.all([
      AssessmentPaper.find(query)
        .populate(POPULATE_LIST)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AssessmentPaper.countDocuments(query),
    ]);

    return { papers, total, page: filters.page ?? 1, limit };
  }

  static async getPaper(id: string, schoolId: string, userId: string, userRole: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const query: Record<string, unknown> = {
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    };
    if (!REVIEW_ROLES.includes(userRole)) {
      query.createdBy = new mongoose.Types.ObjectId(userId);
    }

    const paper = await AssessmentPaper.findOne(query)
      .populate(POPULATE_DETAIL)
      .lean();

    if (!paper) throw new NotFoundError('Assessment paper not found');
    return paper;
  }

  static async createPaper(
    schoolId: string,
    userId: string,
    data: CreatePaperInput,
  ) {
    const paper = await AssessmentPaper.create({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      title: data.title,
      subjectId: new mongoose.Types.ObjectId(data.subjectId),
      gradeId: new mongoose.Types.ObjectId(data.gradeId),
      term: data.term,
      year: data.year,
      paperType: data.paperType,
      totalMarks: 0,
      duration: data.duration,
      sections: data.sections.map((s, i) => ({
        title: s.title,
        instructions: s.instructions,
        order: i,
        questions: [],
      })),
      instructions: data.instructions,
      capsCompliance: null,
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    return paper.toObject();
  }

  static async updatePaper(
    id: string,
    schoolId: string,
    userId: string,
    userRole: string,
    data: UpdatePaperInput,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const paper = await AssessmentPaper.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!paper) throw new NotFoundError('Assessment paper not found');
    assertCanEditPaper(paper, userId, userRole, 'update');

    const fields = ['title', 'term', 'year', 'paperType', 'duration', 'instructions', 'sections'] as const;
    const update: Record<string, unknown> = {};
    for (const key of fields) {
      if (data[key] !== undefined) update[key] = data[key];
    }

    const updated = await AssessmentPaper.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate(POPULATE_DETAIL)
      .lean();

    return updated;
  }

  static async deletePaper(
    id: string,
    schoolId: string,
    userId: string,
    userRole: string,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const paper = await AssessmentPaper.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!paper) throw new NotFoundError('Assessment paper not found');
    assertCanEditPaper(paper, userId, userRole, 'delete');

    // Cascade memo first; failure is logged but does not block paper
    // deletion — the parent op is the authoritative outcome.
    await cascadeMemoOnPaperDelete(paper._id);

    await AssessmentPaper.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { isDeleted: true } },
    );

    return { deleted: true };
  }

  static clonePaper(id: string, schoolId: string, userId: string) {
    return clonePaperHelper(id, schoolId, userId);
  }

  static checkCompliance(id: string, schoolId: string) {
    return checkComplianceHelper(id, schoolId);
  }
}
