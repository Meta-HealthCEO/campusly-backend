import { Request, Response } from 'express';
import { AuditService } from './service.js';
import { apiResponse } from '../../common/utils.js';
import { resolveSchoolScope } from '../../common/school-scope.js';

export class AuditController {
  // ─── List Logs ──────────────────────────────────────────────────────────────

  static async listLogs(req: Request, res: Response): Promise<void> {
    const result = await AuditService.listAuditLogs({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      userId: req.query.userId as string | undefined,
      entity: req.query.entity as string | undefined,
      action: req.query.action as 'create' | 'update' | 'delete' | 'login' | 'export' | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      schoolId: resolveSchoolScope(req),
    });
    res.json(apiResponse(true, result));
  }

  // ─── Export Logs ────────────────────────────────────────────────────────────

  static async exportLogs(req: Request, res: Response): Promise<void> {
    const logs = await AuditService.exportAuditLogs({
      userId: req.query.userId as string | undefined,
      entity: req.query.entity as string | undefined,
      action: req.query.action as 'create' | 'update' | 'delete' | 'login' | 'export' | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      schoolId: resolveSchoolScope(req),
    });
    res.json(apiResponse(true, logs, 'Audit logs exported successfully'));
  }
}
