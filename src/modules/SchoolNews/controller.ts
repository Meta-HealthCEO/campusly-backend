import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { SchoolNewsService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class SchoolNewsController {
  static async createArticle(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const userName = `${req.user!.email}`;
    const article = await SchoolNewsService.createArticle(
      user.id,
      (req.body._authorName as string) ?? userName,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, article, 'Article created successfully'));
  }

  static async generateArticle(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const userName = `${req.user!.email}`;
    const article = await SchoolNewsService.generateArticle(
      user.id,
      (req.body._authorName as string) ?? userName,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, article, 'Article generated successfully'));
  }

  static async listArticles(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await SchoolNewsService.listArticles(schoolId, {
      category: req.query.category as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    }, req.query.page ? Number(req.query.page) : undefined,
       req.query.limit ? Number(req.query.limit) : undefined);
    res.json(apiResponse(true, result, 'Articles retrieved successfully'));
  }

  static async getNewsFeed(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await SchoolNewsService.getNewsFeed(
      schoolId,
      req.query.category as string | undefined,
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'News feed retrieved successfully'));
  }

  static async getFeaturedArticles(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const articles = await SchoolNewsService.getFeaturedArticles(schoolId, limit);
    res.json(apiResponse(true, articles, 'Featured articles retrieved successfully'));
  }

  static async getArticle(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const article = await SchoolNewsService.getArticle(req.params.id as string, schoolId);
    res.json(apiResponse(true, article, 'Article retrieved successfully'));
  }

  static async updateArticle(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const article = await SchoolNewsService.updateArticle(
      req.params.id as string,
      user.id,
      schoolId,
      req.body,
    );
    res.json(apiResponse(true, article, 'Article updated successfully'));
  }

  static async publishArticle(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const article = await SchoolNewsService.publishArticle(
      req.params.id as string,
      user.id,
      schoolId,
    );
    res.json(apiResponse(true, article, 'Article published successfully'));
  }

  static async archiveArticle(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const article = await SchoolNewsService.archiveArticle(
      req.params.id as string,
      user.id,
      schoolId,
    );
    res.json(apiResponse(true, article, 'Article archived successfully'));
  }

  static async deleteArticle(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    await SchoolNewsService.deleteArticle(req.params.id as string, user.id, schoolId);
    res.json(apiResponse(true, undefined, 'Article deleted successfully'));
  }
}
