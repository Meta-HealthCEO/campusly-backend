import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../common/errors.js';

export function requirePermission(...flags: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    if (req.user.role === 'super_admin') return next();

    const hasPermission = flags.some(
      (flag) => (req.user as Record<string, unknown>)?.[flag] === true,
    );
    if (!hasPermission) throw new ForbiddenError('You do not have the required permission');
    next();
  };
}
