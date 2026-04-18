import type { Request, Response, NextFunction } from 'express';
import { School } from '../modules/School/model.js';
import { ForbiddenError } from '../common/errors.js';

export async function rejectStandalonePlan(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const schoolId = req.user?.schoolId;
  if (!schoolId) return next();

  const school = await School.findById(schoolId).select('plan').lean();
  if (school?.plan === 'standalone') {
    throw new ForbiddenError('This feature is not available for standalone teacher accounts');
  }

  next();
}
