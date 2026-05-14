import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { ResourcesService } from './service-resources.js';
import { ReviewService } from './service-review.js';
import { GenerationService } from './service-generation.js';
import { gradeAttempt } from './service-grade-attempt.js';
import type { ResourceQueryInput } from './validation.js';

export class ContentLibraryController {
  // ─── CRUD ─────────────────────────────────────────────────────────────────

  static async listResources(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const filters = req.query as unknown as ResourceQueryInput;
    const result = await ResourcesService.listResources(
      schoolId,
      user.id,
      user.role,
      filters,
    );
    res.json(apiResponse(true, result));
  }

  static async getResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const resource = await ResourcesService.getResource(
      req.params.id as string,
      schoolId,
      user.id,
    );
    res.json(apiResponse(true, resource));
  }

  static async createResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const resource = await ResourcesService.createResource(
      schoolId,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, resource, 'Resource created successfully'));
  }

  static async updateResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const resource = await ResourcesService.updateResource(
      req.params.id as string,
      schoolId,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, resource, 'Resource updated successfully'));
  }

  static async deleteResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const result = await ResourcesService.deleteResource(
      req.params.id as string,
      schoolId,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, result, 'Resource deleted successfully'));
  }

  // ─── Review Workflow ──────────────────────────────────────────────────────

  static async submitForReview(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const resource = await ReviewService.submitForReview(
      req.params.id as string,
      schoolId,
      user.id,
    );
    res.json(apiResponse(true, resource, 'Resource submitted for review'));
  }

  static async reviewResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const resource = await ReviewService.reviewResource(
      req.params.id as string,
      schoolId,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, resource, 'Resource reviewed successfully'));
  }

  // ─── AI Generation ────────────────────────────────────────────────────────

  static async generateContent(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const resource = await GenerationService.generateContent(
      schoolId,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, resource, 'Content generated successfully'));
  }

  static async refineResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const resource = await GenerationService.refineContent(
      req.params.id as string,
      schoolId,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, resource, 'Resource refined successfully'));
  }

  // ─── Grade Attempt ────────────────────────────────────────────────────────
  // Single source of truth for grading a learner's response to an interactive
  // content block. Used by both the teacher preview (in the lesson workspace)
  // and the real student-attempt flow.

  static async gradeAttempt(req: Request, res: Response): Promise<void> {
    const { blockContent, blockType, response } = req.body as {
      blockContent?: string;
      blockType?: string;
      response?: string;
    };
    if (typeof blockContent !== 'string' || typeof blockType !== 'string' || typeof response !== 'string') {
      res.status(400).json({ success: false, error: 'blockContent, blockType, and response are required' });
      return;
    }
    if (response.trim().length === 0) {
      res.status(400).json({ success: false, error: 'response must not be empty' });
      return;
    }
    const result = await gradeAttempt({ blockContent, blockType, response });
    res.json(apiResponse(true, result, 'Attempt graded'));
  }
}
