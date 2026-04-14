import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { CalculationService } from '../services/calculation.service.js';

function getTenant(req: Request): { teacherId: string; schoolId: string | null } {
  const user = getUser(req);
  return { teacherId: user.id, schoolId: user.schoolId ?? null };
}

export class TermMarksController {
  static async getTermMarks(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const result = await CalculationService.getTermMarks(req.params.id as string, tenant);
    res.json(apiResponse(true, result));
  }

  static async getStudentTermMarks(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const result = await CalculationService.getStudentTermMarks(
      req.params.id as string,
      req.params.studentId as string,
      tenant,
    );
    res.json(apiResponse(true, result));
  }
}
