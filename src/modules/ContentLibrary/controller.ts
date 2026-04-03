import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { ResourcesService } from './service-resources.js';
import { ReviewService } from './service-review.js';
import { GenerationService } from './service-generation.js';
import type { ResourceQueryInput } from './validation.js';

export class ContentLibraryController {
  // ─── CRUD ─────────────────────────────────────────────────────────────────

  static async listResources(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const filters = req.query as unknown as ResourceQueryInput;
    const result = await ResourcesService.listResources(
      user.schoolId!,
      user.id,
      user.role,
      filters,
    );
    res.json(apiResponse(true, result));
  }

  static async getResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const resource = await ResourcesService.getResource(
      req.params.id as string,
      user.schoolId!,
      user.id,
    );
    res.json(apiResponse(true, resource));
  }

  static async createResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const resource = await ResourcesService.createResource(
      user.schoolId!,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, resource, 'Resource created successfully'));
  }

  static async updateResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const resource = await ResourcesService.updateResource(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, resource, 'Resource updated successfully'));
  }

  static async deleteResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await ResourcesService.deleteResource(
      req.params.id as string,
      user.schoolId!,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, result, 'Resource deleted successfully'));
  }

  // ─── Review Workflow ──────────────────────────────────────────────────────

  static async submitForReview(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const resource = await ReviewService.submitForReview(
      req.params.id as string,
      user.schoolId!,
      user.id,
    );
    res.json(apiResponse(true, resource, 'Resource submitted for review'));
  }

  static async reviewResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const resource = await ReviewService.reviewResource(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, resource, 'Resource reviewed successfully'));
  }

  // ─── AI Generation ────────────────────────────────────────────────────────

  static async generateContent(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const resource = await GenerationService.generateContent(
      user.schoolId!,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, resource, 'Content generated successfully'));
  }
}
