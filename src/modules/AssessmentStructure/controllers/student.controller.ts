import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { CategoryService } from '../services/category.service.js';

function getTenant(req: Request): { teacherId: string; schoolId: string | null } {
  const user = getUser(req);
  return { teacherId: user.id, schoolId: user.schoolId ?? null };
}

export class StudentController {
  static async addStudents(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await CategoryService.addStudents(
      req.params.id as string,
      tenant,
      req.body.studentIds,
    );
    res.json(apiResponse(true, structure, 'Students added successfully'));
  }

  static async removeStudent(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await CategoryService.removeStudent(
      req.params.id as string,
      req.params.studentId as string,
      tenant,
    );
    res.json(apiResponse(true, structure, 'Student removed successfully'));
  }
}
