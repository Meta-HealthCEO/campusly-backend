import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { PermissionService } from './service.js';
import type {
  ListPermissionsInput,
  UpdatePermissionsInput,
  PermissionAuditQueryInput,
} from './validation.js';

export class PermissionController {
  // ─── List School Permissions ───────────────────────────────────────────────

  static async listSchoolPermissions(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId ?? getUser(req).schoolId;
    const query: ListPermissionsInput = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      role: req.query.role as string | undefined,
      flag: req.query.flag as ListPermissionsInput['flag'],
      search: req.query.search as string | undefined,
    };

    const result = await PermissionService.listBySchool(schoolId as string, query);
    res.json(apiResponse(true, result, 'Permissions listed successfully'));
  }

  // ─── Get User Permissions ─────────────────────────────────────────────────

  static async getUserPermissions(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const userId = req.params.userId as string;

    const user = await PermissionService.getByUser(userId, schoolId as string);
    res.json(apiResponse(true, user, 'User permissions retrieved successfully'));
  }

  // ─── Update User Permissions ──────────────────────────────────────────────

  static async updateUserPermissions(req: Request, res: Response): Promise<void> {
    const currentUser = getUser(req);
    const userId = req.params.userId as string;
    const data: UpdatePermissionsInput = req.body;

    const updated = await PermissionService.updatePermissions(
      userId,
      currentUser.schoolId as string,
      data,
      currentUser.id,
    );

    res.json(apiResponse(true, updated, 'Permissions updated successfully'));
  }

  // ─── Get Audit Logs ───────────────────────────────────────────────────────

  static async getAuditLogs(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId ?? getUser(req).schoolId;
    const query: PermissionAuditQueryInput = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      userId: req.query.userId as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };

    const result = await PermissionService.getAuditLogs(schoolId as string, query);
    res.json(apiResponse(true, result, 'Audit logs retrieved successfully'));
  }
}
