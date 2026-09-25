import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import { PaperMemo } from '../TeacherWorkbench/model.assessment.js';
import { NotFoundError } from '../../common/errors.js';
import { escapeRegex, paginationHelper } from '../../common/utils.js';
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
import { PaperModeration } from '../TeacherWorkbench/model.assessment.js';
import { memoSectionsFromPaper } from './service-paper-memo-build.js';
import { assertCanReadPaper } from './service-papers-read.js';
import { carryQuestionTags } from './paper-question-tags.js';
import {
  REVIEW_ROLES, assertCanCreateForSubjectGrade, assertSectionNodes, buildPaperSections, normaliseSubjectGradeIds,
  normaliseTopicIds, toObjectId, verifyPaperRefs,
} from './service-papers-refs.js';

// Subject/grade/topic checks and the section builder live in
// service-papers-refs.ts (split to stay under 350 lines); the paper
// generator imports three of them from here.
export { assertCanCreateForSubjectGrade, normaliseSubjectGradeIds, verifyPaperRefs } from './service-papers-refs.js';

const POPULATE_LIST = [
  { path: 'subjectId', select: 'name' },
  { path: 'gradeId', select: 'name level' },
  { path: 'createdBy', select: 'firstName lastName email' },
];

const POPULATE_DETAIL = [
  ...POPULATE_LIST,
  { path: 'sections.questions.questionId' },
];

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
    if (filters.term) query.term = filters.term;
    if (filters.year) query.year = filters.year;
    if (filters.status) query.status = filters.status;
    if (filters.paperType) query.paperType = filters.paperType;
    if (filters.search) {
      query.title = new RegExp(escapeRegex(filters.search), 'i');
    }
    if (filters.moderation) {
      // Moderation state lives on a separate collection (one row per
      // reviewed paper) — narrow to matching paperIds before paginating so
      // the count and page both reflect the filter, not the unfiltered set.
      const matchingIds = await PaperModeration.find({
        schoolId: soid,
        status: filters.moderation,
        isDeleted: false,
      }).distinct('paperId');
      query._id = { $in: matchingIds };
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

    // Each paper's moderation state, in one query (paperId is unique on PaperModeration).
    const moderations = papers.length === 0 ? [] : await PaperModeration.find({
      paperId: { $in: papers.map((p) => p._id) },
      schoolId: soid,
      isDeleted: false,
    }).select('paperId status comments updatedAt').lean();
    const moderationByPaper = new Map(moderations.map((m) => [String(m.paperId), m]));
    const withModeration = papers.map((paper) => {
      const m = moderationByPaper.get(String(paper._id));
      return {
        ...paper,
        moderation: m
          ? { status: m.status, comments: m.comments || null, updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : null }
          : null,
      };
    });

    return { papers: withModeration, total, page: filters.page ?? 1, limit };
  }

  static async getPaper(
    id: string,
    schoolId: string,
    userId: string,
    userRole: string,
    /** An HOD may open papers written by teachers in their department. */
    opts: { hodDepartmentId?: string | null } = {},
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);
    const reviewer = REVIEW_ROLES.includes(userRole);

    const query: Record<string, unknown> = {
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    };
    if (!reviewer && !opts.hodDepartmentId) {
      query.createdBy = new mongoose.Types.ObjectId(userId);
    }

    const paper = await AssessmentPaper.findOne(query)
      .populate(POPULATE_DETAIL)
      .lean();

    if (!paper) throw new NotFoundError('Assessment paper not found');

    if (!reviewer && opts.hodDepartmentId) {
      await assertCanReadPaper(paper, userId, userRole, opts.hodDepartmentId);
    }
    const m = await PaperModeration.findOne({ paperId: oid, schoolId: soid, isDeleted: false })
      .select('status comments updatedAt').lean();
    return {
      ...paper,
      moderation: m
        ? { status: m.status, comments: m.comments || null, updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : null }
        : null,
    };
  }

  static async createPaper(
    schoolId: string,
    userId: string,
    userRole: string,
    data: CreatePaperInput,
    isStandaloneTeacher = false,
  ) {
    const normalised = await normaliseSubjectGradeIds(
      schoolId, data.subjectId, data.gradeId,
    );
    data.subjectId = normalised.subjectId;
    data.gradeId = normalised.gradeId;
    await verifyPaperRefs(schoolId, data.subjectId, data.gradeId, data.topicIds);
    await assertCanCreateForSubjectGrade(
      schoolId,
      userId,
      userRole,
      data.subjectId,
      data.gradeId,
      isStandaloneTeacher,
    );

    const { sections, actualMarks } = buildPaperSections(data);
    await assertSectionNodes(sections, schoolId);
    const paper = await AssessmentPaper.create({
      schoolId: toObjectId(schoolId),
      title: data.title,
      subjectId: toObjectId(data.subjectId),
      gradeId: toObjectId(data.gradeId),
      topicIds: normaliseTopicIds(data.topicIds),
      term: data.term,
      year: data.year,
      paperType: data.paperType,
      totalMarks: actualMarks || data.totalMarks,
      duration: data.duration,
      difficulty: data.difficulty,
      aiGenerated: data.aiGenerated ?? false,
      sections,
      instructions: data.instructions,
      capsCompliance: null,
      status: 'draft',
      createdBy: toObjectId(userId),
    });

    await PaperMemo.create({
      paperId: paper._id,
      schoolId: toObjectId(schoolId),
      teacherId: toObjectId(userId),
      sections: memoSectionsFromPaper(sections),
      totalMarks: actualMarks || data.totalMarks,
      status: 'draft',
    });

    return paper.toObject();
  }

  static async updatePaper(
    id: string,
    schoolId: string,
    userId: string,
    userRole: string,
    data: UpdatePaperInput,
    isStandaloneTeacher = false,
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

    let nextSubjectId = data.subjectId ?? String(paper.subjectId);
    let nextGradeId = data.gradeId ?? String(paper.gradeId);
    const nextTopicIds = data.topicIds ?? (paper.topicIds ?? []).map((id) => String(id));
    if (data.subjectId || data.gradeId || data.topicIds) {
      const normalised = await normaliseSubjectGradeIds(schoolId, nextSubjectId, nextGradeId);
      nextSubjectId = normalised.subjectId;
      nextGradeId = normalised.gradeId;
      if (data.subjectId) data.subjectId = nextSubjectId;
      if (data.gradeId) data.gradeId = nextGradeId;
      await verifyPaperRefs(schoolId, nextSubjectId, nextGradeId, nextTopicIds);
      await assertCanCreateForSubjectGrade(
        schoolId,
        userId,
        userRole,
        nextSubjectId,
        nextGradeId,
        isStandaloneTeacher,
      );
    }

    const fields = [
      'title',
      'subjectId',
      'gradeId',
      'topicIds',
      'term',
      'year',
      'paperType',
      'duration',
      'difficulty',
      'totalMarks',
      'instructions',
    ] as const;
    const update: Record<string, unknown> = {};
    for (const key of fields) {
      if (data[key] !== undefined) update[key] = data[key];
    }
    if (data.subjectId) update.subjectId = toObjectId(data.subjectId);
    if (data.gradeId) update.gradeId = toObjectId(data.gradeId);
    if (data.topicIds) update.topicIds = normaliseTopicIds(data.topicIds);
    if (data.sections) {
      const { sections, actualMarks } = buildPaperSections(data);
      await assertSectionNodes(sections, schoolId);
      update.sections = carryQuestionTags(paper.sections ?? [], sections);
      update.totalMarks = actualMarks || data.totalMarks || 0;
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
