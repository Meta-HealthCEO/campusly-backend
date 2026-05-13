import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { ParentService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class ParentController {
  static async create(req: Request, res: Response): Promise<void> {
    const parent = await ParentService.create(req.body);
    res.status(201).json(apiResponse(true, parent, 'Parent created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.role === 'super_admin'
      ? (req.query.schoolId as string) ?? user.schoolId
      : user.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = user.role === 'teacher'
      ? await ParentService.listForTeacher(schoolId, user.id, query)
      : await ParentService.list(schoolId, query);
    res.json(apiResponse(true, result, 'Parents retrieved successfully'));
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    const parent = await ParentService.getByUserId(getUser(req).id);
    res.json(apiResponse(true, parent, 'Parent retrieved successfully'));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const parent = await ParentService.getById(req.params.id as string, schoolId);
    res.json(apiResponse(true, parent, 'Parent retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const parent = await ParentService.update(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, parent, 'Parent updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await ParentService.delete(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Parent deleted successfully'));
  }

  static async linkChild(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const parent = await ParentService.linkChild(req.params.id as string, req.body.childId, schoolId);
    res.json(apiResponse(true, parent, 'Child linked successfully'));
  }

  static async unlinkChild(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const parent = await ParentService.unlinkChild(req.params.id as string, req.body.childId, schoolId);
    res.json(apiResponse(true, parent, 'Child unlinked successfully'));
  }
}
