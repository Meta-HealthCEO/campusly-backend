import mongoose from 'mongoose';
import { Textbook } from './model.js';
import type { IChapter, ITextbook } from './model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { Grade, Subject } from '../Academic/model.js';
import { resolveAcademicFilterIds } from '../Academic/services/global-academic-lookup.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { CurriculumFramework } from '../TeacherWorkbench/model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { escapeRegex } from '../../common/utils.js';
import {
  schoolObjectId,
  textbookMutationFilter,
  textbookVisibilityFilter,
  toObjectId,
  type TextbookActor,
} from './service-access.js';
import type {
  CreateTextbookInput,
  UpdateTextbookInput,
  AddChapterInput,
  UpdateChapterInput,
  TextbookQueryInput,
} from './validation.js';

const POPULATE_DETAIL = [
  { path: 'chapters.resources.resourceId', select: 'title type format status' },
  { path: 'chapters.curriculumNodeId', select: 'title code type' },
  { path: 'subjectId', select: 'name' },
  { path: 'gradeId', select: 'name level' },
  { path: 'frameworkId', select: 'name' },
  { path: 'createdBy', select: 'firstName lastName email' },
];

interface AcademicSubjectRef {
  _id: mongoose.Types.ObjectId;
  name: string;
  schoolId?: mongoose.Types.ObjectId | null;
  gradeIds?: mongoose.Types.ObjectId[];
  curriculumNodeId?: mongoose.Types.ObjectId | null;
}

interface AcademicGradeRef {
  _id: mongoose.Types.ObjectId;
  name: string;
  schoolId?: mongoose.Types.ObjectId | null;
  curriculumNodeId?: mongoose.Types.ObjectId | null;
}

interface TextbookAcademicRefs {
  frameworkId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  gradeId: mongoose.Types.ObjectId;
  subjectNodeId: mongoose.Types.ObjectId | null;
  gradeNodeId: mongoose.Types.ObjectId | null;
}

function sameId(
  a: mongoose.Types.ObjectId | string | null | undefined,
  b: mongoose.Types.ObjectId | string | null | undefined,
): boolean {
  return !!a && !!b && a.toString() === b.toString();
}

function exactRegex(value: string): RegExp {
  return new RegExp(`^${escapeRegex(value)}$`, 'i');
}

function isScopedToSchool(
  docSchoolId: mongoose.Types.ObjectId | null | undefined,
  schoolId: mongoose.Types.ObjectId,
): boolean {
  return !docSchoolId || sameId(docSchoolId, schoolId);
}

function includesObjectId(
  values: mongoose.Types.ObjectId[] | undefined,
  value: mongoose.Types.ObjectId,
): boolean {
  return (values ?? []).some((id) => sameId(id, value));
}

async function findSubjectNodeIdByName(name: string): Promise<mongoose.Types.ObjectId | null> {
  const node = await CurriculumNode.findOne({
    type: 'subject',
    isDeleted: false,
    title: exactRegex(name),
  })
    .select('_id')
    .lean<{ _id: mongoose.Types.ObjectId } | null>();
  return node?._id ?? null;
}

async function findGradeNodeIdByName(name: string): Promise<mongoose.Types.ObjectId | null> {
  const node = await CurriculumNode.findOne({
    type: 'grade',
    isDeleted: false,
    title: exactRegex(name),
  })
    .select('_id')
    .lean<{ _id: mongoose.Types.ObjectId } | null>();
  return node?._id ?? null;
}

async function resolveTextbookAcademicRefs(
  actor: TextbookActor,
  data: Pick<CreateTextbookInput, 'frameworkId' | 'subjectId' | 'gradeId'>,
): Promise<TextbookAcademicRefs> {
  const schoolId = schoolObjectId(actor);
  const frameworkId = toObjectId(data.frameworkId, 'frameworkId');
  const subjectId = toObjectId(data.subjectId, 'subjectId');
  const gradeId = toObjectId(data.gradeId, 'gradeId');

  const [framework, subject, grade] = await Promise.all([
    CurriculumFramework.findOne({ _id: frameworkId, isDeleted: false })
      .select('_id schoolId')
      .lean<{ _id: mongoose.Types.ObjectId; schoolId: mongoose.Types.ObjectId | null } | null>(),
    Subject.findOne({ _id: subjectId, isDeleted: false })
      .select('_id name schoolId gradeIds curriculumNodeId')
      .lean<AcademicSubjectRef | null>(),
    Grade.findOne({ _id: gradeId, isDeleted: false })
      .select('_id name schoolId curriculumNodeId')
      .lean<AcademicGradeRef | null>(),
  ]);

  if (!framework || !isScopedToSchool(framework.schoolId, schoolId)) {
    throw new BadRequestError('Framework does not belong to this school');
  }
  if (!subject || !isScopedToSchool(subject.schoolId, schoolId)) {
    throw new BadRequestError('Subject does not belong to this school');
  }
  if (!grade || !isScopedToSchool(grade.schoolId, schoolId)) {
    throw new BadRequestError('Grade does not belong to this school');
  }
  if ((subject.gradeIds ?? []).length > 0 && !includesObjectId(subject.gradeIds, gradeId)) {
    throw new BadRequestError('Subject is not offered for this grade');
  }

  return {
    frameworkId,
    subjectId,
    gradeId,
    subjectNodeId: subject.curriculumNodeId ?? await findSubjectNodeIdByName(subject.name),
    gradeNodeId: grade.curriculumNodeId ?? await findGradeNodeIdByName(grade.name),
  };
}

async function resolveChapterCurriculumNode(
  textbook: ITextbook,
  actor: TextbookActor,
  curriculumNodeId: string | null | undefined,
): Promise<mongoose.Types.ObjectId | null> {
  if (!curriculumNodeId) return null;
  const nodeId = toObjectId(curriculumNodeId, 'curriculumNodeId');
  const schoolId = schoolObjectId(actor);
  const node = await CurriculumNode.findOne({ _id: nodeId, isDeleted: false })
    .select('_id frameworkId schoolId subjectId gradeId')
    .lean<{
      _id: mongoose.Types.ObjectId;
      frameworkId: mongoose.Types.ObjectId;
      schoolId: mongoose.Types.ObjectId | null;
      subjectId: mongoose.Types.ObjectId | null;
      gradeId: mongoose.Types.ObjectId | null;
    } | null>();

  if (!node || !isScopedToSchool(node.schoolId, schoolId)) {
    throw new BadRequestError('Curriculum node does not belong to this school');
  }
  if (!sameId(node.frameworkId, textbook.frameworkId)) {
    throw new BadRequestError('Curriculum node does not belong to this framework');
  }
  if (textbook.subjectNodeId && node.subjectId && !sameId(node.subjectId, textbook.subjectNodeId)) {
    throw new BadRequestError('Curriculum node does not match the textbook subject');
  }
  if (textbook.gradeNodeId && node.gradeId && !sameId(node.gradeId, textbook.gradeNodeId)) {
    throw new BadRequestError('Curriculum node does not match the textbook grade');
  }

  return nodeId;
}

function hasChapterWithResource(textbook: ITextbook): boolean {
  return textbook.chapters.some((ch: IChapter) => ch.resources.length >= 1);
}

function assertPublishable(textbook: ITextbook): void {
  if (!hasChapterWithResource(textbook)) {
    throw new BadRequestError(
      'Textbook must have at least one chapter with at least one resource to publish',
    );
  }
}

function assertPublishedRemovalInvariant(
  textbook: ITextbook,
  predicate: (chapter: IChapter, resourceId: mongoose.Types.ObjectId) => boolean,
): void {
  if (textbook.status !== 'published') return;

  const hasRemainingResource = textbook.chapters.some((chapter: IChapter) =>
    chapter.resources.some((resource) => predicate(chapter, resource.resourceId)),
  );

  if (!hasRemainingResource) {
    throw new BadRequestError(
      'Published textbooks must retain at least one chapter resource',
    );
  }
}

async function assertResourceMatchesTextbook(
  textbook: ITextbook,
  resource: {
    subjectId: mongoose.Types.ObjectId;
    gradeId: mongoose.Types.ObjectId;
  },
): Promise<void> {
  const { subjectIds, gradeIds } = await resolveAcademicFilterIds({
    subjectId: textbook.subjectId.toString(),
    gradeId: textbook.gradeId.toString(),
  });

  const subjectMatches = (subjectIds ?? [textbook.subjectId])
    .some((id) => sameId(id, resource.subjectId));
  const gradeMatches = (gradeIds ?? [textbook.gradeId])
    .some((id) => sameId(id, resource.gradeId));

  if (!subjectMatches || !gradeMatches) {
    throw new BadRequestError('Resource does not match the textbook subject and grade');
  }
}

async function getMutableTextbookOrThrow(id: string, actor: TextbookActor) {
  const textbook = await Textbook.findOne({
    _id: toObjectId(id, 'textbookId'),
    ...textbookMutationFilter(actor),
  });
  if (!textbook) throw new NotFoundError('Textbook not found');
  return textbook;
}

export class TextbookService {
  static async listTextbooks(actor: TextbookActor, filters: TextbookQueryInput) {
    const { subjectIds, gradeIds } = await resolveAcademicFilterIds({
      subjectId: filters.subjectId,
      gradeId: filters.gradeId,
    });
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(Math.max(filters.limit ?? 200, 1), 1000);
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = textbookVisibilityFilter(actor);

    if (filters.frameworkId) {
      query.frameworkId = toObjectId(filters.frameworkId, 'frameworkId');
    }
    if (subjectIds) query.subjectId = { $in: subjectIds };
    if (gradeIds) query.gradeId = { $in: gradeIds };
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.title = { $regex: escapeRegex(filters.search), $options: 'i' };
    }

    const [textbooks, total] = await Promise.all([
      Textbook.find(query)
        .select('-chapters.resources')
        .populate([
          { path: 'subjectId', select: 'name' },
          { path: 'gradeId', select: 'name level' },
          { path: 'frameworkId', select: 'name' },
          { path: 'createdBy', select: 'firstName lastName' },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Textbook.countDocuments(query),
    ]);

    return { textbooks, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getTextbook(id: string, actor: TextbookActor) {
    const textbook = await Textbook.findOne({
      _id: toObjectId(id, 'textbookId'),
      ...textbookVisibilityFilter(actor),
    })
      .populate(POPULATE_DETAIL)
      .lean();
    if (!textbook) throw new NotFoundError('Textbook not found');
    return textbook;
  }

  static async createTextbook(
    actor: TextbookActor,
    data: CreateTextbookInput,
  ) {
    const refs = await resolveTextbookAcademicRefs(actor, data);
    const textbook = await Textbook.create({
      ...data,
      ...refs,
      schoolId: schoolObjectId(actor),
      createdBy: toObjectId(actor.id, 'createdBy'),
      status: 'draft',
    });
    return textbook.toObject();
  }

  static async updateTextbook(
    id: string,
    actor: TextbookActor,
    data: UpdateTextbookInput,
  ) {
    const textbook = await getMutableTextbookOrThrow(id, actor);

    if (data.status === 'published' && textbook.status !== 'published') {
      assertPublishable(textbook);
    }

    Object.assign(textbook, data);
    await textbook.save();
    return textbook.toObject();
  }

  static async deleteTextbook(id: string, actor: TextbookActor) {
    const textbook = await getMutableTextbookOrThrow(id, actor);
    textbook.isDeleted = true;
    await textbook.save();
    return { deleted: true };
  }

  static async addChapter(
    id: string,
    actor: TextbookActor,
    data: AddChapterInput,
  ) {
    const textbook = await getMutableTextbookOrThrow(id, actor);
    const curriculumNodeId = await resolveChapterCurriculumNode(
      textbook,
      actor,
      data.curriculumNodeId,
    );

    textbook.chapters.push({
      _id: new mongoose.Types.ObjectId(),
      title: data.title,
      description: data.description ?? '',
      curriculumNodeId,
      order: data.order,
      resources: [],
    });
    await textbook.save();
    return textbook.chapters[textbook.chapters.length - 1];
  }

  static async updateChapter(
    id: string,
    actor: TextbookActor,
    chapterId: string,
    data: UpdateChapterInput,
  ) {
    const textbook = await getMutableTextbookOrThrow(id, actor);
    const normalizedChapterId = toObjectId(chapterId, 'chapterId').toString();
    const chapter = textbook.chapters.id(normalizedChapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');

    if (data.title !== undefined) chapter.title = data.title;
    if (data.description !== undefined) chapter.description = data.description;
    if (data.curriculumNodeId !== undefined) {
      chapter.curriculumNodeId = await resolveChapterCurriculumNode(
        textbook,
        actor,
        data.curriculumNodeId,
      );
    }
    if (data.order !== undefined) chapter.order = data.order;
    await textbook.save();
    return chapter;
  }

  static async removeChapter(
    id: string,
    actor: TextbookActor,
    chapterId: string,
  ) {
    const textbook = await getMutableTextbookOrThrow(id, actor);
    const normalizedChapterId = toObjectId(chapterId, 'chapterId').toString();
    const chapter = textbook.chapters.id(normalizedChapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');

    assertPublishedRemovalInvariant(
      textbook,
      (candidateChapter) => candidateChapter._id.toString() !== normalizedChapterId,
    );

    textbook.chapters.pull({ _id: normalizedChapterId });
    await textbook.save();
    return { removed: true };
  }

  static async addResourceToChapter(
    id: string,
    actor: TextbookActor,
    chapterId: string,
    resourceId: string,
    order: number,
  ) {
    const textbook = await getMutableTextbookOrThrow(id, actor);
    const normalizedChapterId = toObjectId(chapterId, 'chapterId').toString();
    const chapter = textbook.chapters.id(normalizedChapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');

    const schoolId = schoolObjectId(actor);
    const resourceOid = toObjectId(resourceId, 'resourceId');
    const resource = await ContentResource.findOne({
      _id: resourceOid,
      isDeleted: false,
      status: 'approved',
      $or: [{ schoolId: null }, { schoolId }],
    })
      .select('_id subjectId gradeId')
      .lean<{
        _id: mongoose.Types.ObjectId;
        subjectId: mongoose.Types.ObjectId;
        gradeId: mongoose.Types.ObjectId;
      } | null>();
    if (!resource) throw new NotFoundError('Resource not found');
    await assertResourceMatchesTextbook(textbook, resource);

    const exists = chapter.resources.some(
      (r: { resourceId: mongoose.Types.ObjectId; order: number }) =>
        r.resourceId.toString() === resourceOid.toString(),
    );
    if (exists) throw new BadRequestError('Resource already in chapter');

    chapter.resources.push({ resourceId: resourceOid, order });
    await textbook.save();
    return chapter.resources;
  }

  static async removeResourceFromChapter(
    id: string,
    actor: TextbookActor,
    chapterId: string,
    resourceId: string,
  ) {
    const textbook = await getMutableTextbookOrThrow(id, actor);
    const normalizedChapterId = toObjectId(chapterId, 'chapterId').toString();
    const resourceOid = toObjectId(resourceId, 'resourceId');
    const chapter = textbook.chapters.id(normalizedChapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');

    const idx = chapter.resources.findIndex(
      (r: { resourceId: mongoose.Types.ObjectId; order: number }) =>
        r.resourceId.toString() === resourceOid.toString(),
    );
    if (idx === -1) throw new NotFoundError('Resource not in chapter');

    assertPublishedRemovalInvariant(
      textbook,
      (candidateChapter, candidateResourceId) =>
        candidateChapter._id.toString() !== normalizedChapterId
        || candidateResourceId.toString() !== resourceOid.toString(),
    );

    chapter.resources.splice(idx, 1);
    await textbook.save();
    return { removed: true };
  }

  static async reorderChapters(
    id: string,
    actor: TextbookActor,
    chapterIds: string[],
  ) {
    const textbook = await getMutableTextbookOrThrow(id, actor);
    const normalizedChapterIds = chapterIds.map((cid) => toObjectId(cid, 'chapterId').toString());

    if (normalizedChapterIds.length !== textbook.chapters.length) {
      throw new BadRequestError(
        'chapterIds must include all chapter IDs exactly once',
      );
    }

    const uniqueIds = new Set(normalizedChapterIds);
    if (uniqueIds.size !== normalizedChapterIds.length) {
      throw new BadRequestError(
        'chapterIds must include all chapter IDs exactly once',
      );
    }

    const chapterMap = new Map<string, IChapter>(
      textbook.chapters.map((ch: IChapter) => [ch._id.toString(), ch]),
    );

    for (const cid of normalizedChapterIds) {
      if (!chapterMap.has(cid)) {
        throw new BadRequestError(`Chapter ${cid} not found in textbook`);
      }
    }

    normalizedChapterIds.forEach((cid, idx) => {
      const ch = chapterMap.get(cid)!;
      ch.order = idx;
    });

    textbook.chapters.sort((a: IChapter, b: IChapter) => a.order - b.order);
    await textbook.save();
    return textbook.chapters;
  }

  static async publishTextbook(id: string, actor: TextbookActor) {
    const textbook = await getMutableTextbookOrThrow(id, actor);
    assertPublishable(textbook);
    textbook.status = 'published';
    await textbook.save();
    return textbook.toObject();
  }
}
