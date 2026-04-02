import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { LostFoundService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class LostFoundController {
  static async reportItem(req: Request, res: Response): Promise<void> {
    const { type, ...data } = req.body;
    let item;

    if (type === 'found') {
      item = await LostFoundService.reportFoundItem(data, getUser(req).id);
    } else {
      item = await LostFoundService.reportLostItem(data, getUser(req).id);
    }

    res.status(201).json(apiResponse(true, item, 'Item reported successfully'));
  }

  static async getItems(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const { status, category, type, startDate, endDate, page, limit } = req.query;

    const result = await LostFoundService.getItems(
      schoolId,
      {
        status: status as string | undefined,
        category: category as string | undefined,
        type: type as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      },
      page ? parseInt(page as string, 10) : undefined,
      limit ? parseInt(limit as string, 10) : undefined,
    );

    res.json(apiResponse(true, result, 'Items retrieved successfully'));
  }

  static async getItemById(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const item = await LostFoundService.getItemById(req.params.id as string, schoolId);
    res.json(apiResponse(true, item, 'Item retrieved successfully'));
  }

  static async claimItem(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const item = await LostFoundService.claimItem(
      req.params.id as string,
      schoolId,
      getUser(req).id,
      req.body.studentId,
    );
    res.json(apiResponse(true, item, 'Item claimed successfully'));
  }

  static async verifyAndReturn(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const item = await LostFoundService.verifyAndReturn(
      req.params.id as string,
      schoolId,
      getUser(req).id,
    );
    res.json(apiResponse(true, item, 'Item verified and marked as returned'));
  }

  static async matchItems(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await LostFoundService.matchItems(
      req.params.id as string,
      req.params.matchId as string,
      schoolId,
    );
    res.json(apiResponse(true, result, 'Items matched successfully'));
  }

  static async getAutoMatchSuggestions(req: Request, res: Response): Promise<void> {
    const suggestions = await LostFoundService.autoMatchSuggestions(req.params.id as string);
    res.json(apiResponse(true, suggestions, 'Match suggestions retrieved successfully'));
  }

  static async archiveOldItems(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const archivedCount = await LostFoundService.archiveOldItems(schoolId);
    res.json(apiResponse(true, { archivedCount }, `${archivedCount} items archived`));
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const stats = await LostFoundService.getStats(schoolId);
    res.json(apiResponse(true, stats, 'Stats retrieved successfully'));
  }

  static async getHotspotReport(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const report = await LostFoundService.getHotspotReport(schoolId, {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    });
    res.json(apiResponse(true, report, 'Hotspot report retrieved successfully'));
  }

  static async softDelete(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const item = await LostFoundService.softDelete(req.params.id as string, schoolId);
    res.json(apiResponse(true, item, 'Item deleted successfully'));
  }
}
