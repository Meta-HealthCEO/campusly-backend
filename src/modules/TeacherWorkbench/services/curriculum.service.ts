import mongoose from 'mongoose';
import type { PipelineStage } from 'mongoose';
import {
  CurriculumFramework,
  CurriculumTopic,
  CurriculumCoverage,
  ICurriculumFramework,
  ICurriculumTopic,
  ICurriculumCoverage,
} from '../model.js';
import { NotFoundError } from '../../../common/errors.js';

interface TopicFilters {
  frameworkId?: string;
  subjectId?: string;
  gradeLevel?: number;
  term?: number;
}

interface CoverageFilters {
  teacherId?: string;
  classId?: string;
  subjectId?: string;
}

interface CoverageReportFilters {
  teacherId?: string;
  subjectId?: string;
  classId?: string;
}

interface BulkTopicItem {
  parentTopicId?: string | null;
  name: string;
  description?: string;
  term: number;
  orderIndex?: number;
  cognitiveLevel?: string;
  estimatedPeriods?: number;
}

interface BulkImportData {
  schoolId: string;
  frameworkId: string;
  subjectId: string;
  gradeLevel: number;
  topics: BulkTopicItem[];
}

export class CurriculumService {
  static async listFrameworks(schoolId: string): Promise<ICurriculumFramework[]> {
    return CurriculumFramework.find({ schoolId, isDeleted: false })
      .sort({ name: 1 })
      .lean()
      .exec() as unknown as ICurriculumFramework[];
  }

  static async createFramework(
    data: Record<string, unknown>,
    teacherId: string,
  ): Promise<ICurriculumFramework> {
    if (data.isDefault) {
      await CurriculumFramework.updateMany(
        { schoolId: String(data.schoolId), isDeleted: false },
        { $set: { isDefault: false } },
      );
    }
    const framework = new CurriculumFramework({ ...data, createdBy: teacherId });
    return framework.save();
  }

  static async listTopics(
    schoolId: string,
    filters: TopicFilters,
  ): Promise<ICurriculumTopic[]> {
    const query: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.frameworkId) query.frameworkId = filters.frameworkId;
    if (filters.subjectId) query.subjectId = filters.subjectId;
    if (filters.gradeLevel !== undefined) query.gradeLevel = filters.gradeLevel;
    if (filters.term !== undefined) query.term = filters.term;

    return CurriculumTopic.find(query)
      .sort({ term: 1, orderIndex: 1 })
      .lean()
      .exec() as unknown as ICurriculumTopic[];
  }

  static async createTopic(
    data: Record<string, unknown>,
  ): Promise<ICurriculumTopic> {
    const topic = new CurriculumTopic(data);
    return topic.save();
  }

  static async updateTopic(
    id: string,
    data: Record<string, unknown>,
    schoolId: string,
  ): Promise<ICurriculumTopic> {
    const topic = await CurriculumTopic.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true },
    ).lean().exec();
    if (!topic) throw new NotFoundError('Topic not found');
    return topic as unknown as ICurriculumTopic;
  }

  static async deleteTopic(id: string): Promise<void> {
    const topic = await CurriculumTopic.findOne({ _id: id, isDeleted: false });
    if (!topic) throw new NotFoundError('Topic not found');
    // Soft-delete children first, then parent
    await CurriculumTopic.updateMany(
      { parentTopicId: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    await CurriculumTopic.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true } });
  }

  static async bulkImportTopics(
    data: BulkImportData,
  ): Promise<ICurriculumTopic[]> {
    const { schoolId, frameworkId, subjectId, gradeLevel, topics } = data;
    const docs = topics.map((t) => ({
      ...t,
      schoolId,
      frameworkId,
      subjectId,
      gradeLevel,
    }));
    const result = await CurriculumTopic.insertMany(docs);
    return result as unknown as ICurriculumTopic[];
  }

  static async getCoverage(
    schoolId: string,
    filters: CoverageFilters,
  ): Promise<ICurriculumCoverage[]> {
    const query: Record<string, unknown> = { schoolId };
    if (filters.teacherId) query.teacherId = filters.teacherId;
    if (filters.classId) query.classId = filters.classId;

    const results = await CurriculumCoverage.find(query)
      .populate('topicId')
      .lean()
      .exec() as unknown as ICurriculumCoverage[];

    if (filters.subjectId) {
      return results.filter((r) => {
        const topic = r.topicId as unknown as Record<string, unknown>;
        return topic && String(topic.subjectId) === filters.subjectId;
      });
    }
    return results;
  }

  static async updateCoverage(
    teacherId: string,
    topicId: string,
    data: Record<string, unknown>,
  ): Promise<ICurriculumCoverage> {
    const classId = String(data.classId ?? '');
    const schoolId = String(data.schoolId ?? '');

    const coverage = await CurriculumCoverage.findOneAndUpdate(
      { teacherId, topicId, classId },
      {
        $set: {
          status: data.status,
          dateCovered: data.dateCovered,
          notes: data.notes,
          linkedLessonPlanId: data.linkedLessonPlanId,
          teacherId,
          topicId,
          classId,
          schoolId,
        },
      },
      { new: true, upsert: true },
    ).lean().exec();

    return coverage as unknown as ICurriculumCoverage;
  }

  static async getCoverageReport(
    schoolId: string,
    filters: CoverageReportFilters,
  ): Promise<unknown[]> {
    const match: Record<string, unknown> = { schoolId: new mongoose.Types.ObjectId(schoolId) };
    if (filters.teacherId) match.teacherId = new mongoose.Types.ObjectId(filters.teacherId);
    if (filters.classId) match.classId = new mongoose.Types.ObjectId(filters.classId);

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $lookup: {
          from: 'curriculumtopics',
          localField: 'topicId',
          foreignField: '_id',
          as: 'topic',
        },
      },
      { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$topic.term',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          notStarted: {
            $sum: { $cond: [{ $eq: ['$status', 'not_started'] }, 1, 0] },
          },
          skipped: {
            $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          percentComplete: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
              0,
            ],
          },
          term: '$_id',
        },
      },
      { $sort: { term: 1 } },
    ];

    // subjectId filter must be applied after $lookup since it's on the joined doc
    if (filters.subjectId) {
      pipeline.splice(3, 0, {
        $match: { 'topic.subjectId': new mongoose.Types.ObjectId(filters.subjectId) },
      });
    }

    return CurriculumCoverage.aggregate(pipeline).exec();
  }
}
