import mongoose from 'mongoose';
import { Incident } from './model.js';

interface ReportQuery {
  schoolId: string;
  dateFrom?: string;
  dateTo?: string;
}

export class IncidentReportService {
  static async getSummary(query: ReportQuery) {
    const schoolOid = new mongoose.Types.ObjectId(query.schoolId);
    const matchStage: Record<string, unknown> = {
      schoolId: schoolOid,
      isDeleted: false,
    };

    if (query.dateFrom || query.dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (query.dateFrom) dateFilter.$gte = new Date(query.dateFrom);
      if (query.dateTo) dateFilter.$lte = new Date(query.dateTo);
      matchStage.incidentDate = dateFilter;
    }

    const [typeAgg, severityAgg, statusAgg, monthlyAgg, locationAgg, resolutionAgg] =
      await Promise.all([
        Incident.aggregate([
          { $match: matchStage },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        Incident.aggregate([
          { $match: matchStage },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
        ]),
        Incident.aggregate([
          { $match: matchStage },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Incident.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$incidentDate' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Incident.aggregate([
          { $match: { ...matchStage, location: { $exists: true, $ne: '' } } },
          { $group: { _id: '$location', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        Incident.aggregate([
          { $match: { ...matchStage, status: 'resolved', resolvedAt: { $exists: true } } },
          {
            $project: {
              resolutionDays: {
                $divide: [
                  { $subtract: ['$resolvedAt', '$createdAt'] },
                  86400000,
                ],
              },
            },
          },
          { $group: { _id: null, avg: { $avg: '$resolutionDays' } } },
        ]),
      ]);

    const toMap = (agg: Array<{ _id: string; count: number }>) =>
      Object.fromEntries(agg.map((a) => [a._id, a.count]));

    const totalIncidents = typeAgg.reduce(
      (sum: number, a: { count: number }) => sum + a.count, 0,
    );

    return {
      totalIncidents,
      byType: toMap(typeAgg),
      bySeverity: toMap(severityAgg),
      byStatus: toMap(statusAgg),
      averageResolutionDays: resolutionAgg[0]?.avg
        ? Math.round(resolutionAgg[0].avg * 10) / 10
        : 0,
      monthlyTrend: monthlyAgg.map((m: { _id: string; count: number }) => ({
        month: m._id,
        count: m.count,
      })),
      topLocations: locationAgg.map((l: { _id: string; count: number }) => ({
        location: l._id,
        count: l.count,
      })),
    };
  }
}
