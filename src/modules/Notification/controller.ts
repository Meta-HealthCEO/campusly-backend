import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { NotificationService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class NotificationController {
  static async create(req: Request, res: Response): Promise<void> {
    const notification = await NotificationService.create(req.body);
    res.status(201).json(apiResponse(true, notification, 'Notification created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const recipientId = getUser(req).id;
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      isRead: req.query.isRead as string | undefined,
    };

    const result = await NotificationService.list(recipientId, query);
    res.json(apiResponse(true, result, 'Notifications retrieved successfully'));
  }

  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    const count = await NotificationService.getUnreadCount(getUser(req).id);
    res.json(apiResponse(true, { count }, 'Unread count retrieved successfully'));
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    const notification = await NotificationService.markAsRead(req.params.id as string);
    res.json(apiResponse(true, notification, 'Notification marked as read'));
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    const count = await NotificationService.markAllAsRead(getUser(req).id);
    res.json(apiResponse(true, { modifiedCount: count }, 'All notifications marked as read'));
  }

  static async bulkCreate(req: Request, res: Response): Promise<void> {
    const result = await NotificationService.bulkCreate(req.body);
    res.status(201).json(apiResponse(true, result, 'Bulk notifications created successfully'));
  }

  static async getPreferences(req: Request, res: Response): Promise<void> {
    const preferences = await NotificationService.getPreferences(getUser(req).id);
    res.json(apiResponse(true, preferences, 'Preferences retrieved successfully'));
  }

  static async updatePreferences(req: Request, res: Response): Promise<void> {
    const preferences = await NotificationService.updatePreferences(getUser(req).id, req.body);
    res.json(apiResponse(true, preferences, 'Preferences updated successfully'));
  }
}
