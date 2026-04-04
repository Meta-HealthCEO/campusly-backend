import mongoose from 'mongoose';
import { Department } from './model.js';
import { Assessment } from '../Academic/model.js';
import { CurriculumCoverage } from '../TeacherWorkbench/model.js';
import { User } from '../Auth/model.js';
import { NotFoundError } from '../../common/errors.js';
import { DepartmentService } from './service.js';

export class DepartmentAnalyticsService {
  // ─── Performance ─────────────────────────────────────────────────────────

  static async getDepartmentPerformance(
    departmentId: string,
    schoolId: string,
    term?: number,
    year?: number,
  ) {
    const dept = await Department.findOne({
      _id: departmentId, schoolId, isDeleted: false,
    }).populate('subjectIds', 'name').lean().exec();
    if (!dept) throw new NotFoundError('Department not found');

    const currentYear = year ?? new Date().getFullYear();
    const currentTerm = term ?? 1;
    const subjectOids = dept.subjectIds.map(
      (s: unknown) => new mongoose.Types.ObjectId(
        typeof s === 'object' && s !== null && '_id' in s
          ? (s as { _id: string })._id.toString()
          : String(s),
      ),
    );

    const pipeline = [
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          subjectId: { $in: subjectOids },
          term: currentTerm,
          academicYear: currentYear,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'marks', localField: '_id',
          foreignField: 'assessmentId', as: 'marks',
        },
      },
      { $unwind: '$marks' },
      { $match: { 'marks.isDeleted': false } },
      {
        $group: {
          _id: { subjectId: '$subjectId', classId: '$classId' },
          avgMark: { $avg: '$marks.percentage' },
          totalStudents: { $addToSet: '$marks.studentId' },
          highestMark: { $max: '$marks.percentage' },
          lowestMark: { $min: '$marks.percentage' },
          passCount: {
            $sum: { $cond: [{ $gte: ['$marks.percentage', 40] }, 1, 0] },
          },
          totalMarks: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'subjects', localField: '_id.subjectId',
          foreignField: '_id', as: 'subject',
        },
      },
      { $unwind: '$subject' },
      {
        $lookup: {
          from: 'classes', localField: '_id.classId',
          foreignField: '_id', as: 'class',
        },
      },
      { $unwind: '$class' },
      {
        $lookup: {
          from: 'users', localField: 'class.teacherId',
          foreignField: '_id', as: 'teacher',
        },
      },
      { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id.subjectId',
          subjectName: { $first: '$subject.name' },
          classes: {
            $push: {
              classId: '$_id.classId',
              className: '$class.name',
              teacherName: {
                $concat: [
                  { $ifNull: ['$teacher.firstName', ''] },
                  ' ',
                  { $ifNull: ['$teacher.lastName', ''] },
                ],
              },
              studentCount: { $size: '$totalStudents' },
              averageMark: { $round: ['$avgMark', 1] },
              passRate: {
                $round: [
                  { $multiply: [{ $divide: ['$passCount', '$totalMarks'] }, 100] },
                  1,
                ],
              },
              highestMark: { $round: ['$highestMark', 1] },
              lowestMark: { $round: ['$lowestMark', 1] },
            },
          },
          overallAvg: { $avg: '$avgMark' },
          overallPassCount: { $sum: '$passCount' },
          overallTotal: { $sum: '$totalMarks' },
        },
      },
      {
        $project: {
          subjectId: '$_id',
          subjectName: 1,
          classes: 1,
          overallAverage: { $round: ['$overallAvg', 1] },
          overallPassRate: {
            $round: [
              { $multiply: [{ $divide: ['$overallPassCount', '$overallTotal'] }, 100] },
              1,
            ],
          },
        },
      },
    ];

    const subjects = await Assessment.aggregate(pipeline);

    return {
      departmentName: dept.name,
      term: currentTerm,
      year: currentYear,
      subjects,
    };
  }

  // ─── Curriculum Pacing ───────────────────────────────────────────────────

  static async getCurriculumPacing(
    departmentId: string,
    schoolId: string,
    term?: number,
    year?: number,
  ) {
    const dept = await Department.findOne({
      _id: departmentId, schoolId, isDeleted: false,
    }).lean().exec();
    if (!dept) throw new NotFoundError('Department not found');

    const currentTerm = term ?? 1;
    const termTotalWeeks = 10;
    const now = new Date();
    const termStart = new Date(now.getFullYear(), (currentTerm - 1) * 3, 15);
    const weeksElapsed = Math.min(
      termTotalWeeks,
      Math.max(1, Math.ceil((now.getTime() - termStart.getTime()) / (7 * 24 * 60 * 60 * 1000))),
    );
    const expectedProgress = (weeksElapsed / termTotalWeeks) * 100;

    const teacherIds = await DepartmentService.getDepartmentTeacherIds(departmentId, schoolId);

    const subjectOids = dept.subjectIds.map(
      (s: unknown) => new mongoose.Types.ObjectId(String(s)),
    );

    const coverageData = await CurriculumCoverage.aggregate([
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          teacherId: { $in: teacherIds.map((id) => new mongoose.Types.ObjectId(id)) },
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'curriculumtopics', localField: 'topicId',
          foreignField: '_id', as: 'topic',
        },
      },
      { $unwind: '$topic' },
      {
        $match: {
          'topic.term': currentTerm,
          'topic.subjectId': { $in: subjectOids },
          'topic.isDeleted': false,
        },
      },
      {
        $group: {
          _id: { teacherId: '$teacherId', classId: '$classId', subjectId: '$topic.subjectId' },
          totalTopics: { $sum: 1 },
          completedTopics: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          inProgressTopics: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users', localField: '_id.teacherId',
          foreignField: '_id', as: 'teacher',
        },
      },
      { $unwind: '$teacher' },
      {
        $lookup: {
          from: 'classes', localField: '_id.classId',
          foreignField: '_id', as: 'class',
        },
      },
      { $unwind: '$class' },
      {
        $lookup: {
          from: 'subjects', localField: '_id.subjectId',
          foreignField: '_id', as: 'subject',
        },
      },
      { $unwind: '$subject' },
    ]);

    // Group by teacher
    const teacherMap = new Map<string, {
      teacherId: string; teacherName: string;
      subjects: Map<string, { subjectId: string; subjectName: string; classes: unknown[] }>;
    }>();

    for (const row of coverageData) {
      const tid = row._id.teacherId.toString();
      if (!teacherMap.has(tid)) {
        teacherMap.set(tid, {
          teacherId: tid,
          teacherName: `${row.teacher.firstName} ${row.teacher.lastName}`,
          subjects: new Map(),
        });
      }
      const teacher = teacherMap.get(tid)!;
      const sid = row._id.subjectId.toString();
      if (!teacher.subjects.has(sid)) {
        teacher.subjects.set(sid, {
          subjectId: sid, subjectName: row.subject.name, classes: [],
        });
      }
      const actualProgress = row.totalTopics > 0
        ? Math.round((row.completedTopics / row.totalTopics) * 1000) / 10
        : 0;
      const diff = actualProgress - expectedProgress;
      let status: string;
      if (diff > 10) status = 'ahead';
      else if (diff >= -10) status = 'on_track';
      else if (diff >= -25) status = 'behind';
      else status = 'significantly_behind';

      teacher.subjects.get(sid)!.classes.push({
        classId: row._id.classId.toString(),
        className: row.class.name,
        totalTopics: row.totalTopics,
        completedTopics: row.completedTopics,
        inProgressTopics: row.inProgressTopics,
        actualProgress,
        expectedProgress: Math.round(expectedProgress * 10) / 10,
        status,
      });
    }

    return {
      termWeeksElapsed: weeksElapsed,
      termTotalWeeks,
      expectedProgress: Math.round(expectedProgress * 10) / 10,
      teachers: Array.from(teacherMap.values()).map((t) => ({
        teacherId: t.teacherId,
        teacherName: t.teacherName,
        subjects: Array.from(t.subjects.values()).map((s) => ({
          subjectId: s.subjectId,
          subjectName: s.subjectName,
          classes: s.classes,
        })),
      })),
    };
  }

}
