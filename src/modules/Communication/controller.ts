import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { CommunicationModuleService } from './service.js';
import { DeliveryService } from './delivery-service.js';
import { apiResponse } from '../../common/utils.js';

export class CommunicationController {
  // ─── Templates ────────────────────────────────────────────────────────────

  static async createTemplate(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data = { ...req.body, createdBy: user.id };
    const template = await CommunicationModuleService.createTemplate(data);
    res.status(201).json(apiResponse(true, template, 'Template created successfully'));
  }

  static async listTemplates(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? getUser(req).schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await CommunicationModuleService.listTemplates(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      channel: req.query.channel as string | undefined,
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    });
    res.json(apiResponse(true, result, 'Templates retrieved successfully'));
  }

  static async getTemplate(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const template = await CommunicationModuleService.getTemplateById(req.params.id as string, schoolId);
    res.json(apiResponse(true, template, 'Template retrieved successfully'));
  }

  static async updateTemplate(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const template = await CommunicationModuleService.updateTemplate(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, template, 'Template updated successfully'));
  }

  static async deleteTemplate(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    await CommunicationModuleService.deleteTemplate(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Template deleted successfully'));
  }

  static async previewTemplate(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const preview = await DeliveryService.previewTemplate(
      req.params.id as string, schoolId, req.body.variables ?? {},
    );
    res.json(apiResponse(true, preview, 'Template preview generated'));
  }

  // ─── Bulk Messages ────────────────────────────────────────────────────────

  static async sendBulkMessage(req: Request, res: Response): Promise<void> {
    const message = await CommunicationModuleService.sendBulkMessage(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, message, 'Bulk message sent successfully'));
  }

  static async listMessages(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? getUser(req).schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await CommunicationModuleService.listMessages(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Messages retrieved successfully'));
  }

  static async getMessage(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
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
    const message = await CommunicationModuleService.markMessageRead(getUser(req).schoolId!, getUser(req).id, req.params.id as string);
    res.json(apiResponse(true, message, 'Message marked as read'));
  }

  static async getReadReceipts(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const receipts = await CommunicationModuleService.getReadReceipts(schoolId, req.params.id as string);
    res.json(apiResponse(true, receipts, 'Read receipts retrieved successfully'));
  }

  static async getReadReceiptStats(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const stats = await CommunicationModuleService.getReadReceiptStats(schoolId, req.params.id as string);
    res.json(apiResponse(true, stats, 'Read receipt stats retrieved successfully'));
  }

  // ─── Delivery Stats ───────────────────────────────────────────────────────

  static async getDeliveryStats(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId ?? '';
    const stats = await CommunicationModuleService.getDeliveryStats(req.params.id as string, schoolId);
    res.json(apiResponse(true, stats, 'Delivery stats retrieved successfully'));
  }

  static async getMessageLogs(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId ?? '';
    const logs = await CommunicationModuleService.getMessageLogs(req.params.id as string, schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, logs, 'Message logs retrieved successfully'));
  }

  // ─── Channel Config ───────────────────────────────────────────────────────

  static async getConfig(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? getUser(req).schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const cfg = await DeliveryService.getConfig(schoolId);
    res.json(apiResponse(true, cfg, 'Configuration retrieved successfully'));
  }

  static async updateConfig(req: Request, res: Response): Promise<void> {
    const { schoolId, channels } = req.body;
    const updated = await DeliveryService.updateConfig(schoolId, channels);
    res.json(apiResponse(true, updated, 'Configuration updated successfully'));
  }

  static async testChannel(req: Request, res: Response): Promise<void> {
    const { schoolId, channel, recipientEmail, recipientPhone, recipientDeviceToken } = req.body;
    const result = await DeliveryService.testChannel(schoolId, channel, {
      recipientEmail, recipientPhone, recipientDeviceToken,
    });
    res.json(apiResponse(true, result, `Test ${channel} sent successfully`));
  }

  // ─── Delivery Log / Stats (global) ────────────────────────────────────────

  static async getDeliveryLog(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? getUser(req).schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await DeliveryService.getDeliveryLogs(schoolId, {
      batchId: req.query.batchId as string | undefined,
      channel: req.query.channel as string | undefined,
      status: req.query.status as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      recipientSearch: req.query.recipientSearch as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Delivery logs retrieved'));
  }

  static async getDeliveryStatsGlobal(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? getUser(req).schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const stats = await DeliveryService.getDeliveryStats(schoolId, {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      channel: req.query.channel as string | undefined,
    });
    res.json(apiResponse(true, stats, 'Delivery stats retrieved'));
  }

  static async retryDelivery(req: Request, res: Response): Promise<void> {
    const schoolId = getUser(req).schoolId!;
    const result = await DeliveryService.retryDelivery(req.params.id as string, schoolId);
    res.json(apiResponse(true, result, 'Delivery retried'));
  }

  // ─── Device Registration ──────────────────────────────────────────────────

  static async registerDevice(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const device = await DeliveryService.registerDevice(user.id, user.schoolId!, req.body);
    res.json(apiResponse(true, device, 'Device registered for push notifications'));
  }

  static async unregisterDevice(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await DeliveryService.unregisterDevice(user.id, req.params.token as string);
    res.json(apiResponse(true, undefined, 'Device unregistered'));
  }
}
