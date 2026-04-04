import { Request, Response } from 'express';
import { SchoolService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class SchoolController {
  static async create(req: Request, res: Response): Promise<void> {
    const school = await SchoolService.create(req.body);
    res.status(201).json(apiResponse(true, { school }, 'School created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const { page, limit, sort, search } = req.query;

    const result = await SchoolService.list({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sort: sort as string | undefined,
      search: search as string | undefined,
    });

    res.status(200).json(
      apiResponse(true, result, 'Schools retrieved successfully'),
    );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const school = await SchoolService.getById(req.params.id as string);
    res.status(200).json(apiResponse(true, { school }, 'School retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const school = await SchoolService.update(req.params.id as string, req.body);
    res.status(200).json(apiResponse(true, { school }, 'School updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    await SchoolService.delete(req.params.id as string);
    res.status(200).json(apiResponse(true, undefined, 'School deleted successfully'));
  }

  static async updateSettings(req: Request, res: Response): Promise<void> {
    const school = await SchoolService.updateSettings(req.params.id as string, req.body);
    res.status(200).json(apiResponse(true, { school }, 'School settings updated successfully'));
  }

  static async getUsage(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const snapshot = await SchoolService.getUsage(schoolId);
    res.status(200).json(apiResponse(true, snapshot, 'Usage retrieved successfully'));
  }

  static async getJoinCode(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const joinCode = await SchoolService.getJoinCode(schoolId);
    res.status(200).json(apiResponse(true, { joinCode }, 'Join code retrieved successfully'));
  }
}
