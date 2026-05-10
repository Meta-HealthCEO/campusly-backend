import mongoose from 'mongoose';
import { Lesson } from './model.js';
import type { ILesson, LessonStatus } from './types.js';
import { LESSON_PHASES } from './types.js';
import type {
  CreateLessonInput,
  UpdateLessonInput,
  ListLessonsInput,
} from './validation.js';

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
    if (filters.classId) query.classId = new mongoose.Types.ObjectId(filters.classId);
    if (filters.subjectId) query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    if (filters.status) query.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      const range: { $gte?: Date; $lte?: Date } = {};
      if (filters.dateFrom) range.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) range.$lte = new Date(filters.dateTo);
      query.date = range;
    }
    if (filters.search) query.title = { $regex: filters.search, $options: 'i' };

    const skip = (filters.page - 1) * filters.limit;
    const [items, total] = await Promise.all([
      Lesson.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(filters.limit)
        .populate('classId', 'name')
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
      .populate('classId', 'name')
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

    const lesson = await Lesson.create({
      schoolId,
      teacherId,
      classId: data.classId,
      subjectId: data.subjectId,
      gradeId: data.gradeId,
      curriculumNodeId: data.curriculumNodeId,
      title: data.title,
      date: data.date,
      durationMinutes: data.durationMinutes,
      objectives,
      phases,
      materials,
      status: 'draft',
      aiGenerated,
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
}
