import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { MessagingService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class MessagingController {
  static async createThread(req: Request, res: Response): Promise<void> {
    const { id, role, schoolId } = getUser(req);
    const result = await MessagingService.createThread(id, role, schoolId!, req.body);
    res.status(201).json(apiResponse(true, result, 'Thread created successfully'));
  }

  static async listThreads(req: Request, res: Response): Promise<void> {
    const { id, schoolId } = getUser(req);
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await MessagingService.listThreads(id, schoolId!, page, limit);
    res.json(apiResponse(true, result, 'Threads retrieved successfully'));
  }

  static async getThread(req: Request, res: Response): Promise<void> {
    const { id, schoolId } = getUser(req);
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await MessagingService.getThread(
      req.params.id as string, id, schoolId!, page, limit,
    );
    res.json(apiResponse(true, result, 'Thread retrieved successfully'));
  }

  static async sendMessage(req: Request, res: Response): Promise<void> {
    const { id, role, schoolId } = getUser(req);
    const message = await MessagingService.sendMessage(
      id, role, schoolId!, req.body, req.params.id as string,
    );
    res.status(201).json(apiResponse(true, message, 'Message sent successfully'));
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    const { id, schoolId } = getUser(req);
    await MessagingService.markAsRead(req.params.id as string, id, schoolId!);
    res.json(apiResponse(true, undefined, 'Messages marked as read'));
  }

  static async closeThread(req: Request, res: Response): Promise<void> {
    const { id, role, schoolId } = getUser(req);
    const thread = await MessagingService.closeThread(
      req.params.id as string, id, role, schoolId!,
    );
    res.json(apiResponse(true, thread, 'Thread closed successfully'));
  }

  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    const { id, schoolId } = getUser(req);
    const result = await MessagingService.getUnreadCount(id, schoolId!);
    res.json(apiResponse(true, result, 'Unread count retrieved successfully'));
  }
}
