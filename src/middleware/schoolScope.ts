import type { Request, Response, NextFunction } from 'express';

/**
 * Validates that schoolId in URL params matches the authenticated user's school.
 * Super admins can access any school.
 */
export function validateSchoolScope(paramName = 'schoolId') {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramSchoolId = req.params[paramName];
    if (!paramSchoolId) return next();

    if (req.user?.role === 'super_admin') return next();

    if (req.user?.schoolId !== paramSchoolId) {
      return res.status(403).json({ success: false, error: 'Access denied to this school' });
    }
    next();
  };
}
