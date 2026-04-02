import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { CommunicationModuleService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class CommunicationController {
  // ─── Templates ────────────────────────────────────────────────────────────

  static async createTemplate(req: Request, res: Response): Promise<void> {
    const template = await CommunicationModuleService.createTemplate(req.body);
    res.status(201).json(apiResponse(true, template, 'Template created successfully'));
  }

  static async listTemplates(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await CommunicationModuleService.listTemplates(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Templates retrieved successfully'));
  }

  static async getTemplate(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const template = await CommunicationModuleService.getTemplateById(req.params.id as string, schoolId);
    res.json(apiResponse(true, template, 'Template retrieved successfully'));
  }

  static async updateTemplate(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const template = await CommunicationModuleService.updateTemplate(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, template, 'Template updated successfully'));
  }

  static async deleteTemplate(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await CommunicationModuleService.deleteTemplate(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Template deleted successfully'));
  }

  // ─── Bulk Messages ────────────────────────────────────────────────────────

  static async sendBulkMessage(req: Request, res: Response): Promise<void> {
    const message = await CommunicationModuleService.sendBulkMessage(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, message, 'Bulk message sent successfully'));
  }

  static async listMessages(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await CommunicationModuleService.listMessages(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Messages retrieved successfully'));
  }

  static async getMessage(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const message = await CommunicationModuleService.getMessageById(req.params.id as string, schoolId);
    res.json(apiResponse(true, message, 'Message retrieved successfully'));
  }

  // ─── Scheduling ────────────────────────────────────────────────────────────

  static async scheduleMessage(req: Request, res: Response): Promise<void> {
    const message = await CommunicationModuleService.scheduleMessage(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, message, 'Message scheduled successfully'));
  }

  // ─── Read Receipts ────────────────────────────────────────────────────────

  static async markMessageRead(req: Request, res: Response): Promise<void> {
    const message = await CommunicationModuleService.markMessageRead(
      getUser(req).id,
      req.params.id as string,
    );
    res.json(apiResponse(true, message, 'Message marked as read'));
  }

  static async getReadReceipts(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const receipts = await CommunicationModuleService.getReadReceipts(
      schoolId,
      req.params.id as string,
    );
    res.json(apiResponse(true, receipts, 'Read receipts retrieved successfully'));
  }

  static async getReadReceiptStats(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const stats = await CommunicationModuleService.getReadReceiptStats(
      schoolId,
      req.params.id as string,
    );
    res.json(apiResponse(true, stats, 'Read receipt stats retrieved successfully'));
  }

  // ─── Delivery Stats ───────────────────────────────────────────────────────

  static async getDeliveryStats(req: Request, res: Response): Promise<void> {
    const stats = await CommunicationModuleService.getDeliveryStats(req.params.id as string);
    res.json(apiResponse(true, stats, 'Delivery stats retrieved successfully'));
  }

  static async getMessageLogs(req: Request, res: Response): Promise<void> {
    const logs = await CommunicationModuleService.getMessageLogs(req.params.id as string, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, logs, 'Message logs retrieved successfully'));
  }
}
