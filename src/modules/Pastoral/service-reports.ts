import mongoose from 'mongoose';
import { PastoralReferral, CounselorSession } from './model.js';

export class ReportService {
  static async getReport(
    schoolId: string,
    reportType: 'referral_reasons' | 'sessions_monthly' | 'outcomes',
    year?: number,
  ) {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const targetYear = year ?? new Date().getFullYear();

    if (reportType === 'referral_reasons') {
      return ReportService.referralReasonsReport(schoolOid, targetYear);
    }

    if (reportType === 'sessions_monthly') {
      return ReportService.sessionsMonthlyReport(schoolOid, targetYear);
    }

    return ReportService.outcomesReport(schoolOid, targetYear);
  }

  private static async referralReasonsReport(
    schoolOid: mongoose.Types.ObjectId,
    year: number,
  ) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const results = await PastoralReferral.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          isDeleted: false,
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$urgency', 'critical'] }, 1, 0] },
          },
          highCount: {
            $sum: { $cond: [{ $eq: ['$urgency', 'high'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = results.reduce((sum, r: { count: number }) => sum + r.count, 0);
    return {
      reportType: 'referral_reasons',
      year,
      total,
      data: results.map((r: { _id: string; count: number; criticalCount: number; highCount: number }) => ({
        reason: r._id,
        count: r.count,
        criticalCount: r.criticalCount,
        highCount: r.highCount,
        percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
      })),
    };
  }

  private static async sessionsMonthlyReport(
    schoolOid: mongoose.Types.ObjectId,
    year: number,
  ) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const results = await CounselorSession.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          isDeleted: false,
          sessionDate: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$sessionDate' },
            sessionType: '$sessionType',
          },
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    return {
      reportType: 'sessions_monthly',
      year,
      data: results.map((r: {
        _id: { month: number; sessionType: string };
        count: number;
        totalDuration: number;
      }) => ({
        month: r._id.month,
        sessionType: r._id.sessionType,
        count: r.count,
        totalDuration: r.totalDuration,
      })),
    };
  }

  private static async outcomesReport(
    schoolOid: mongoose.Types.ObjectId,
    year: number,
  ) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const results = await PastoralReferral.aggregate([
      {
        $match: {
          schoolId: schoolOid,
          isDeleted: false,
          status: { $in: ['resolved', 'closed'] },
          resolvedAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$outcome',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = results.reduce((sum, r: { count: number }) => sum + r.count, 0);
    return {
      reportType: 'outcomes',
      year,
      total,
      data: results.map((r: { _id: string | null; count: number }) => ({
        outcome: r._id ?? 'not_set',
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
      })),
    };
  }
}
