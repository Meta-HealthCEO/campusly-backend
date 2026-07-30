import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { AnnouncementService } from './service.js';
import { apiResponse } from '../../common/utils.js';
import { resolveSchoolScope } from '../../common/school-scope.js';

export class AnnouncementController {
  static async create(req: Request, res: Response): Promise<void> {
    const announcement = await AnnouncementService.create(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, announcement, 'Announcement created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req);

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      schoolId,
    };

    const result = await AnnouncementService.list(query);
    res.json(apiResponse(true, result, 'Announcements retrieved successfully'));
  }

  static async getActive(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req);

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await AnnouncementService.getActive(schoolId, getUser(req).role, query);
    res.json(apiResponse(true, result, 'Active announcements retrieved successfully'));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const announcement = await AnnouncementService.getById(req.params.id as string, schoolId);
    res.json(apiResponse(true, announcement, 'Announcement retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const announcement = await AnnouncementService.update(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, announcement, 'Announcement updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AnnouncementService.delete(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Announcement deleted successfully'));
  }

  static async publish(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const announcement = await AnnouncementService.publish(req.params.id as string, schoolId);
    res.json(apiResponse(true, announcement, 'Announcement published successfully'));
  }

  static async unpublish(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const announcement = await AnnouncementService.unpublish(req.params.id as string, schoolId);
    res.json(apiResponse(true, announcement, 'Announcement unpublished successfully'));
  }

  static async schedulePublish(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const announcement = await AnnouncementService.schedulePublish(
      req.params.id as string,
      schoolId,
      req.body.publishAt,
    );
    res.json(apiResponse(true, announcement, 'Announcement scheduled for publishing'));
  }

  static async markAnnouncementRead(req: Request, res: Response): Promise<void> {
    const announcement = await AnnouncementService.markAnnouncementRead(
      getUser(req).id,
      req.params.id as string,
    );
    res.json(apiResponse(true, announcement, 'Announcement marked as read'));
  }

  static async getReadAnalytics(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const analytics = await AnnouncementService.getReadAnalytics(
      schoolId,
      req.params.id as string,
    );
    res.json(apiResponse(true, analytics, 'Read analytics retrieved successfully'));
  }
}
