import mongoose from 'mongoose';
import { Lesson } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import type { ILesson, LessonStatus } from './types.js';
import { LESSON_PHASES } from './types.js';
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

const ALLOWED_TRANSITIONS: Record<LessonStatus, LessonStatus[]> = {
  draft: ['ready', 'taught'],
  ready: ['draft', 'taught'],
  taught: ['ready'],
};

export class LessonService {
  static async list(
    schoolId: string,
    filters: ListLessonsInput,
  ): Promise<{ items: ILesson[]; total: number; page: number; limit: number }> {
    const query: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };
    if (filters.teacherId) query.teacherId = new mongoose.Types.ObjectId(filters.teacherId);
    if (filters.subjectId) query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    if (filters.status) query.status = filters.status;

    // Class filter + date range now resolve via the assignedClasses subdoc.
    // When a classId is provided we use $elemMatch so the date filter (if any)
    // applies to the SAME assignment as the class — not just any assignment
    // that happens to satisfy either constraint independently.
    if (filters.classId || filters.dateFrom || filters.dateTo) {
      const elem: Record<string, unknown> = {};
      if (filters.classId) elem.classId = new mongoose.Types.ObjectId(filters.classId);
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
        .populate('curriculumNodeId', 'title code')
        .lean<ILesson[]>(),
      Lesson.countDocuments(query),
    ]);
    return { items, total, page: filters.page, limit: filters.limit };
  }

  static async getById(id: string, schoolId: string): Promise<ILesson> {
    const lesson = await Lesson.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('assignedClasses.classId', 'name')
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name level')
      .populate('curriculumNodeId', 'title code')
      .populate('teacherId', 'firstName lastName email')
      .populate('materials.contentResourceId')
      .populate('materials.homeworkId')
      .populate('materials.paperId')
      .populate('materials.quizId')
      .populate('materials.questionIds')
      .populate('materials.comprehensionQuestionIds')
      .populate('materials.textbookRef.textbookId', 'title')
      .lean<ILesson>();
    if (!lesson) throw new Error('Lesson not found');
    return lesson;
  }

  static async create(
    data: CreateLessonInput,
    teacherId: string,
    schoolId: string,
  ): Promise<ILesson> {
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
    let termNumber: number | null = data.termNumber ?? null;
    if (termNumber === null) {
      const node = await CurriculumNode.findById(data.curriculumNodeId)
        .select('termNumber')
        .lean<{ termNumber?: number | null } | null>();
      if (node && typeof node.termNumber === 'number') {
        termNumber = node.termNumber;
      }
    }

    const assignedClasses = (data.assignedClasses ?? []).map((a) => ({
      classId: new mongoose.Types.ObjectId(a.classId),
      scheduledDate: new Date(a.scheduledDate),
      status: a.status,
    }));

    const lesson = await Lesson.create({
      schoolId,
      teacherId,
      subjectId: data.subjectId,
      gradeId: data.gradeId,
      curriculumNodeId: data.curriculumNodeId,
      termNumber,
      title: data.title,
      durationMinutes: data.durationMinutes,
      objectives,
      phases,
      materials,
      status: 'draft',
      aiGenerated,
      assignedClasses,
    });
    return lesson.toObject() as ILesson;
  }

  static async update(
    id: string,
    schoolId: string,
    data: UpdateLessonInput,
  ): Promise<ILesson> {
    const updated = await Lesson.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true },
    ).lean<ILesson>();
    if (!updated) throw new Error('Lesson not found');
    return updated;
  }

  static async patchStatus(
    id: string,
    schoolId: string,
    newStatus: LessonStatus,
  ): Promise<ILesson> {
    const lesson = await Lesson.findOne({ _id: id, schoolId, isDeleted: false });
    if (!lesson) throw new Error('Lesson not found');
    if (!ALLOWED_TRANSITIONS[lesson.status].includes(newStatus)) {
      throw new Error(`Invalid status transition: ${lesson.status} -> ${newStatus}`);
    }
    lesson.status = newStatus;
    await lesson.save();
    return lesson.toObject() as ILesson;
  }

  static async delete(id: string, schoolId: string): Promise<void> {
    const result = await Lesson.updateOne(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (result.matchedCount === 0) throw new Error('Lesson not found');
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
