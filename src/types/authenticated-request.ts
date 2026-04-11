import type { Request } from 'express';
import type { UserRole } from '../common/enums.js';

/**
 * Shape of the authenticated user attached to the request by auth middleware.
 */
export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  schoolId?: string;
  email: string;
  isSchoolPrincipal?: boolean;
  isHOD?: boolean;
}

/**
 * Express Request with a guaranteed authenticated user.
 * Use in controller methods that run behind authenticate middleware.
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * Extract the authenticated user from a request.
 * Safe to call in handlers that run behind the authenticate middleware.
 * Throws at runtime if user is missing (should never happen behind auth middleware).
 */
export function getUser(req: Request): AuthenticatedUser {
  const user = req.user;
  if (!user) {
    throw new Error('req.user is undefined — this handler must be behind authenticate middleware');
  }
  return user;
}
