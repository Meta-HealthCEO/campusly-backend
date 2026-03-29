import { Request, Response } from 'express';
import { ConsentService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class ConsentController {
  // ─── Consent Form CRUD ────────────────────────────────────────────────────

  static async createForm(req: Request, res: Response): Promise<void> {
    const form = await ConsentService.createForm(req.body);
    res.status(201).json(apiResponse(true, form, 'Consent form created successfully'));
  }

  static async listForms(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      type: req.query.type as string | undefined,
    };

    const result = await ConsentService.listForms(query);
    res.json(apiResponse(true, result, 'Consent forms retrieved successfully'));
  }

  static async getForm(req: Request, res: Response): Promise<void> {
    const form = await ConsentService.getForm(req.params.id as string);
    res.json(apiResponse(true, form, 'Consent form retrieved successfully'));
  }

  static async updateForm(req: Request, res: Response): Promise<void> {
    const form = await ConsentService.updateForm(req.params.id as string, req.body);
    res.json(apiResponse(true, form, 'Consent form updated successfully'));
  }

  static async deleteForm(req: Request, res: Response): Promise<void> {
    await ConsentService.deleteForm(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Consent form deleted successfully'));
  }

  // ─── Consent Response ─────────────────────────────────────────────────────

  static async recordResponse(req: Request, res: Response): Promise<void> {
    const response = await ConsentService.recordResponse(req.body);
    res.status(201).json(apiResponse(true, response, 'Consent response recorded successfully'));
  }

  static async getResponsesByForm(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await ConsentService.getResponsesByForm(req.params.formId as string, query);
    res.json(apiResponse(true, result, 'Consent responses retrieved successfully'));
  }

  static async getOutstandingConsents(req: Request, res: Response): Promise<void> {
    const forms = await ConsentService.getOutstandingConsents(req.params.studentId as string);
    res.json(apiResponse(true, forms, 'Outstanding consents retrieved successfully'));
  }
}
