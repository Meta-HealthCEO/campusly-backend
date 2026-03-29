import { Request, Response, NextFunction } from 'express';
import { BadRequestError, UnauthorizedError } from '../common/errors.js';

export function schoolContext(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication is required');
  }

  // super_admin can optionally override schoolId via query param
  if (req.user.role === 'super_admin') {
    const querySchoolId = req.query.schoolId as string | undefined;
    req.schoolId = querySchoolId ?? req.user.schoolId;
    next();
    return;
  }

  // All other roles must have a schoolId
  if (!req.user.schoolId) {
    throw new BadRequestError('School context is required');
  }

  req.schoolId = req.user.schoolId;
  next();
}
