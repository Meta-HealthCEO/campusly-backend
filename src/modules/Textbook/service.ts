import mongoose from 'mongoose';
import { Textbook } from './model.js';
import type { IChapter } from './model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper, escapeRegex } from '../../common/utils.js';
import type {
  CreateTextbookInput,
  UpdateTextbookInput,
  AddChapterInput,
  UpdateChapterInput,
  TextbookQueryInput,
} from './validation.js';

// ─── Populate Config ───────────────────────────────────────────────────────

const POPULATE_DETAIL = [
  { path: 'chapters.resources.resourceId', select: 'title type format' },
  { path: 'chapters.curriculumNodeId', select: 'title code' },
  { path: 'subjectId', select: 'name' },
  { path: 'gradeId', select: 'name level' },
  { path: 'frameworkId', select: 'name' },
  { path: 'createdBy', select: 'firstName lastName email' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

async function getTextbookOrThrow(
  id: string,
  schoolId: string,
) {
  const oid = new mongoose.Types.ObjectId(id);
  const soid = new mongoose.Types.ObjectId(schoolId);
  const textbook = await Textbook.findOne({
    _id: oid,
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: soid }],
  });
  if (!textbook) throw new NotFoundError('Textbook not found');
  return textbook;
}

async function getOwnedTextbookOrThrow(id: string, schoolId: string) {
  const oid = new mongoose.Types.ObjectId(id);
  const soid = new mongoose.Types.ObjectId(schoolId);
  const textbook = await Textbook.findOne({
    _id: oid,
    schoolId: soid,
    isDeleted: false,
  });
  if (!textbook) throw new NotFoundError('Textbook not found');
  return textbook;
}

// ─── Service ───────────────────────────────────────────────────────────────

export class TextbookService {
  static async listTextbooks(schoolId: string, filters: TextbookQueryInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = {
      isDeleted: false,
      $or: [
        { schoolId: null, status: 'published' },
        { schoolId: soid },
      ],
    };

    if (filters.frameworkId) {
      query.frameworkId = new mongoose.Types.ObjectId(filters.frameworkId);
    }
    if (filters.subjectId) {
      query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    }
    if (filters.gradeId) {
      query.gradeId = new mongoose.Types.ObjectId(filters.gradeId);
    }
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.title = { $regex: escapeRegex(filters.search), $options: 'i' };
    }

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

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

    return { textbooks, total, page: filters.page ?? 1, limit };
  }

  static async getTextbook(id: string, schoolId: string) {
    const doc = await getTextbookOrThrow(id, schoolId);

    const textbook = await Textbook.findById(doc._id)
      .populate(POPULATE_DETAIL)
      .lean();

    return textbook;
  }

  static async createTextbook(
    schoolId: string,
    userId: string,
    data: CreateTextbookInput,
  ) {
    const textbook = await Textbook.create({
      ...data,
      frameworkId: new mongoose.Types.ObjectId(data.frameworkId),
      subjectId: new mongoose.Types.ObjectId(data.subjectId),
      gradeId: new mongoose.Types.ObjectId(data.gradeId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    return textbook.toObject();
  }

  static async updateTextbook(
    id: string,
    schoolId: string,
    _userId: string,
    data: UpdateTextbookInput,
  ) {
    const textbook = await getOwnedTextbookOrThrow(id, schoolId);
    Object.assign(textbook, data);
    await textbook.save();
    return textbook.toObject();
  }

  static async deleteTextbook(id: string, schoolId: string, _userId: string) {
    const textbook = await getOwnedTextbookOrThrow(id, schoolId);
    textbook.isDeleted = true;
    await textbook.save();
    return { deleted: true };
  }

  // ─── Chapters ──────────────────────────────────────────────────────────

  static async addChapter(
    id: string,
    schoolId: string,
    _userId: string,
    data: AddChapterInput,
  ) {
    const textbook = await getOwnedTextbookOrThrow(id, schoolId);
    textbook.chapters.push({
      _id: new mongoose.Types.ObjectId(),
      title: data.title,
      description: data.description ?? '',
      curriculumNodeId: data.curriculumNodeId
        ? new mongoose.Types.ObjectId(data.curriculumNodeId)
        : null,
      order: data.order,
      resources: [],
    });
    await textbook.save();
    return textbook.chapters[textbook.chapters.length - 1];
  }

  static async updateChapter(
    id: string,
    schoolId: string,
    _userId: string,
    chapterId: string,
    data: UpdateChapterInput,
  ) {
    const textbook = await getOwnedTextbookOrThrow(id, schoolId);
    const chapter = textbook.chapters.id(chapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');
    if (data.title !== undefined) chapter.title = data.title;
    if (data.description !== undefined) chapter.description = data.description;
    if (data.order !== undefined) chapter.order = data.order;
    await textbook.save();
    return chapter;
  }

  static async removeChapter(
    id: string,
    schoolId: string,
    _userId: string,
    chapterId: string,
  ) {
    const textbook = await getOwnedTextbookOrThrow(id, schoolId);
    const chapter = textbook.chapters.id(chapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');
    textbook.chapters.pull({ _id: chapterId });
    await textbook.save();
    return { removed: true };
  }

  // ─── Chapter Resources ─────────────────────────────────────────────────

  static async addResourceToChapter(
    id: string,
    schoolId: string,
    _userId: string,
    chapterId: string,
    resourceId: string,
    order: number,
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const roid = new mongoose.Types.ObjectId(resourceId);

    // Verify resource exists and belongs to school (or is system)
    const resource = await ContentResource.findOne({
      _id: roid,
      isDeleted: false,
      $or: [{ schoolId: null }, { schoolId: soid }],
    }).lean();
    if (!resource) throw new NotFoundError('Resource not found');

    const textbook = await getOwnedTextbookOrThrow(id, schoolId);
    const chapter = textbook.chapters.id(chapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');

    // Prevent duplicates
    const exists = chapter.resources.some(
      (r: { resourceId: mongoose.Types.ObjectId; order: number }) =>
        r.resourceId.toString() === resourceId,
    );
    if (exists) throw new BadRequestError('Resource already in chapter');

    chapter.resources.push({ resourceId: roid, order });
    await textbook.save();
    return chapter.resources;
  }

  static async removeResourceFromChapter(
    id: string,
    schoolId: string,
    _userId: string,
    chapterId: string,
    resourceId: string,
  ) {
    const textbook = await getOwnedTextbookOrThrow(id, schoolId);
    const chapter = textbook.chapters.id(chapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');

    const idx = chapter.resources.findIndex(
      (r: { resourceId: mongoose.Types.ObjectId; order: number }) =>
        r.resourceId.toString() === resourceId,
    );
    if (idx === -1) throw new NotFoundError('Resource not in chapter');
    chapter.resources.splice(idx, 1);
    await textbook.save();
    return { removed: true };
  }

  // ─── Reorder & Publish ─────────────────────────────────────────────────

  static async reorderChapters(
    id: string,
    schoolId: string,
    _userId: string,
    chapterIds: string[],
  ) {
    const textbook = await getOwnedTextbookOrThrow(id, schoolId);

    if (chapterIds.length !== textbook.chapters.length) {
      throw new BadRequestError(
        'chapterIds must include all chapter IDs exactly once',
      );
    }

    const chapterMap = new Map<string, IChapter>(
      textbook.chapters.map((ch: IChapter) => [ch._id.toString(), ch]),
    );

    for (const cid of chapterIds) {
      if (!chapterMap.has(cid)) {
        throw new BadRequestError(`Chapter ${cid} not found in textbook`);
      }
    }

    chapterIds.forEach((cid, idx) => {
      const ch = chapterMap.get(cid)!;
      ch.order = idx;
    });

    // Sort chapters array by new order
    textbook.chapters.sort((a: IChapter, b: IChapter) => a.order - b.order);
    await textbook.save();
    return textbook.chapters;
  }

  static async publishTextbook(id: string, schoolId: string, _userId: string) {
    const textbook = await getOwnedTextbookOrThrow(id, schoolId);

    const hasChapterWithResource = textbook.chapters.some(
      (ch: IChapter) => ch.resources.length >= 1,
    );
    if (!hasChapterWithResource) {
      throw new BadRequestError(
        'Textbook must have at least one chapter with at least one resource to publish',
      );
    }

    textbook.status = 'published';
    await textbook.save();
    return textbook.toObject();
  }
}
