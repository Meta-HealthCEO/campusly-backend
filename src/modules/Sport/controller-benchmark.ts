import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { BenchmarkService } from './service-benchmark.js';
import { AgeGroupBenchmark } from './model-benchmark.js';
import { NotFoundError } from '../../common/errors.js';

export class BenchmarkController {
  static async list(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { sportCode, ageGroup } = req.query;
    const benchmarks = await BenchmarkService.list({
      schoolId: user.schoolId,
      sportCode: typeof sportCode === 'string' ? sportCode : undefined,
      ageGroup: typeof ageGroup === 'string' ? ageGroup : undefined,
    });
    res.status(200).json(apiResponse(true, benchmarks, 'Benchmarks retrieved'));
  }

  static async snapshot(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sportCode = (req.query.sport as string) ?? 'soccer';
    const snap = await BenchmarkService.snapshotForPlayer(
      req.params.studentId as string,
      user.schoolId!,
      sportCode,
    );
    res.status(200).json(apiResponse(true, snap, 'Player snapshot retrieved'));
  }

  /** Admin-only: upsert a benchmark (school override). */
  static async upsert(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { sportCode, ageGroup, testType } = req.body;
    const benchmark = await AgeGroupBenchmark.findOneAndUpdate(
      { schoolId: user.schoolId, sportCode: String(sportCode).toLowerCase(), ageGroup, testType },
      { $set: { ...req.body, schoolId: user.schoolId, isDefault: false, isDeleted: false } },
      { upsert: true, new: true },
    );
    res.status(200).json(apiResponse(true, benchmark, 'Benchmark saved'));
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await AgeGroupBenchmark.findOneAndUpdate(
      { _id: req.params.id as string, schoolId: user.schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (!result) throw new NotFoundError('Benchmark not found');
    res.status(200).json(apiResponse(true, null, 'Benchmark deleted'));
  }
}
