import mongoose from 'mongoose';
import { Lesson } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { NotFoundError } from '../../common/errors.js';
import type { ILesson } from './types.js';
import { LESSON_PHASES } from './types.js';
import {
  assertCanUseClasses,
  canManageAllLessons,
  isLessonActor,
  lessonAccessFilter,
  schoolObjectId,
  toObjectId,
  type LessonActor,
  type LessonScope,
} from './service-access.js';
import type {
  CreateLessonInput,
  UpdateLessonInput,
  ListLessonsInput,
} from './validation.js';

export interface RecentTopicSummary {
  id: string;
  title: string;
  termNumber: number | null;
  subjectId: string | null;
  gradeId: string | null;
}

export class LessonService {
  static async list(
    scope: LessonScope,
    filters: ListLessonsInput,
  ): Promise<{ items: ILesson[]; total: number; page: number; limit: number }> {
    const query = lessonAccessFilter(scope);
    if (
      filters.teacherId
      && (!isLessonActor(scope) || scope.role !== 'teacher' || canManageAllLessons(scope))
    ) {
      query.teacherId = toObjectId(filters.teacherId, 'teacherId');
    }
    if (filters.subjectId) query.subjectId = toObjectId(filters.subjectId, 'subjectId');
    if (filters.published !== undefined) {
      query.publishedAt = filters.published ? { $ne: null } : null;
    }

    // Class filter + date range now resolve via the assignedClasses subdoc.
    // When a classId is provided we use $elemMatch so the date filter (if any)
    // applies to the SAME assignment as the class — not just any assignment
    // that happens to satisfy either constraint independently.
    if (filters.classId || filters.dateFrom || filters.dateTo) {
      const elem: Record<string, unknown> = {};
      if (filters.classId) elem.classId = toObjectId(filters.classId, 'classId');
      if (filters.dateFrom || filters.dateTo) {
        const range: { $gte?: Date; $lte?: Date } = {};
        if (filters.dateFrom) range.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) range.$lte = new Date(filters.dateTo);
        elem.scheduledDate = range;
      }
      query.assignedClasses = { $elemMatch: elem };
    }
    if (filters.search) query.title = { $regex: filters.search, $options: 'i' };

    const skip = (filters.page - 1) * filters.limit;
    const [items, total] = await Promise.all([
      Lesson.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .populate('assignedClasses.classId', 'name')
        .populate('subjectId', 'name code')
        .populate({
          path: 'curriculumNodeId',
          select: 'title code subjectId gradeId',
          populate: [
            { path: 'subjectId', select: 'title code' },
            { path: 'gradeId', select: 'title code' },
          ],
        })
        .lean<ILesson[]>(),
      Lesson.countDocuments(query),
    ]);
    return { items, total, page: filters.page, limit: filters.limit };
  }

  static async getById(id: string, scope: LessonScope): Promise<ILesson> {
    const lesson = await Lesson.findOne({
      _id: toObjectId(id, 'lessonId'),
      ...lessonAccessFilter(scope),
    })
      .populate('assignedClasses.classId', 'name')
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name level')
      // Deep-populate curriculum node so the frontend can fall back to the
      // CAPS subject/grade titles when no academic Subject/Grade record
      // exists (standalone teacher portal — no school collections).
      .populate({
        path: 'curriculumNodeId',
        select: 'title code subjectId gradeId termNumber',
        populate: [
          { path: 'subjectId', select: 'title code' },
          { path: 'gradeId', select: 'title code' },
        ],
      })
      .populate('teacherId', 'firstName lastName email')
      .populate('materials.contentResourceId')
      .populate('materials.homeworkId')
      .populate('materials.paperId')
      .populate('materials.quizId')
      .populate('materials.questionIds')
      .populate('materials.comprehensionQuestionIds')
      .populate('materials.textbookRef.textbookId', 'title')
      .lean<ILesson>();
    if (!lesson) throw new NotFoundError('Lesson not found');
    return lesson;
  }

  static async create(
    data: CreateLessonInput,
    actor: LessonActor,
  ): Promise<ILesson> {
    const teacherId = actor.id;
    await assertCanUseClasses(
      actor,
      (data.assignedClasses ?? []).map((a) => a.classId),
    );

    const phases = LESSON_PHASES.map((p) => ({
      phase: p,
      materialIds: [] as mongoose.Types.ObjectId[],
    }));
    const materials: Record<string, unknown>[] = [];
    let aiGenerated = false;
    let objectives = data.objectives ?? [];

    if (data.scaffoldedOutline) {
      aiGenerated = true;
      objectives = data.scaffoldedOutline.objectives;
      for (const phaseEntry of data.scaffoldedOutline.phases) {
        const phaseIdx = phases.findIndex((p) => p.phase === phaseEntry.phase);
        if (phaseIdx === -1) continue;
        for (const sug of phaseEntry.suggestions) {
          const id = new mongoose.Types.ObjectId();
          materials.push({
            _id: id,
            kind: sug.kind,
            title: sug.title,
            teacherNotes: sug.notes,
          });
          phases[phaseIdx].materialIds.push(id);
        }
      }
    }

    // termNumber: prefer caller-supplied; otherwise derive from the topic's
    // denormalized termNumber. Either may be absent — that's fine.
    // Also derive subjectId/gradeId from the topic when the caller (a
    // standalone teacher with no school Subject/Grade docs) omitted them.
    let termNumber: number | null = data.termNumber ?? null;
    let subjectId: mongoose.Types.ObjectId | null = data.subjectId
      ? new mongoose.Types.ObjectId(data.subjectId)
      : null;
    let gradeId: mongoose.Types.ObjectId | null = data.gradeId
      ? new mongoose.Types.ObjectId(data.gradeId)
      : null;
    if (termNumber === null || !subjectId || !gradeId) {
      const node = await CurriculumNode.findById(data.curriculumNodeId)
        .select('termNumber subjectId gradeId')
        .lean<{
          termNumber?: number | null;
          subjectId?: mongoose.Types.ObjectId | null;
          gradeId?: mongoose.Types.ObjectId | null;
        } | null>();
      if (node) {
        if (termNumber === null && typeof node.termNumber === 'number') {
          termNumber = node.termNumber;
        }
        if (!subjectId && node.subjectId) subjectId = node.subjectId;
        if (!gradeId && node.gradeId) gradeId = node.gradeId;
      }
    }

    const assignedClasses = (data.assignedClasses ?? []).map((a) => ({
      classId: new mongoose.Types.ObjectId(a.classId),
      scheduledDate: new Date(a.scheduledDate),
      status: a.status,
    }));

    const lesson = await Lesson.create({
      schoolId: schoolObjectId(actor),
      teacherId: toObjectId(teacherId, 'teacherId'),
      subjectId,
      gradeId,
      curriculumNodeId: data.curriculumNodeId,
      termNumber,
      title: data.title,
      durationMinutes: data.durationMinutes,
      objectives,
      phases,
      materials,
      publishedAt: null,
      aiGenerated,
      assignedClasses,
    });
    return lesson.toObject() as ILesson;
  }

  static async update(
    id: string,
    scope: LessonScope,
    data: UpdateLessonInput,
  ): Promise<ILesson> {
    const updated = await Lesson.findOneAndUpdate(
      { _id: toObjectId(id, 'lessonId'), ...lessonAccessFilter(scope) },
      { $set: data },
      { new: true },
    ).lean<ILesson>();
    if (!updated) throw new NotFoundError('Lesson not found');
    return updated;
  }

  /**
   * Publish gates student visibility. Idempotent — re-publishing leaves the
   * original publishedAt timestamp untouched so the "published on" stamp
   * remains accurate.
   */
  static async publish(id: string, scope: LessonScope): Promise<ILesson> {
    const updated = await Lesson.findOneAndUpdate(
      {
        _id: toObjectId(id, 'lessonId'),
        ...lessonAccessFilter(scope),
        publishedAt: null,
      },
      { $set: { publishedAt: new Date() } },
      { new: true },
    ).lean<ILesson>();
    if (updated) return updated;
    // Already published — return current state.
    const existing = await Lesson.findOne({
      _id: toObjectId(id, 'lessonId'),
      ...lessonAccessFilter(scope),
    }).lean<ILesson>();
    if (!existing) throw new NotFoundError('Lesson not found');
    return existing;
  }

  /** Revoke student visibility. Idempotent — repeat calls leave publishedAt null. */
  static async unpublish(id: string, scope: LessonScope): Promise<ILesson> {
    const updated = await Lesson.findOneAndUpdate(
      { _id: toObjectId(id, 'lessonId'), ...lessonAccessFilter(scope) },
      { $set: { publishedAt: null } },
      { new: true },
    ).lean<ILesson>();
    if (!updated) throw new NotFoundError('Lesson not found');
    return updated;
  }

  static async delete(id: string, scope: LessonScope): Promise<void> {
    const result = await Lesson.updateOne(
      { _id: toObjectId(id, 'lessonId'), ...lessonAccessFilter(scope) },
      { $set: { isDeleted: true } },
    );
    if (result.matchedCount === 0) throw new NotFoundError('Lesson not found');
  }

  /**
   * Returns the teacher's most recently used curriculum topics, deduplicated
   * by curriculumNodeId, ordered by latest lesson updatedAt desc. Used by the
   * new-lesson topic quick picker to surface "you've been here before" chips.
   *
   * Note: pre-refactor this sorted by lesson.date (the per-class scheduled
   * date). With the decoupled model the pack itself has no date; sorting by
   * updatedAt approximates "most recently worked on" which is the right
   * recency signal for picker chips.
   */
  static async recentTopicsForTeacher(
    teacherId: string,
    schoolId: string,
    limit: number,
  ): Promise<RecentTopicSummary[]> {
    const aggResult = await Lesson.aggregate<{ _id: mongoose.Types.ObjectId; latest: Date }>([
      {
        $match: {
          teacherId: new mongoose.Types.ObjectId(teacherId),
          schoolId: new mongoose.Types.ObjectId(schoolId),
          isDeleted: false,
        },
      },
      { $sort: { updatedAt: -1 } },
      { $group: { _id: '$curriculumNodeId', latest: { $first: '$updatedAt' } } },
      { $sort: { latest: -1 } },
      { $limit: limit },
    ]);

    if (aggResult.length === 0) return [];

    const ids = aggResult.map((r) => r._id);
    const nodes = await CurriculumNode.find({
      _id: { $in: ids },
      isDeleted: false,
    })
      .select('_id title termNumber subjectId gradeId')
      .lean<Array<{
        _id: mongoose.Types.ObjectId;
        title: string;
        termNumber: number | null;
        subjectId: mongoose.Types.ObjectId | null;
        gradeId: mongoose.Types.ObjectId | null;
      }>>();

    // Preserve aggregation order (latest first).
    const byId = new Map(nodes.map((n) => [n._id.toString(), n]));
    const out: RecentTopicSummary[] = [];
    for (const r of aggResult) {
      const n = byId.get(r._id.toString());
      if (!n) continue;
      out.push({
        id: n._id.toString(),
        title: n.title,
        termNumber: n.termNumber ?? null,
        subjectId: n.subjectId ? n.subjectId.toString() : null,
        gradeId: n.gradeId ? n.gradeId.toString() : null,
      });
    }
    return out;
  }
}
