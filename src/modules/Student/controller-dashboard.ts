import type { Request, Response, NextFunction } from 'express';
import { resolveStudentFromUserId } from '../../common/student-resolver.js';
import { NotFoundError, UnauthorizedError } from '../../common/errors.js';
import { buildStudentDashboard } from './service-dashboard.js';

export class StudentDashboardController {
  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id || !req.user.schoolId) throw new UnauthorizedError();
      const student = await resolveStudentFromUserId(req.user.id, req.user.schoolId);
      if (!student) throw new NotFoundError('Student profile not found');
      const data = await buildStudentDashboard(student);
      res.json({ success: true, data });
    } catch (err: unknown) {
      next(err);
    }
  }
}
