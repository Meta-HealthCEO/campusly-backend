import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { WhatsAppService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class WhatsAppController {
  // ─── Config ─────────────────────────────────────────────────────────────────

  static async getConfig(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const config = await WhatsAppService.getConfig(schoolId);
    res.json(apiResponse(true, config));
  }

  static async upsertConfig(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const config = await WhatsAppService.upsertConfig(schoolId, req.body);
    res.json(apiResponse(true, config, 'WhatsApp configuration saved'));
  }

  // ─── Messaging ──────────────────────────────────────────────────────────────

  static async sendMessage(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const message = await WhatsAppService.sendMessage(schoolId, req.body);
    res.status(201).json(apiResponse(true, message, 'Message sent'));
  }

  static async broadcast(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await WhatsAppService.broadcast(schoolId, req.body);
    res.json(apiResponse(true, result, 'Broadcast queued'));
  }

  // ─── Webhook (NO AUTH) ────────────────────────────────────────────────────

  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const data = req.body as Record<string, string>;
    await WhatsAppService.handleWebhook(data);
    // Twilio expects 200 OK with minimal body
    res.status(200).send('<Response></Response>');
  }

  // ─── Reports ──────────────────────────────────────────────────────────────

  static async getDeliveryReport(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await WhatsAppService.getDeliveryReport(
      schoolId,
      {
        status: req.query.status as string | undefined,
        templateType: req.query.templateType as string | undefined,
      },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result));
  }

  static async getDeliveryStats(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const stats = await WhatsAppService.getDeliveryStats(schoolId);
    res.json(apiResponse(true, stats));
  }

  // ─── Opt-In / Opt-Out ────────────────────────────────────────────────────

  static async optIn(req: Request, res: Response): Promise<void> {
    const userId = getUser(req).id;
    const schoolId = req.user!.schoolId!;
    const record = await WhatsAppService.optIn(
      userId,
      schoolId,
      req.body.phoneNumber,
      req.body.preferredLanguage ?? 'en',
    );
    res.json(apiResponse(true, record, 'Opted in to WhatsApp messages'));
  }

  static async optOut(req: Request, res: Response): Promise<void> {
    const userId = getUser(req).id;
    const schoolId = req.user!.schoolId!;
    const record = await WhatsAppService.optOut(userId, schoolId);
    res.json(apiResponse(true, record, 'Opted out of WhatsApp messages'));
  }

  static async getOptInStatus(req: Request, res: Response): Promise<void> {
    const userId = getUser(req).id;
    const schoolId = req.user!.schoolId!;
    const status = await WhatsAppService.getOptInStatus(userId, schoolId);
    res.json(apiResponse(true, status));
  }
}
