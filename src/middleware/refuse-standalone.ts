import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../common/errors.js';

const DEFAULT_MESSAGE = "This isn't part of the teacher portal.";

/**
 * Refuses standalone (self-sign-up) teachers on routes behind pages their
 * portal hides — mostly AI routes, so the API can't be used to go around
 * their monthly AI allowance. School users pass through unchanged.
 */
export function refuseStandalone(message: string = DEFAULT_MESSAGE): RequestHandler {
  return function (req: Request, _res: Response, next: NextFunction): void {
    if (req.user?.isStandaloneTeacher === true) {
      next(new AppError(message, 403, true, { code: 'NOT_IN_TEACHER_PORTAL' }));
      return;
    }
    next();
  };
}
