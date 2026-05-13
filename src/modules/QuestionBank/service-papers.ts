import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import type { IPaperQuestion } from './model.js';
import { PaperMemo } from '../TeacherWorkbench/model.assessment.js';
import { Class, Grade, Subject, Timetable } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { resolveAcademicAncestor } from '../CurriculumStructure/service-academic-bridge.js';
import {
  ensureGradeForCurriculumNode,
  ensureSubjectForCurriculumNode,
} from '../Academic/services/materialise-from-curriculum.service.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors.js';
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

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

/**
 * Defensive lazy bridge for the unusual case where a request arrives with
 * CurriculumNode IDs instead of school-side Subject/Grade IDs.
 *
 * The eager materialisation in TeacherSettingsService.updateTeachingScope
 * (and the boot-time backfill migration) means standalone teachers always
 * have matching school rows. This function exists in case a request still
 * arrives stale — e.g. from a client cached before the refactor — and to
 * keep paper generation forward-compatible if a future flow ever passes
 * curriculum IDs directly.
 *
 * Pass-through when the IDs are already valid school-side rows; otherwise
 * resolve via ensureGradeForCurriculumNode / ensureSubjectForCurriculumNode.
 */
export async function normaliseSubjectGradeIds(
  schoolId: string,
  subjectId: string,
  gradeId: string,
): Promise<{ subjectId: string; gradeId: string }> {
  const soid = toObjectId(schoolId);

  let resolvedGradeId: string;
  const directGrade = await Grade.findOne({
    _id: toObjectId(gradeId), schoolId: soid, isDeleted: false,
  }).select('_id').lean();
  if (directGrade) {
    resolvedGradeId = String(directGrade._id);
  } else {
    const grade = await ensureGradeForCurriculumNode(soid, gradeId);
    resolvedGradeId = String(grade._id);
  }

  let resolvedSubjectId: string;
  const directSubject = await Subject.findOne({
    _id: toObjectId(subjectId), schoolId: soid, isDeleted: false,
  }).select('_id').lean();
  if (directSubject) {
    resolvedSubjectId = String(directSubject._id);
  } else {
    const subject = await ensureSubjectForCurriculumNode(
      soid, subjectId, toObjectId(resolvedGradeId),
    );
    resolvedSubjectId = String(subject._id);
  }

  // Defensive — ensure Subject.gradeIds includes the resolved grade even
  // when both IDs were passed in directly. verifyPaperRefs rejects otherwise.
  await Subject.updateOne(
    {
      _id: toObjectId(resolvedSubjectId),
      schoolId: soid,
      gradeIds: { $ne: toObjectId(resolvedGradeId) },
    },
    { $addToSet: { gradeIds: toObjectId(resolvedGradeId) } },
  );

  return { subjectId: resolvedSubjectId, gradeId: resolvedGradeId };
}

function normaliseTopicIds(topicIds: string[]): mongoose.Types.ObjectId[] {
  return Array.from(new Set(topicIds)).map((id) => toObjectId(id));
}

export async function assertCanCreateForSubjectGrade(
  schoolId: string,
  userId: string,
  userRole: string,
  subjectId: string,
  gradeId: string,
  isStandaloneTeacher = false,
): Promise<void> {
  if (REVIEW_ROLES.includes(userRole)) return;
  // Standalone teachers run a single-teacher school — they're the only
  // teacher for every subject and grade by definition, so the Class/Timetable
  // assignment check below doesn't apply.
  if (isStandaloneTeacher) return;

  const matchingClasses = await Class.find({
    schoolId: toObjectId(schoolId),
    gradeId: toObjectId(gradeId),
    isDeleted: false,
  }).select('_id teacherId').lean();

  const classIds = matchingClasses.map((cls) => cls._id);
  if (classIds.length === 0) {
    throw new ForbiddenError('You are not assigned to this grade');
  }

  const isHomeroomTeacher = matchingClasses.some(
    (cls) => String(cls.teacherId) === userId,
  );
  if (isHomeroomTeacher) return;

  const teachesSubject = await Timetable.exists({
    schoolId: toObjectId(schoolId),
    teacherId: toObjectId(userId),
    subjectId: toObjectId(subjectId),
    classId: { $in: classIds },
    isDeleted: false,
  });

  if (!teachesSubject) {
    throw new ForbiddenError('You can only create papers for subjects and grades you teach');
  }
}

export async function verifyPaperRefs(
  schoolId: string,
  subjectId: string,
  gradeId: string,
  topicIds: string[],
): Promise<void> {
  const soid = toObjectId(schoolId);
  const suboid = toObjectId(subjectId);
  const groid = toObjectId(gradeId);
  const topicOids = normaliseTopicIds(topicIds);

  const [subject, grade] = await Promise.all([
    Subject.findOne({ _id: suboid, schoolId: soid, isDeleted: false }).select('gradeIds').lean(),
    Grade.findOne({ _id: groid, schoolId: soid, isDeleted: false }).select('_id').lean(),
  ]);

  if (!grade) throw new BadRequestError('Grade does not belong to this school');
  if (!subject) throw new BadRequestError('Subject does not belong to this school');

  const subjectGradeIds = (subject.gradeIds ?? []).map((id) => String(id));
  if (subjectGradeIds.length > 0 && !subjectGradeIds.includes(String(groid))) {
    throw new BadRequestError('Subject is not available for the selected grade');
  }

  const [subjectNodeIds, gradeNodeIds] = await Promise.all([
    resolveAcademicAncestor(subjectId, 'subject', soid),
    resolveAcademicAncestor(gradeId, 'grade', soid),
  ]);

  if (subjectNodeIds === null || gradeNodeIds === null) {
    throw new BadRequestError('No curriculum topics found for the selected subject and grade');
  }

  const subjectSet = new Set((subjectNodeIds ?? []).map((id) => id.toString()));
  const gradeSet = new Set((gradeNodeIds ?? []).map((id) => id.toString()));
  const constrainedIds = topicOids.filter((id) => {
    const value = id.toString();
    const subjectOk = subjectSet.size === 0 || subjectSet.has(value);
    const gradeOk = gradeSet.size === 0 || gradeSet.has(value);
    return subjectOk && gradeOk;
  });

  if (constrainedIds.length !== topicOids.length) {
    throw new BadRequestError('One or more topics do not match the selected subject and grade');
  }

  // The wizard's CurriculumTreeBrowser lets the user select topic, subtopic,
  // or outcome nodes — all three are valid "topic" inputs for paper
  // generation. Restricting to `type: 'topic'` here rejects any subtopic
  // selection with "One or more curriculum topics are unavailable".
  const visibleTopics = await CurriculumNode.countDocuments({
    _id: { $in: topicOids },
    type: { $in: ['topic', 'subtopic', 'outcome'] },
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: soid }],
  });
  if (visibleTopics !== topicOids.length) {
    throw new BadRequestError('One or more curriculum topics are unavailable');
  }
}

function buildPaperSections(data: CreatePaperInput | UpdatePaperInput): {
  sections: Array<{
    title: string;
    instructions?: string;
    order: number;
    questions: IPaperQuestion[];
  }>;
  actualMarks: number;
} {
  const sections = (data.sections ?? []).map((section, sectionIndex) => {
    const questions = (section.questions ?? []).map((question, questionIndex) => ({
      questionId: question.questionId ? toObjectId(question.questionId) : null,
      questionText: question.questionText ?? null,
      options: question.options ?? [],
      marks: question.marks,
      position: questionIndex,
      modelAnswer: question.modelAnswer ?? null,
      markingGuideline: question.markingGuideline ?? null,
      diagram: question.diagram
        ? {
            tikz: question.diagram.tikz,
            caption: question.diagram.caption ?? null,
            svgUrl: null,
            renderStatus: 'pending' as const,
          }
        : null,
    }));

    return {
      title: section.title,
      instructions: section.instructions,
      order: sectionIndex,
      questions,
    };
  });

  const actualMarks = sections.reduce(
    (sum, section) => sum + section.questions.reduce((total, question) => total + question.marks, 0),
    0,
  );

  return { sections, actualMarks };
}

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
      sections: sections.map((section) => ({
        sectionTitle: section.title,
        answers: section.questions.map((question) => ({
          questionNumber: `${section.order + 1}.${question.position + 1}`,
          expectedAnswer: question.modelAnswer ?? '',
          markAllocation: [
            { criterion: question.markingGuideline ?? 'Full marks', marks: question.marks },
          ],
          commonMistakes: [],
          acceptableAlternatives: [],
        })),
      })),
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
      update.sections = sections;
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
