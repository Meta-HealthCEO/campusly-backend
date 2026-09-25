import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { NotificationService } from './service.js';
import { apiResponse } from '../../common/utils.js';
import { ForbiddenError } from '../../common/errors.js';
import { User } from '../Auth/model.js';
import type { BulkNotificationInput, CreateNotificationInput } from './validation.js';

const OWN_SCHOOL_ONLY = 'You can only notify people in your own school';

/** The body names the school; only a super admin may name another one (final review I1). */
function assertOwnSchool(req: Request, schoolId: string): void {
  const user = getUser(req);
  if (user.role === 'super_admin') return;
  if (!user.schoolId || String(user.schoolId) !== schoolId) throw new ForbiddenError(OWN_SCHOOL_ONLY);
}

export class NotificationController {
  static async create(req: Request, res: Response): Promise<void> {
    const body = req.body as CreateNotificationInput;
    assertOwnSchool(req, body.schoolId);
    if (getUser(req).role !== 'super_admin') {
      const inSchool = await User.exists({ _id: body.recipientId, schoolId: body.schoolId, isDeleted: false });
      if (!inSchool) throw new ForbiddenError(OWN_SCHOOL_ONLY);
    }
    const notification = await NotificationService.create(body);
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
    const notification = await NotificationService.markAsRead(req.params.id as string, getUser(req).id);
    res.json(apiResponse(true, notification, 'Notification marked as read'));
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    const count = await NotificationService.markAllAsRead(getUser(req).id);
    res.json(apiResponse(true, { modifiedCount: count }, 'All notifications marked as read'));
  }

  static async bulkCreate(req: Request, res: Response): Promise<void> {
    const body = req.body as BulkNotificationInput;
    assertOwnSchool(req, body.schoolId);
    // A whole-school notice names the school twice; both must be the caller's.
    if (body.targetType === 'school') assertOwnSchool(req, body.targetId);
    const result = await NotificationService.bulkCreate(body);
    res.status(201).json(apiResponse(true, result, 'Bulk notifications created successfully'));
  }

  static async getPreferences(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    if (!user.schoolId) {
      res.status(400).json(apiResponse(false, null, 'schoolId missing from token'));
      return;
    }
    const preferences = await NotificationService.getPreferences(user.id, user.schoolId);
    res.json(apiResponse(true, preferences, 'Preferences retrieved successfully'));
  }

  static async updatePreferences(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    if (!user.schoolId) {
      res.status(400).json(apiResponse(false, null, 'schoolId missing from token'));
      return;
    }
    const preferences = await NotificationService.updatePreferences(user.id, user.schoolId, req.body);
    res.json(apiResponse(true, preferences, 'Preferences updated successfully'));
  }
}
