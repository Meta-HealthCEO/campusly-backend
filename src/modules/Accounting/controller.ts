import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { AccountingService } from './service.js';

export class AccountingController {
  static async getConfig(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const config = await AccountingService.getConfig(schoolId);
    res.json(apiResponse(true, config));
  }

  static async upsertConfig(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const config = await AccountingService.upsertConfig(schoolId, req.body);
    res.json(apiResponse(true, config, 'Configuration saved'));
  }

  static async generateExport(req: Request, res: Response): Promise<void> {
    const userId = getUser(req).id;
    const schoolId = req.user!.schoolId!;
    const exportRecord = await AccountingService.generateExport(userId, schoolId, req.body);
    res.status(201).json(apiResponse(true, exportRecord, 'Export generated'));
  }

  static async listExports(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const result = await AccountingService.listExports(schoolId, page, limit);
    res.json(apiResponse(true, result));
  }

  static async downloadExport(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const exportRecord = await AccountingService.downloadExport(
      req.params.id as string,
      schoolId,
    );
    if (!exportRecord) {
      res.status(404).json(apiResponse(false, undefined, 'Export not found'));
      return;
    }
    res.json(apiResponse(true, exportRecord));
  }

  static async getIncomeStatement(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    if (!dateFrom || !dateTo) {
      res.status(400).json(apiResponse(false, undefined, 'dateFrom and dateTo are required'));
      return;
    }
    const statement = await AccountingService.getIncomeStatement(schoolId, dateFrom, dateTo);
    res.json(apiResponse(true, statement));
  }

  static async getCashFlow(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    if (!dateFrom || !dateTo) {
      res.status(400).json(apiResponse(false, undefined, 'dateFrom and dateTo are required'));
      return;
    }
    const cashFlow = await AccountingService.getCashFlow(schoolId, dateFrom, dateTo);
    res.json(apiResponse(true, cashFlow));
  }
}
