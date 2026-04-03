import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { PlansService } from './service-plans.js';
import { ProgressService } from './service-progress.js';
import { PacingService } from './service-pacing.js';
import { BenchmarksService } from './service-benchmarks.js';
import { InterventionsService } from './service-interventions.js';

export class CurriculumController {
  // ─── Plans ─────────────────────────────────────────────────────────────────

  static async createPlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const plan = await PlansService.createPlan(user.schoolId!, req.body);
    res.status(201).json(apiResponse(true, plan, 'Curriculum plan created successfully'));
  }

  static async listPlans(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await PlansService.listPlans(user.schoolId!, {
      subjectId: req.query.subjectId as string | undefined,
      gradeId: req.query.gradeId as string | undefined,
      term: req.query.term ? Number(req.query.term) : undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getPlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const plan = await PlansService.getPlan(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, plan));
  }

  static async updatePlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const plan = await PlansService.updatePlan(req.params.id as string, user.schoolId!, req.body);
    res.json(apiResponse(true, plan, 'Curriculum plan updated successfully'));
  }

  static async deletePlan(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await PlansService.deletePlan(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, undefined, 'Curriculum plan deleted successfully'));
  }

  // ─── Progress ──────────────────────────────────────────────────────────────

  static async submitProgress(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const update = await ProgressService.submitProgress(
      req.params.planId as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, update, 'Progress submitted successfully'));
  }

  static async listProgress(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await ProgressService.listProgress(
      req.params.planId as string,
      user.schoolId!,
      {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      },
    );
    res.json(apiResponse(true, result));
  }

  // ─── Pacing Overview ───────────────────────────────────────────────────────

  static async getPacingOverview(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data = await PacingService.getOverview(user.schoolId!, {
      term: req.query.term ? Number(req.query.term) : undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      departmentId: req.query.departmentId as string | undefined,
    });
    res.json(apiResponse(true, data));
  }

  // ─── Benchmarks ────────────────────────────────────────────────────────────

  static async saveBenchmark(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const benchmark = await BenchmarksService.saveBenchmark(user.schoolId!, req.body);
    res.status(201).json(apiResponse(true, benchmark, 'Benchmark saved successfully'));
  }

  static async listBenchmarks(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await BenchmarksService.listBenchmarks(user.schoolId!, {
      subjectId: req.query.subjectId as string | undefined,
      gradeId: req.query.gradeId as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getBenchmarkComparison(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const comparison = await BenchmarksService.getComparison(user.schoolId!, {
      subjectId: req.query.subjectId as string | undefined,
      gradeId: req.query.gradeId as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
    });
    res.json(apiResponse(true, comparison));
  }

  static async getBenchmarkTrends(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const trends = await BenchmarksService.getTrends(user.schoolId!, {
      subjectId: req.query.subjectId as string | undefined,
      gradeId: req.query.gradeId as string | undefined,
    });
    res.json(apiResponse(true, trends));
  }

  // ─── Interventions ─────────────────────────────────────────────────────────

  static async listInterventions(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await InterventionsService.listInterventions(user.schoolId!, {
      status: req.query.status as string | undefined,
      teacherId: req.query.teacherId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async updateIntervention(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const intervention = await InterventionsService.updateIntervention(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, intervention, 'Intervention updated successfully'));
  }
}
