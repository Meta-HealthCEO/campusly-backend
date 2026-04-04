import type { Request, Response } from 'express';
import { DepartmentService } from './service.js';
import { DepartmentAnalyticsService } from './service.analytics.js';
import { ModerationQueueService } from './service.moderation.js';
import { WorkloadService } from './service.workload.js';
import { apiResponse } from '../../common/utils.js';
import { getUser } from '../../types/authenticated-request.js';

export class DepartmentController {
  // ─── Department CRUD ─────────────────────────────────────────────────────

  static async create(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const dept = await DepartmentService.createDepartment(schoolId, req.body);
    res.status(201).json(apiResponse(true, dept, 'Department created'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const departments = await DepartmentService.listDepartments(schoolId);
    res.json(apiResponse(true, departments));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const dept = await DepartmentService.getDepartmentById(req.params.id as string, schoolId);
    res.json(apiResponse(true, dept));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const dept = await DepartmentService.updateDepartment(
      req.params.id as string, schoolId, req.body,
    );
    res.json(apiResponse(true, dept, 'Department updated'));
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    await DepartmentService.deleteDepartment(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Department deleted'));
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  static async performance(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const { term, year } = req.query as { term?: string; year?: string };
    const data = await DepartmentAnalyticsService.getDepartmentPerformance(
      req.params.id as string, schoolId,
      term ? Number(term) : undefined,
      year ? Number(year) : undefined,
    );
    res.json(apiResponse(true, data));
  }

  static async pacing(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const { term, year } = req.query as { term?: string; year?: string };
    const data = await DepartmentAnalyticsService.getCurriculumPacing(
      req.params.id as string, schoolId,
      term ? Number(term) : undefined,
      year ? Number(year) : undefined,
    );
    res.json(apiResponse(true, data));
  }

  static async moderation(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const { status, page, limit } = req.query as {
      status?: string; page?: string; limit?: string;
    };
    const data = await ModerationQueueService.getModerationQueue(
      req.params.id as string, schoolId,
      {
        status,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
    );
    res.json(apiResponse(true, data));
  }

  static async workload(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const data = await WorkloadService.getWorkloadDistribution(
      req.params.id as string, schoolId,
    );
    res.json(apiResponse(true, data));
  }

  static async commonAssessments(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const { subjectId, term, year } = req.query as {
      subjectId?: string; term?: string; year?: string;
    };
    const data = await WorkloadService.getCommonAssessmentAnalysis(
      req.params.id as string, schoolId,
      {
        subjectId,
        term: term ? Number(term) : undefined,
        year: year ? Number(year) : undefined,
      },
    );
    res.json(apiResponse(true, data));
  }

  // ─── Observations ────────────────────────────────────────────────────────

  static async listObservations(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const { teacherId, status, page, limit } = req.query as {
      teacherId?: string; status?: string; page?: string; limit?: string;
    };
    const data = await DepartmentService.listObservations(
      req.params.id as string, schoolId,
      {
        teacherId, status,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
    );
    res.json(apiResponse(true, data));
  }

  static async createObservation(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const obs = await DepartmentService.createObservation(
      req.params.id as string, user.schoolId!, user.id, req.body,
    );
    res.status(201).json(apiResponse(true, obs, 'Observation scheduled'));
  }

  static async updateObservation(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const obs = await DepartmentService.updateObservation(
      req.params.observationId as string,
      req.params.id as string, schoolId, req.body,
    );
    res.json(apiResponse(true, obs, 'Observation updated'));
  }

  static async deleteObservation(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    await DepartmentService.deleteObservation(
      req.params.observationId as string,
      req.params.id as string, schoolId,
    );
    res.json(apiResponse(true, undefined, 'Observation cancelled'));
  }
}
