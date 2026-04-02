import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UnauthorizedError } from '../common/errors.js';
import { UserRole } from '../common/enums.js';
import { logger } from '../common/logger.js';

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  schoolId?: string;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token as string;
  }

  if (!token) {
    throw new UnauthorizedError('Authentication token is required');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret, { algorithms: ['HS256'] }) as JwtPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      schoolId: decoded.schoolId,
    };

    next();
  } catch {
    logger.warn({ path: req.originalUrl, ip: req.ip }, 'Failed authentication attempt');
    throw new UnauthorizedError('Invalid or expired token');
  }
}
