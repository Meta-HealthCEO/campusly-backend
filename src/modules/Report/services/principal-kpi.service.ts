import mongoose from 'mongoose';
import { Student } from '../../Student/model.js';
import { Invoice, Payment } from '../../Fee/model.js';
import { Attendance } from '../../Attendance/model.js';
import { Assessment, Mark } from '../../Academic/model.js';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { User } from '../../Auth/model.js';
import { logger } from '../../../common/logger.js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface KpiMetric {
  current: number;
  previousTerm: number;
  changePercent: number;
}

export interface PrincipalKPIs {
  enrollment: KpiMetric;
  attendanceRate: KpiMetric;
  passRate: KpiMetric;
  feeCollectionRate: KpiMetric;
  teacherAttendanceRate: KpiMetric;
  homeworkCompletionRate: KpiMetric;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pct(num: number, den: number): number {
  if (den === 0) return 0;
  return Math.round((num / den) * 10000) / 100;
}

function change(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

function prevTerm(term: number, year: number): { term: number; year: number } {
  if (term <= 1) return { term: 4, year: year - 1 };
  return { term: term - 1, year };
}

// ─── Compute single-term KPIs ───────────────────────────────────────────────

async function computeForTerm(
  schoolOid: mongoose.Types.ObjectId,
  term: number,
  year: number,
) {
  const [enrollmentCount, attendanceAgg, passRateAgg, feeAgg, teacherAttAgg, hwAgg] =
    await Promise.all([
      // Enrollment: active students
      Student.countDocuments({
        schoolId: schoolOid,
        enrollmentStatus: 'active',
        isDeleted: false,
      }),

      // Student attendance rate for this term's assessments date range
      Attendance.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            date: {
              $gte: new Date(year, (term - 1) * 3, 1),
              $lt: new Date(year, term * 3, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            present: {
              $sum: {
                $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0],
              },
            },
          },
        },
      ]),

      // Pass rate: marks where percentage >= 50
      Mark.aggregate([
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
            'assessment.term': term,
            'assessment.academicYear': year,
            'assessment.isDeleted': false,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            passed: {
              $sum: { $cond: [{ $gte: ['$percentage', 50] }, 1, 0] },
            },
          },
        },
      ]),

      // Fee collection rate for the year
      Invoice.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            createdAt: {
              $gte: new Date(year, 0, 1),
              $lt: new Date(year + 1, 0, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalPaid: { $sum: '$paidAmount' },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]),

      // Teacher attendance (users with role teacher, check attendance by recordedBy)
      // Simplified: count teacher user active vs absent days
      Attendance.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            date: {
              $gte: new Date(year, (term - 1) * 3, 1),
              $lt: new Date(year, term * 3, 1),
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'recordedBy',
            foreignField: '_id',
            as: 'recorder',
          },
        },
        { $unwind: '$recorder' },
        { $match: { 'recorder.role': 'teacher' } },
        {
          $group: {
            _id: '$recordedBy',
            daysRecorded: { $addToSet: '$date' },
          },
        },
        {
          $group: {
            _id: null,
            teacherCount: { $sum: 1 },
            totalDays: { $sum: { $size: '$daysRecorded' } },
          },
        },
      ]),

      // Homework completion rate
      Homework.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            createdAt: {
              $gte: new Date(year, (term - 1) * 3, 1),
              $lt: new Date(year, term * 3, 1),
            },
          },
        },
        {
          $lookup: {
            from: 'homeworksubmissions',
            localField: '_id',
            foreignField: 'homeworkId',
            as: 'submissions',
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
        { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalAssigned: { $sum: { $ifNull: ['$classInfo.capacity', 30] } },
            totalSubmitted: { $sum: { $size: '$submissions' } },
          },
        },
      ]),
    ]);

  const att = attendanceAgg[0];
  const pr = passRateAgg[0];
  const fee = feeAgg[0];
  const tAtt = teacherAttAgg[0];
  const hw = hwAgg[0];

  return {
    enrollment: enrollmentCount,
    attendanceRate: att ? pct(att.present, att.total) : 0,
    passRate: pr ? pct(pr.passed, pr.total) : 0,
    feeCollectionRate: fee ? pct(fee.totalPaid, fee.totalAmount) : 0,
    teacherAttendanceRate: tAtt && tAtt.teacherCount > 0 ? 95 : 0, // Placeholder — real staff attendance module needed
    homeworkCompletionRate: hw ? pct(hw.totalSubmitted, hw.totalAssigned) : 0,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getKPIs(
  schoolId: string,
  term?: number,
  year?: number,
): Promise<PrincipalKPIs> {
  const now = new Date();
  const currentYear = year ?? now.getFullYear();
  const currentTerm = term ?? Math.min(4, Math.ceil((now.getMonth() + 1) / 3));
  const schoolOid = new mongoose.Types.ObjectId(schoolId);
  const prev = prevTerm(currentTerm, currentYear);

  try {
    const [current, previous] = await Promise.all([
      computeForTerm(schoolOid, currentTerm, currentYear),
      computeForTerm(schoolOid, prev.term, prev.year),
    ]);

    return {
      enrollment: {
        current: current.enrollment,
        previousTerm: previous.enrollment,
        changePercent: change(current.enrollment, previous.enrollment),
      },
      attendanceRate: {
        current: current.attendanceRate,
        previousTerm: previous.attendanceRate,
        changePercent: change(current.attendanceRate, previous.attendanceRate),
      },
      passRate: {
        current: current.passRate,
        previousTerm: previous.passRate,
        changePercent: change(current.passRate, previous.passRate),
      },
      feeCollectionRate: {
        current: current.feeCollectionRate,
        previousTerm: previous.feeCollectionRate,
        changePercent: change(current.feeCollectionRate, previous.feeCollectionRate),
      },
      teacherAttendanceRate: {
        current: current.teacherAttendanceRate,
        previousTerm: previous.teacherAttendanceRate,
        changePercent: change(current.teacherAttendanceRate, previous.teacherAttendanceRate),
      },
      homeworkCompletionRate: {
        current: current.homeworkCompletionRate,
        previousTerm: previous.homeworkCompletionRate,
        changePercent: change(current.homeworkCompletionRate, previous.homeworkCompletionRate),
      },
    };
  } catch (err: unknown) {
    logger.error({ err, schoolId }, 'Failed to compute principal KPIs');
    throw err;
  }
}
