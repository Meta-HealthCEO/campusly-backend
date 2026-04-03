import mongoose from 'mongoose';
import { StudentMastery } from './model-tracking.js';
import { paginationHelper } from '../../common/utils.js';

interface MasteryFilters {
  subjectId?: string;
  gradeId?: string;
  page?: number;
  limit?: number;
}

export class MasteryService {
  static async getStudentMastery(
    studentId: string,
    schoolId: string,
    filters?: MasteryFilters,
  ) {
    const soid = new mongoose.Types.ObjectId(studentId);
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    const query: Record<string, unknown> = {
      studentId: soid,
      schoolId: schoolOid,
    };

    const { skip, limit } = paginationHelper(filters?.page, filters?.limit);

    // Build aggregation to optionally filter by subject/grade via populated node
    const pipeline: mongoose.PipelineStage[] = [
      { $match: query },
      {
        $lookup: {
          from: 'curriculumnodes',
          localField: 'curriculumNodeId',
          foreignField: '_id',
          as: 'curriculumNode',
        },
      },
      { $unwind: { path: '$curriculumNode', preserveNullAndEmptyArrays: true } },
    ];

    if (filters?.subjectId) {
      pipeline.push({
        $match: { 'curriculumNode.subjectId': new mongoose.Types.ObjectId(filters.subjectId) },
      });
    }
    if (filters?.gradeId) {
      pipeline.push({
        $match: { 'curriculumNode.gradeId': new mongoose.Types.ObjectId(filters.gradeId) },
      });
    }

    // Count total before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await StudentMastery.aggregate(countPipeline);
    const total = (countResult[0] as { total: number } | undefined)?.total ?? 0;

    // Add pagination and sort
    pipeline.push(
      { $sort: { masteryLevel: 1 as const } },
      { $skip: skip },
      { $limit: limit },
    );

    const records = await StudentMastery.aggregate(pipeline);

    return { records, total, page: filters?.page ?? 1, limit };
  }

  static async getClassMastery(schoolId: string, classId: string) {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const classOid = new mongoose.Types.ObjectId(classId);

    // Get students in the class, then aggregate their mastery
    const pipeline: mongoose.PipelineStage[] = [
      // Find students in this class
      {
        $lookup: {
          from: 'students',
          let: { sid: '$studentId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$sid'] },
                schoolId: schoolOid,
                classId: classOid,
                isDeleted: false,
              },
            },
          ],
          as: 'student',
        },
      },
      { $match: { student: { $ne: [] }, schoolId: schoolOid } },
      { $unwind: '$student' },

      // Per-node averages
      {
        $group: {
          _id: '$curriculumNodeId',
          avgMastery: { $avg: '$masteryLevel' },
          totalAttempts: { $sum: '$attemptCount' },
          studentCount: { $sum: 1 },
          avgCorrectRate: {
            $avg: {
              $cond: [
                { $gt: ['$attemptCount', 0] },
                { $divide: ['$correctCount', '$attemptCount'] },
                0,
              ],
            },
          },
        },
      },

      // Populate node details
      {
        $lookup: {
          from: 'curriculumnodes',
          localField: '_id',
          foreignField: '_id',
          as: 'node',
        },
      },
      { $unwind: { path: '$node', preserveNullAndEmptyArrays: true } },

      {
        $project: {
          curriculumNodeId: '$_id',
          nodeTitle: '$node.title',
          nodeCode: '$node.code',
          avgMastery: { $round: ['$avgMastery', 1] },
          avgCorrectRate: { $round: [{ $multiply: ['$avgCorrectRate', 100] }, 1] },
          totalAttempts: 1,
          studentCount: 1,
        },
      },

      { $sort: { avgMastery: 1 as const } },
    ];

    const nodeStats = await StudentMastery.aggregate(pipeline);

    // Per-student summary
    const studentPipeline: mongoose.PipelineStage[] = [
      {
        $lookup: {
          from: 'students',
          let: { sid: '$studentId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$sid'] },
                schoolId: schoolOid,
                classId: classOid,
                isDeleted: false,
              },
            },
            { $project: { firstName: 1, lastName: 1 } },
          ],
          as: 'student',
        },
      },
      { $match: { student: { $ne: [] }, schoolId: schoolOid } },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$studentId',
          studentName: { $first: { $concat: ['$student.firstName', ' ', '$student.lastName'] } },
          avgMastery: { $avg: '$masteryLevel' },
          nodesAttempted: { $sum: 1 },
          totalAttempts: { $sum: '$attemptCount' },
        },
      },
      {
        $project: {
          studentId: '$_id',
          studentName: 1,
          avgMastery: { $round: ['$avgMastery', 1] },
          nodesAttempted: 1,
          totalAttempts: 1,
        },
      },
      { $sort: { avgMastery: 1 as const } },
    ];

    const studentStats = await StudentMastery.aggregate(studentPipeline);

    return { nodeStats, studentStats };
  }
}
