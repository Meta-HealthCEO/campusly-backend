import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { NoticeBoardService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class NoticeBoardController {
  static async createPost(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const userName = `${req.user!.email}`; // Email as fallback name
    const post = await NoticeBoardService.createPost(
      user.id,
      (req.body._authorName as string) ?? userName,
      user.role,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, post, 'Post created successfully'));
  }

  static async listPosts(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const scope = req.query.scope as string;
    const scopeId = req.query.scopeId as string;

    if (!scope || !scopeId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'scope and scopeId query params are required'));
      return;
    }

    const result = await NoticeBoardService.listPosts(schoolId, scope, scopeId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    }, { userId: getUser(req).id, userRole: getUser(req).role });
    res.json(apiResponse(true, result, 'Posts retrieved successfully'));
  }

  static async updatePost(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const post = await NoticeBoardService.updatePost(req.params.id as string, user.id, user.role, schoolId, req.body);
    res.json(apiResponse(true, post, 'Post updated successfully'));
  }

  static async deletePost(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    await NoticeBoardService.deletePost(req.params.id as string, user.id, user.role, schoolId);
    res.json(apiResponse(true, undefined, 'Post deleted successfully'));
  }

  static async togglePin(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const post = await NoticeBoardService.togglePin(req.params.id as string, user.id, user.role, schoolId);
    res.json(apiResponse(true, post, 'Post pin status toggled'));
  }

  static async getMyFeed(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.user!.schoolId!;
    const result = await NoticeBoardService.getPostsByUser(user.id, user.role, schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Feed retrieved successfully'));
  }
}
