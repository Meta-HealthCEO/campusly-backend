import mongoose from 'mongoose';
import { Department, TeacherObservation } from './model.js';
import { Assessment, Mark, Timetable } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { User } from '../Auth/model.js';
import { NotFoundError } from '../../common/errors.js';
import { DepartmentService } from './service.js';

export class WorkloadService {
  // ─── Workload Distribution ───────────────────────────────────────────────

  static async getWorkloadDistribution(
    departmentId: string,
    schoolId: string,
  ) {
    const dept = await Department.findOne({
      _id: departmentId, schoolId, isDeleted: false,
    }).lean().exec();
    if (!dept) throw new NotFoundError('Department not found');

    const teacherIds = await DepartmentService.getDepartmentTeacherIds(departmentId, schoolId);
    if (teacherIds.length === 0) return [];

    const teacherOids = teacherIds.map((id) => new mongoose.Types.ObjectId(id));
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const subjectOids = dept.subjectIds.map(
      (s: unknown) => new mongoose.Types.ObjectId(String(s)),
    );

    const currentYear = new Date().getFullYear();
    const currentTerm = Math.min(4, Math.max(1, Math.ceil((new Date().getMonth() + 1) / 3)));

    // Get teacher info
    const teachers = await User.find({
      _id: { $in: teacherOids },
      isDeleted: false,
    }).select('firstName lastName').lean().exec();

    const teacherNameMap = new Map(
      teachers.map((t) => [t._id.toString(), `${t.firstName} ${t.lastName}`]),
    );

    // Timetable-based class/subject counts and periods per week
    const timetableAgg = await Timetable.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          teacherId: { $in: teacherOids },
          subjectId: { $in: subjectOids },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$teacherId',
          classes: { $addToSet: '$classId' },
          subjects: { $addToSet: '$subjectId' },
          periodsPerWeek: { $sum: 1 },
        },
      },
    ]);

    interface TimetableAggRow {
      _id: mongoose.Types.ObjectId;
      classes: mongoose.Types.ObjectId[];
      subjects: mongoose.Types.ObjectId[];
      periodsPerWeek: number;
    }

    const timetableMap = new Map(
      timetableAgg.map((row: TimetableAggRow) => [
        row._id.toString(),
        {
          classCount: row.classes.length,
          subjectCount: row.subjects.length,
          periodsPerWeek: row.periodsPerWeek,
          classIds: row.classes as mongoose.Types.ObjectId[],
        },
      ]),
    );

    // Student counts per teacher (based on their classes)
    const results = await Promise.all(teacherIds.map(async (tid) => {
      const ttInfo = timetableMap.get(tid) ?? { classCount: 0, subjectCount: 0, periodsPerWeek: 0, classIds: [] };

      // Count students in teacher's classes
      const studentCount = ttInfo.classIds.length > 0
        ? await Student.countDocuments({
          schoolId,
          classId: { $in: ttInfo.classIds },
          isDeleted: false,
          enrollmentStatus: 'active',
        })
        : 0;

      // Assessments this term
      const assessmentCount = await Assessment.countDocuments({
        schoolId,
        classId: { $in: ttInfo.classIds },
        subjectId: { $in: subjectOids },
        term: currentTerm,
        academicYear: currentYear,
        isDeleted: false,
      });

      // Pending marking: assessments with no marks yet
      const assessmentIds = await Assessment.find({
        schoolId,
        classId: { $in: ttInfo.classIds },
        subjectId: { $in: subjectOids },
        term: currentTerm,
        academicYear: currentYear,
        isDeleted: false,
      }).select('_id').lean().exec();

      let pendingMarking = 0;
      for (const a of assessmentIds) {
        const markCount = await Mark.countDocuments({
          assessmentId: a._id,
          schoolId,
          isDeleted: false,
        });
        if (markCount === 0) pendingMarking++;
      }

      // Observations this year
      const observationsThisYear = await TeacherObservation.countDocuments({
        schoolId,
        teacherId: new mongoose.Types.ObjectId(tid),
        status: 'completed',
        isDeleted: false,
        completedAt: { $gte: new Date(currentYear, 0, 1) },
      });

      return {
        teacherId: tid,
        teacherName: teacherNameMap.get(tid) ?? 'Unknown',
        subjectCount: ttInfo.subjectCount,
        classCount: ttInfo.classCount,
        totalStudents: studentCount,
        periodsPerWeek: ttInfo.periodsPerWeek,
        assessmentsThisTerm: assessmentCount,
        pendingMarking,
        observationsThisYear,
      };
    }));

    return results;
  }

  // ─── Common Assessment Analysis ──────────────────────────────────────────

  static async getCommonAssessmentAnalysis(
    departmentId: string,
    schoolId: string,
    filters: { subjectId?: string; term?: number; year?: number },
  ) {
    const dept = await Department.findOne({
      _id: departmentId, schoolId, isDeleted: false,
    }).lean().exec();
    if (!dept) throw new NotFoundError('Department not found');

    const currentYear = filters.year ?? new Date().getFullYear();
    const currentTerm = filters.term ?? 1;
    const subjectOids = filters.subjectId
      ? [new mongoose.Types.ObjectId(filters.subjectId)]
      : dept.subjectIds.map((s: unknown) => new mongoose.Types.ObjectId(String(s)));

    // Find assessments with the same name across classes (common assessments)
    const assessments = await Assessment.aggregate([
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
        $group: {
          _id: { name: '$name', subjectId: '$subjectId' },
          assessments: {
            $push: { assessmentId: '$_id', classId: '$classId', totalMarks: '$totalMarks', date: '$date' },
          },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
      {
        $lookup: {
          from: 'subjects', localField: '_id.subjectId',
          foreignField: '_id', as: 'subject',
        },
      },
      { $unwind: '$subject' },
    ]);

    const results = [];

    for (const group of assessments) {
      const classes = [];

      for (const a of group.assessments as Array<{ assessmentId: mongoose.Types.ObjectId; classId: mongoose.Types.ObjectId; totalMarks: number; date: Date }>) {
        const marks = await Mark.find({
          assessmentId: a.assessmentId,
          schoolId,
          isDeleted: false,
        }).select('percentage').lean().exec();

        if (marks.length === 0) continue;

        const percentages = marks.map((m) => m.percentage);
        const avg = percentages.reduce((s, v) => s + v, 0) / percentages.length;
        const passing = percentages.filter((p) => p >= 40).length;
        const sorted = [...percentages].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
        const variance = percentages.reduce((s, v) => s + (v - avg) ** 2, 0) / percentages.length;
        const stdDev = Math.sqrt(variance);

        // SA grading levels
        const distribution = {
          level7: percentages.filter((p) => p >= 80).length,
          level6: percentages.filter((p) => p >= 70 && p < 80).length,
          level5: percentages.filter((p) => p >= 60 && p < 70).length,
          level4: percentages.filter((p) => p >= 50 && p < 60).length,
          level3: percentages.filter((p) => p >= 40 && p < 50).length,
          level2: percentages.filter((p) => p >= 30 && p < 40).length,
          level1: percentages.filter((p) => p < 30).length,
        };

        const classDoc = await mongoose.model('Class').findById(a.classId)
          .select('name teacherId').lean().exec() as { name: string; teacherId: mongoose.Types.ObjectId } | null;
        const teacher = classDoc?.teacherId
          ? await User.findById(classDoc.teacherId).select('firstName lastName').lean().exec()
          : null;

        classes.push({
          classId: a.classId.toString(),
          className: classDoc?.name ?? 'Unknown',
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
          studentCount: marks.length,
          averageMark: Math.round(avg * 10) / 10,
          passRate: Math.round((passing / marks.length) * 1000) / 10,
          medianMark: Math.round(median * 10) / 10,
          standardDeviation: Math.round(stdDev * 10) / 10,
          distribution,
        });
      }

      if (classes.length > 0) {
        results.push({
          assessmentName: group._id.name,
          subjectName: group.subject.name,
          totalMarks: (group.assessments as Array<{ totalMarks: number }>)[0]?.totalMarks ?? 0,
          date: (group.assessments as Array<{ date: Date }>)[0]?.date,
          classes,
        });
      }
    }

    return results;
  }
}
