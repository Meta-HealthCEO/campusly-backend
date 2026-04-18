import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { AnnouncementService } from './service-announcement.js';

export class AnnouncementController {
  static async create(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const announcement = await AnnouncementService.create(
      req.body,
      user.schoolId!,
      user.id,
    );
    res.status(201).json(apiResponse(true, announcement, 'Announcement published'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { teamId, studentId, pinned } = req.query;
    const announcements = await AnnouncementService.list({
      schoolId: user.schoolId!,
      teamId: typeof teamId === 'string' ? teamId : undefined,
      studentId: typeof studentId === 'string' ? studentId : undefined,
      pinned: pinned === 'true' ? true : pinned === 'false' ? false : undefined,
    });
    res.status(200).json(apiResponse(true, announcements, 'Announcements retrieved'));
  }

  static async get(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const announcement = await AnnouncementService.get(
      req.params.id as string,
      user.schoolId!,
    );
    res.status(200).json(apiResponse(true, announcement, 'Announcement retrieved'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const announcement = await AnnouncementService.update(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.status(200).json(apiResponse(true, announcement, 'Announcement updated'));
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await AnnouncementService.remove(req.params.id as string, user.schoolId!);
    res.status(200).json(apiResponse(true, null, 'Announcement deleted'));
  }

  static async generateTeamSheet(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const announcement = await AnnouncementService.generateTeamSheet(
      req.params.fixtureId as string,
      user.schoolId!,
      user.id,
    );
    res.status(201).json(apiResponse(true, announcement, 'Team sheet published'));
  }
}
