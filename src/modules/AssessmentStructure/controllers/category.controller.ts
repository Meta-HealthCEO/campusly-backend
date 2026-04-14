import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { CategoryService } from '../services/category.service.js';

function getTenant(req: Request): { teacherId: string; schoolId: string | null } {
  const user = getUser(req);
  return { teacherId: user.id, schoolId: user.schoolId ?? null };
}

export class CategoryController {
  static async addCategory(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await CategoryService.addCategory(
      req.params.id as string,
      tenant,
      req.body,
    );
    res.status(201).json(apiResponse(true, structure, 'Category added successfully'));
  }

  static async updateCategory(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await CategoryService.updateCategory(
      req.params.id as string,
      req.params.catId as string,
      tenant,
      req.body,
    );
    res.json(apiResponse(true, structure, 'Category updated successfully'));
  }

  static async deleteCategory(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await CategoryService.deleteCategory(
      req.params.id as string,
      req.params.catId as string,
      tenant,
    );
    res.json(apiResponse(true, structure, 'Category deleted successfully'));
  }

  static async addLineItem(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await CategoryService.addLineItem(
      req.params.id as string,
      req.params.catId as string,
      tenant,
      req.body,
    );
    res.status(201).json(apiResponse(true, structure, 'Line item added successfully'));
  }

  static async updateLineItem(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await CategoryService.updateLineItem(
      req.params.id as string,
      req.params.catId as string,
      req.params.itemId as string,
      tenant,
      req.body,
    );
    res.json(apiResponse(true, structure, 'Line item updated successfully'));
  }

  static async deleteLineItem(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await CategoryService.deleteLineItem(
      req.params.id as string,
      req.params.catId as string,
      req.params.itemId as string,
      tenant,
    );
    res.json(apiResponse(true, structure, 'Line item deleted successfully'));
  }

  static async linkAssessment(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await CategoryService.linkAssessment(
      req.params.id as string,
      req.params.catId as string,
      req.params.itemId as string,
      tenant,
      req.body.assessmentId,
    );
    res.json(apiResponse(true, structure, 'Assessment linked successfully'));
  }
}
