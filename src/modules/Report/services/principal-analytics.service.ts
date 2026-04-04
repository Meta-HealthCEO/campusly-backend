import mongoose from 'mongoose';
import { Mark, Assessment, Subject, Grade, Class } from '../../Academic/model.js';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { Attendance } from '../../Attendance/model.js';
import { Invoice, Payment } from '../../Fee/model.js';
import { logger } from '../../../common/logger.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HeatmapGrade {
  gradeId: string;
  gradeName: string;
  averagePercent: number;
  studentCount: number;
  passRate: number;
}

export interface SubjectHeatmapEntry {
  subjectId: string;
  subjectName: string;
  grades: HeatmapGrade[];
}

export interface TermTrendPoint {
  term: number;
  attendance: number | null;
  passRate: number | null;
  feeCollection: number | null;
  teacherAttendance: number | null;
}

export interface TermTrendData {
  year: number;
  terms: TermTrendPoint[];
}

export interface TeacherPerformanceEntry {
  teacherIndex: number;
  subjectCount: number;
  classCount: number;
  averageClassPassRate: number;
  averageClassMark: number;
  homeworkSetCount: number;
  attendanceRate: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pct(num: number, den: number): number {
  if (den === 0) return 0;
  return Math.round((num / den) * 10000) / 100;
}

// ─── Subject Heatmap ────────────────────────────────────────────────────────

export async function getSubjectHeatmap(
  schoolId: string,
  term?: number,
  year?: number,
): Promise<SubjectHeatmapEntry[]> {
  const now = new Date();
  const currentYear = year ?? now.getFullYear();
  const currentTerm = term ?? Math.min(4, Math.ceil((now.getMonth() + 1) / 3));
  const schoolOid = new mongoose.Types.ObjectId(schoolId);

  try {
    const results = await Mark.aggregate([
      {
        $lookup: {
          from: 'assessments',
          localField: 'assessmentId',
          foreignField: '_id',
          as: 'assessment',
        },
      },
      { $unwind: '$assessment' },
      {
        $match: {
          schoolId: schoolOid,
          isDeleted: false,
          'assessment.term': currentTerm,
          'assessment.academicYear': currentYear,
          'assessment.isDeleted': false,
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: 'assessment.subjectId',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
      {
        $lookup: {
          from: 'classes',
          localField: 'assessment.classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
      {
        $lookup: {
          from: 'grades',
          localField: 'classInfo.gradeId',
          foreignField: '_id',
          as: 'grade',
        },
      },
      { $unwind: '$grade' },
      {
        $group: {
          _id: {
            subjectId: '$subject._id',
            subjectName: '$subject.name',
            gradeId: '$grade._id',
            gradeName: '$grade.name',
          },
          avgPercent: { $avg: '$percentage' },
          studentCount: { $addToSet: '$studentId' },
          totalMarks: { $sum: 1 },
          passedMarks: {
            $sum: { $cond: [{ $gte: ['$percentage', 50] }, 1, 0] },
          },
        },
      },
      {
        $group: {
          _id: { subjectId: '$_id.subjectId', subjectName: '$_id.subjectName' },
          grades: {
            $push: {
              gradeId: { $toString: '$_id.gradeId' },
              gradeName: '$_id.gradeName',
              averagePercent: { $round: ['$avgPercent', 1] },
              studentCount: { $size: '$studentCount' },
              passRate: {
                $round: [
                  { $multiply: [{ $divide: ['$passedMarks', { $max: ['$totalMarks', 1] }] }, 100] },
                  1,
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          subjectId: { $toString: '$_id.subjectId' },
          subjectName: '$_id.subjectName',
          grades: 1,
        },
      },
      { $sort: { subjectName: 1 } },
    ]);

    return results as SubjectHeatmapEntry[];
  } catch (err: unknown) {
    logger.error({ err, schoolId }, 'Failed to compute subject heatmap');
    throw err;
  }
}

// ─── Term Trends ────────────────────────────────────────────────────────────

export async function getTermTrends(
  schoolId: string,
  year?: number,
): Promise<TermTrendData> {
  const currentYear = year ?? new Date().getFullYear();
  const schoolOid = new mongoose.Types.ObjectId(schoolId);

  try {
    const terms: TermTrendPoint[] = [];

    for (let t = 1; t <= 4; t++) {
      const termStart = new Date(currentYear, (t - 1) * 3, 1);
      const termEnd = new Date(currentYear, t * 3, 1);

      const [attAgg, passAgg, feeAgg] = await Promise.all([
        Attendance.aggregate([
          { $match: { schoolId: schoolOid, isDeleted: false, date: { $gte: termStart, $lt: termEnd } } },
          { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
        ]),
        Mark.aggregate([
          { $lookup: { from: 'assessments', localField: 'assessmentId', foreignField: '_id', as: 'a' } },
          { $unwind: '$a' },
          { $match: { schoolId: schoolOid, isDeleted: false, 'a.term': t, 'a.academicYear': currentYear, 'a.isDeleted': false } },
          { $group: { _id: null, total: { $sum: 1 }, passed: { $sum: { $cond: [{ $gte: ['$percentage', 50] }, 1, 0] } } } },
        ]),
        Invoice.aggregate([
          { $match: { schoolId: schoolOid, isDeleted: false, createdAt: { $gte: termStart, $lt: termEnd } } },
          { $group: { _id: null, totalPaid: { $sum: '$paidAmount' }, totalAmount: { $sum: '$totalAmount' } } },
        ]),
      ]);

      const att = attAgg[0];
      const pass = passAgg[0];
      const fee = feeAgg[0];

      terms.push({
        term: t,
        attendance: att ? pct(att.present, att.total) : null,
        passRate: pass ? pct(pass.passed, pass.total) : null,
        feeCollection: fee ? pct(fee.totalPaid, fee.totalAmount) : null,
        teacherAttendance: att ? 95 : null, // Placeholder
      });
    }

    return { year: currentYear, terms };
  } catch (err: unknown) {
    logger.error({ err, schoolId }, 'Failed to compute term trends');
    throw err;
  }
}

// ─── Teacher Performance (Anonymised) ───────────────────────────────────────

export async function getTeacherPerformance(
  schoolId: string,
  term?: number,
  year?: number,
): Promise<TeacherPerformanceEntry[]> {
  const now = new Date();
  const currentYear = year ?? now.getFullYear();
  const currentTerm = term ?? Math.min(4, Math.ceil((now.getMonth() + 1) / 3));
  const schoolOid = new mongoose.Types.ObjectId(schoolId);

  try {
    // Get assessments grouped by teacher (class.teacherId)
    const results = await Assessment.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          isDeleted: false,
          term: currentTerm,
          academicYear: currentYear,
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
      {
        $lookup: {
          from: 'marks',
          localField: '_id',
          foreignField: 'assessmentId',
          as: 'marks',
        },
      },
      {
        $group: {
          _id: '$classInfo.teacherId',
          subjects: { $addToSet: '$subjectId' },
          classes: { $addToSet: '$classId' },
          totalMarks: { $sum: { $size: '$marks' } },
          passedMarks: {
            $sum: {
              $size: {
                $filter: {
                  input: '$marks',
                  as: 'm',
                  cond: { $gte: ['$$m.percentage', 50] },
                },
              },
            },
          },
          avgMark: { $avg: { $avg: '$marks.percentage' } },
        },
      },
    ]);

    // Get homework counts per teacher
    const hwCounts = await Homework.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          isDeleted: false,
          createdAt: {
            $gte: new Date(currentYear, (currentTerm - 1) * 3, 1),
            $lt: new Date(currentYear, currentTerm * 3, 1),
          },
        },
      },
      { $group: { _id: '$teacherId', count: { $sum: 1 } } },
    ]);

    const hwMap = new Map<string, number>();
    for (const h of hwCounts) {
      hwMap.set(String(h._id), h.count as number);
    }

    // Shuffle teacher order for anonymisation
    const shuffled = [...results].sort(() => Math.random() - 0.5);

    return shuffled.map((r, i) => ({
      teacherIndex: i + 1,
      subjectCount: (r.subjects as unknown[]).length,
      classCount: (r.classes as unknown[]).length,
      averageClassPassRate: pct(r.passedMarks as number, r.totalMarks as number),
      averageClassMark: Math.round(((r.avgMark as number) ?? 0) * 10) / 10,
      homeworkSetCount: hwMap.get(String(r._id)) ?? 0,
      attendanceRate: 95, // Placeholder — real staff attendance needed
    }));
  } catch (err: unknown) {
    logger.error({ err, schoolId }, 'Failed to compute teacher performance');
    throw err;
  }
}
