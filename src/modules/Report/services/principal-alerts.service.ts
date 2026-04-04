import mongoose from 'mongoose';
import { Attendance } from '../../Attendance/model.js';
import { Mark, Assessment, Class } from '../../Academic/model.js';
import { Invoice } from '../../Fee/model.js';
import { SchoolBenchmark } from '../models/SchoolBenchmark.js';
import { logger } from '../../../common/logger.js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AlertDetail {
  classId: string;
  className: string;
  subjectName: string;
  passRate: number;
}

export interface RiskAlert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  count?: number;
  threshold?: number;
  currentValue?: number;
  details?: AlertDetail[];
}

export interface RiskAlertResponse {
  alerts: RiskAlert[];
  generatedAt: string;
}

// ─── Risk Alerts ────────────────────────────────────────────────────────────

export async function getRiskAlerts(schoolId: string): Promise<RiskAlertResponse> {
  const schoolOid = new mongoose.Types.ObjectId(schoolId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const currentTerm = Math.min(4, Math.ceil((now.getMonth() + 1) / 3));
  const currentYear = now.getFullYear();

  try {
    const benchmark = await SchoolBenchmark.findOne({
      schoolId: schoolOid,
      isDeleted: false,
    }).lean();

    const passRateThreshold = benchmark?.benchmarks?.passRate?.schoolTarget ?? 70;
    const feeThreshold = benchmark?.benchmarks?.feeCollectionRate?.schoolTarget ?? 85;
    const attendanceThreshold = benchmark?.benchmarks?.attendanceRate?.schoolTarget ?? 85;
    const teacherAbsenceThreshold = 3;

    const alerts: RiskAlert[] = [];

    // 1. Teacher absence alert (teachers who recorded less than expected)
    const teacherAbsenceAgg = await Attendance.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          isDeleted: false,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$recordedBy',
          daysActive: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: { 'user.role': 'teacher', 'user.isDeleted': false } },
    ]);

    // Get total school days this month (weekdays)
    let schoolDays = 0;
    const d = new Date(startOfMonth);
    while (d <= now) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) schoolDays++;
      d.setDate(d.getDate() + 1);
    }

    const absentTeachers = teacherAbsenceAgg.filter(
      (t) => schoolDays - (t.daysActive as string[]).length > teacherAbsenceThreshold,
    );

    if (absentTeachers.length > 0) {
      alerts.push({
        type: 'teacher_absence',
        severity: absentTeachers.length >= 3 ? 'high' : 'medium',
        message: `${absentTeachers.length} teacher(s) have been absent more than ${teacherAbsenceThreshold} days this month`,
        count: absentTeachers.length,
        threshold: teacherAbsenceThreshold,
      });
    }

    // 2. Low pass rate classes
    const lowPassAgg = await Mark.aggregate([
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
          from: 'classes',
          localField: 'assessment.classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
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
        $group: {
          _id: { classId: '$assessment.classId', subjectId: '$assessment.subjectId' },
          className: { $first: '$classInfo.name' },
          subjectName: { $first: '$subject.name' },
          total: { $sum: 1 },
          passed: { $sum: { $cond: [{ $gte: ['$percentage', 50] }, 1, 0] } },
        },
      },
      {
        $addFields: {
          passRate: {
            $round: [{ $multiply: [{ $divide: ['$passed', { $max: ['$total', 1] }] }, 100] }, 1],
          },
        },
      },
      { $match: { passRate: { $lt: passRateThreshold } } },
      { $sort: { passRate: 1 } },
      { $limit: 10 },
    ]);

    if (lowPassAgg.length > 0) {
      alerts.push({
        type: 'low_pass_rate',
        severity: 'high',
        message: `${lowPassAgg.length} class/subject combination(s) have a pass rate below ${passRateThreshold}%`,
        count: lowPassAgg.length,
        threshold: passRateThreshold,
        details: lowPassAgg.map((r) => ({
          classId: String(r._id.classId),
          className: r.className as string,
          subjectName: r.subjectName as string,
          passRate: r.passRate as number,
        })),
      });
    }

    // 3. Fee collection below target
    const feeAgg = await Invoice.aggregate([
      { $match: { schoolId: schoolOid, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$paidAmount' },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    if (feeAgg.length > 0) {
      const rate =
        Math.round(
          ((feeAgg[0].totalPaid as number) / Math.max(feeAgg[0].totalAmount as number, 1)) * 1000,
        ) / 10;
      if (rate < feeThreshold) {
        alerts.push({
          type: 'fee_collection_below_target',
          severity: rate < feeThreshold - 15 ? 'high' : 'medium',
          message: `Fee collection rate (${rate}%) is below the school target (${feeThreshold}%)`,
          currentValue: rate,
          threshold: feeThreshold,
        });
      }
    }

    // 4. High absenteeism class
    const classAttAgg = await Attendance.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          isDeleted: false,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$classId',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
        },
      },
      {
        $addFields: {
          rate: {
            $round: [{ $multiply: [{ $divide: ['$present', { $max: ['$total', 1] }] }, 100] }, 1],
          },
        },
      },
      { $match: { rate: { $lt: attendanceThreshold } } },
    ]);

    if (classAttAgg.length > 0) {
      alerts.push({
        type: 'high_absenteeism_class',
        severity: classAttAgg.length >= 3 ? 'high' : 'low',
        message: `${classAttAgg.length} class(es) have an attendance rate below ${attendanceThreshold}%`,
        count: classAttAgg.length,
        threshold: attendanceThreshold,
      });
    }

    return {
      alerts,
      generatedAt: now.toISOString(),
    };
  } catch (err: unknown) {
    logger.error({ err, schoolId }, 'Failed to compute risk alerts');
    throw err;
  }
}
