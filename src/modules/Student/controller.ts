import { Request, Response } from 'express';
import { StudentService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class StudentController {
  static async create(req: Request, res: Response): Promise<void> {
    const student = await StudentService.create(req.body);
    res.status(201).json(apiResponse(true, student, 'Student created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

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

    const result = await StudentService.list(schoolId, query);
    res.json(apiResponse(true, result, 'Students retrieved successfully'));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const student = await StudentService.getById(req.params.id as string, schoolId);
    res.json(apiResponse(true, student, 'Student retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const student = await StudentService.update(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, student, 'Student updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await StudentService.delete(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Student deleted successfully'));
  }

  static async updateMedicalProfile(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const student = await StudentService.updateMedicalProfile(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, student, 'Medical profile updated successfully'));
  }
}
