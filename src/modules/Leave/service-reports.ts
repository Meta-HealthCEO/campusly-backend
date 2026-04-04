import mongoose from 'mongoose';
import { LeaveRequest } from './model.js';
import { User } from '../Auth/model.js';
import { logger } from '../../common/logger.js';
import type { LeaveCalendarQueryInput, SubstituteQueryInput, ReportSummaryQueryInput } from './validation.js';

export class LeaveReportService {
  // ─── Calendar ───────────────────────────────────────────────────────────

  static async getCalendar(
    schoolId: string,
    query: LeaveCalendarQueryInput,
  ) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    const matchStage: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
      status: 'approved',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    };

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'staffId',
          foreignField: '_id',
          as: 'staff',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, departmentId: 1 } },
          ],
        },
      },
      { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
    ];

    // Filter by department if provided
    if (query.department) {
      pipeline.push({
        $match: {
          'staff.departmentId': new mongoose.Types.ObjectId(query.department),
        },
      });
    }

    pipeline.push({
      $project: {
        staffId: 1,
        staffName: {
          $concat: ['$staff.firstName', ' ', '$staff.lastName'],
        },
        leaveType: 1,
        startDate: 1,
        endDate: 1,
        isHalfDay: 1,
        halfDayPeriod: 1,
        workingDays: 1,
      },
    });

    pipeline.push({ $sort: { startDate: 1 } });

    const results = await LeaveRequest.aggregate(pipeline);
    return results;
  }

  // ─── Substitute Suggestions ─────────────────────────────────────────────

  static async getSuggestions(
    schoolId: string,
    query: SubstituteQueryInput,
  ) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    // Find staff who are NOT on leave during the period
    const onLeaveStaffIds = await LeaveRequest.distinct('staffId', {
      schoolId,
      isDeleted: false,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    const excludeIds = [...onLeaveStaffIds.map((id) => id.toString())];
    if (query.excludeStaffId) {
      excludeIds.push(query.excludeStaffId);
    }

    const filter: Record<string, unknown> = {
      schoolId,
      isDeleted: false,
      role: 'teacher',
      _id: { $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)) },
    };

    const available = await User.find(filter)
      .select('firstName lastName email')
      .sort({ lastName: 1, firstName: 1 })
      .lean();

    return available;
  }

  // ─── Report Summary ─────────────────────────────────────────────────────

  static async getReportSummary(
    schoolId: string,
    query: ReportSummaryQueryInput,
  ) {
    const year = query.year ?? new Date().getFullYear();
    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${year}-12-31`);

    const matchStage: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
      createdAt: { $gte: yearStart, $lte: yearEnd },
    };

    if (query.staffId) {
      matchStage.staffId = new mongoose.Types.ObjectId(query.staffId);
    }

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
    ];

    // Filter by department if provided
    if (query.department) {
      pipeline.push(
        {
          $lookup: {
            from: 'users',
            localField: 'staffId',
            foreignField: '_id',
            as: 'staff',
            pipeline: [
              { $project: { departmentId: 1 } },
            ],
          },
        },
        { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            'staff.departmentId': new mongoose.Types.ObjectId(query.department),
          },
        },
      );
    }

    // Summary by leave type and status
    pipeline.push(
      {
        $group: {
          _id: { leaveType: '$leaveType', status: '$status' },
          count: { $sum: 1 },
          totalDays: { $sum: '$workingDays' },
        },
      },
      {
        $group: {
          _id: '$_id.leaveType',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              totalDays: '$totalDays',
            },
          },
          totalRequests: { $sum: '$count' },
          totalDays: { $sum: '$totalDays' },
        },
      },
      { $sort: { _id: 1 } },
    );

    const byType = await LeaveRequest.aggregate(pipeline);

    // Overall stats
    const overallPipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalApproved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
          totalDeclined: {
            $sum: { $cond: [{ $eq: ['$status', 'declined'] }, 1, 0] },
          },
          totalPending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          totalDaysUsed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, '$workingDays', 0],
            },
          },
        },
      },
    ];

    const overallResult = await LeaveRequest.aggregate(overallPipeline);
    const overall = overallResult[0] ?? {
      totalRequests: 0,
      totalApproved: 0,
      totalDeclined: 0,
      totalPending: 0,
      totalDaysUsed: 0,
    };

    logger.info({ schoolId, year }, 'Leave report summary generated');
    return { year, overall, byType };
  }
}
