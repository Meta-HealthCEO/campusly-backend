import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { ForbiddenError } from '../../common/errors.js';
import { TextbookService } from './service.js';
import type { TextbookActor } from './service-access.js';
import type { TextbookQueryInput } from './validation.js';

function getAuth(req: Request): TextbookActor {
  const user = getUser(req);
  if (!user.schoolId) throw new ForbiddenError('Authenticated user has no schoolId');
  return { ...user, schoolId: user.schoolId };
}

export class TextbookController {
  static async listTextbooks(req: Request, res: Response): Promise<void> {
    const actor = getAuth(req);
    const filters = req.query as unknown as TextbookQueryInput;
    const result = await TextbookService.listTextbooks(actor, filters);
    res.json(apiResponse(true, result));
  }

  static async getTextbook(req: Request, res: Response): Promise<void> {
    const textbook = await TextbookService.getTextbook(
      req.params.id as string,
      getAuth(req),
    );
    res.json(apiResponse(true, textbook));
  }

  static async createTextbook(req: Request, res: Response): Promise<void> {
    const textbook = await TextbookService.createTextbook(
      getAuth(req),
      req.body,
    );
    res.status(201).json(apiResponse(true, textbook, 'Textbook created successfully'));
  }

  static async updateTextbook(req: Request, res: Response): Promise<void> {
    const textbook = await TextbookService.updateTextbook(
      req.params.id as string,
      getAuth(req),
      req.body,
    );
    res.json(apiResponse(true, textbook, 'Textbook updated successfully'));
  }

  static async deleteTextbook(req: Request, res: Response): Promise<void> {
    const result = await TextbookService.deleteTextbook(
      req.params.id as string,
      getAuth(req),
    );
    res.json(apiResponse(true, result, 'Textbook deleted successfully'));
  }

  // ─── Chapters ──────────────────────────────────────────────────────────

  static async addChapter(req: Request, res: Response): Promise<void> {
    const chapter = await TextbookService.addChapter(
      req.params.id as string,
      getAuth(req),
      req.body,
    );
    res.status(201).json(apiResponse(true, chapter, 'Chapter added successfully'));
  }

  static async updateChapter(req: Request, res: Response): Promise<void> {
    const chapter = await TextbookService.updateChapter(
      req.params.id as string,
      getAuth(req),
      req.params.chapterId as string,
      req.body,
    );
    res.json(apiResponse(true, chapter, 'Chapter updated successfully'));
  }

  static async removeChapter(req: Request, res: Response): Promise<void> {
    const result = await TextbookService.removeChapter(
      req.params.id as string,
      getAuth(req),
      req.params.chapterId as string,
    );
    res.json(apiResponse(true, result, 'Chapter removed successfully'));
  }

  // ─── Chapter Resources ─────────────────────────────────────────────────

  static async addResourceToChapter(req: Request, res: Response): Promise<void> {
    const resources = await TextbookService.addResourceToChapter(
      req.params.id as string,
      getAuth(req),
      req.params.chapterId as string,
      req.body.resourceId,
      req.body.order,
    );
    res.status(201).json(apiResponse(true, resources, 'Resource added to chapter'));
  }

  static async removeResourceFromChapter(req: Request, res: Response): Promise<void> {
    const result = await TextbookService.removeResourceFromChapter(
      req.params.id as string,
      getAuth(req),
      req.params.chapterId as string,
      req.params.resourceId as string,
    );
    res.json(apiResponse(true, result, 'Resource removed from chapter'));
  }

  // ─── Reorder & Publish ─────────────────────────────────────────────────

  static async reorderChapters(req: Request, res: Response): Promise<void> {
    const chapters = await TextbookService.reorderChapters(
      req.params.id as string,
      getAuth(req),
      req.body.chapterIds,
    );
    res.json(apiResponse(true, chapters, 'Chapters reordered successfully'));
  }

  static async publishTextbook(req: Request, res: Response): Promise<void> {
    const textbook = await TextbookService.publishTextbook(
      req.params.id as string,
      getAuth(req),
    );
    res.json(apiResponse(true, textbook, 'Textbook published successfully'));
  }
}
