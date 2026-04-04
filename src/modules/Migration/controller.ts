import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { MigrationService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class MigrationController {
  static async upload(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { sourceSystem, originalName, fileUrl, fileSize } = req.body;
    const job = await MigrationService.uploadFile(
      schoolId,
      sourceSystem,
      { originalName, fileUrl, fileSize },
      getUser(req).id,
    );
    res.status(201).json(apiResponse(true, job, 'Migration job created successfully'));
  }

  static async validate(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const job = await MigrationService.validateData(req.params.jobId as string, schoolId);
    res.json(apiResponse(true, job, 'Validation completed'));
  }

  static async preview(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const preview = await MigrationService.getPreview(req.params.jobId as string, schoolId);
    res.json(apiResponse(true, preview, 'Preview retrieved successfully'));
  }

  static async updateMapping(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const job = await MigrationService.updateMapping(
      req.params.jobId as string,
      schoolId,
      req.body.mapping,
    );
    res.json(apiResponse(true, job, 'Mapping updated successfully'));
  }

  static async execute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const job = await MigrationService.executeImport(req.params.jobId as string, schoolId);
    res.json(apiResponse(true, job, 'Import executed successfully'));
  }

  static async getStatus(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const job = await MigrationService.getJobStatus(req.params.jobId as string, schoolId);
    res.json(apiResponse(true, job, 'Job status retrieved'));
  }

  static async getHistory(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      status: req.query.status as string | undefined,
    };
    const result = await MigrationService.getJobHistory(query);
    res.json(apiResponse(true, result, 'Job history retrieved'));
  }

  static async createTemplate(req: Request, res: Response): Promise<void> {
    const template = await MigrationService.createTemplate(req.body);
    res.status(201).json(apiResponse(true, template, 'Template created successfully'));
  }

  static async getTemplates(req: Request, res: Response): Promise<void> {
    const templates = await MigrationService.getTemplates(
      req.query.sourceSystem as string | undefined,
      req.query.entityType as string | undefined,
    );
    res.json(apiResponse(true, templates, 'Templates retrieved'));
  }
}
