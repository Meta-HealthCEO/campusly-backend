import mongoose from 'mongoose';
import { NationalBenchmark } from './model.js';
import { paginationHelper } from '../../common/utils.js';
import type { SaveBenchmarkInput } from './validation.js';

export class BenchmarksService {
  static async saveBenchmark(schoolId: string, data: SaveBenchmarkInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const subjectOid = new mongoose.Types.ObjectId(data.subjectId);
    const gradeOid = new mongoose.Types.ObjectId(data.gradeId);

    const benchmark = await NationalBenchmark.findOneAndUpdate(
      { schoolId: soid, subjectId: subjectOid, gradeId: gradeOid, year: data.year },
      {
        $set: {
          targetPassRate: data.targetPassRate,
          targetAverageScore: data.targetAverageScore,
          source: data.source ?? '',
          isDeleted: false,
        },
      },
      { upsert: true, new: true },
    )
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name level')
      .lean();

    return benchmark;
  }

  static async listBenchmarks(
    schoolId: string,
    filters: { subjectId?: string; gradeId?: string; year?: number; page?: number; limit?: number },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };
    if (filters.subjectId) query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    if (filters.gradeId) query.gradeId = new mongoose.Types.ObjectId(filters.gradeId);
    if (filters.year) query.year = filters.year;

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [benchmarks, total] = await Promise.all([
      NationalBenchmark.find(query)
        .sort({ year: -1 })
        .skip(skip)
        .limit(limit)
        .populate('subjectId', 'name code')
        .populate('gradeId', 'name level')
        .lean(),
      NationalBenchmark.countDocuments(query),
    ]);

    return { benchmarks, total, page: filters.page ?? 1, limit };
  }

  static async getComparison(
    schoolId: string,
    filters: { subjectId?: string; gradeId?: string; year?: number },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };
    if (filters.subjectId) query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    if (filters.gradeId) query.gradeId = new mongoose.Types.ObjectId(filters.gradeId);
    if (filters.year) query.year = filters.year;

    const benchmarks = await NationalBenchmark.find(query)
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name level')
      .lean();

    // TODO: integrate with Academic marks collection when available
    // For now return placeholder structure with 0 values for actual performance
    const comparison = benchmarks.map((b) => ({
      benchmark: b,
      actual: {
        passRate: 0,
        averageScore: 0,
        totalStudents: 0,
        passCount: 0,
        note: 'Actual data pending integration with Academic marks collection',
      },
      gap: {
        passRateGap: b.targetPassRate - 0,
        averageScoreGap: (b.targetAverageScore ?? 0) - 0,
        onTrack: false,
      },
    }));

    return comparison;
  }

  static async getTrends(
    schoolId: string,
    filters: { subjectId?: string; gradeId?: string },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };
    if (filters.subjectId) query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    if (filters.gradeId) query.gradeId = new mongoose.Types.ObjectId(filters.gradeId);

    const benchmarks = await NationalBenchmark.find(query)
      .sort({ year: 1 })
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name level')
      .lean();

    // TODO: integrate with Academic marks collection when available
    // Group by subject+grade and return year-on-year trend structure
    const trendMap = new Map<string, { subject: unknown; grade: unknown; years: unknown[] }>();

    for (const b of benchmarks) {
      const key = `${String(b.subjectId)}_${String(b.gradeId)}`;
      if (!trendMap.has(key)) {
        trendMap.set(key, { subject: b.subjectId, grade: b.gradeId, years: [] });
      }
      trendMap.get(key)!.years.push({
        year: b.year,
        targetPassRate: b.targetPassRate,
        targetAverageScore: b.targetAverageScore ?? 0,
        actualPassRate: 0, // placeholder until marks integration
        actualAverageScore: 0, // placeholder until marks integration
      });
    }

    return Array.from(trendMap.values());
  }
}
