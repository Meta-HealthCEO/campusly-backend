import { logger } from '../common/logger.js';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors.js';
import { apiResponse } from '../common/utils.js';
import { config } from '../config/env.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (config.nodeEnv === 'development') {
    // pino's default {err} serializer can drop frames in some terminals; print
    // to console too so dev never has to guess where 500s came from.
    // eslint-disable-next-line no-console
    console.error(`[${req.method}] ${req.originalUrl} — Error\n`, err);
    logger.error({ err }, `[${req.method}] ${req.originalUrl} — Error`);
  }

  // AppError (custom application errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json(apiResponse(false, undefined, undefined, err.message));
    return;
  }

  // Zod request validation errors
  if (
    (err.name === 'ZodError' || err.name === '$ZodError')
    && 'issues' in err
    && Array.isArray((err as { issues?: unknown }).issues)
  ) {
    const zodErr = err as Error & {
      issues: Array<{ path?: Array<string | number>; message: string }>;
    };
    const message = zodErr.issues
      .map((issue) => {
        const path = issue.path?.length ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
      })
      .join(', ') || 'Validation failed';
    res.status(400).json(apiResponse(false, undefined, undefined, message));
    return;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError' && 'errors' in err) {
    const mongooseErr = err as Error & { errors: Record<string, { message: string }> };
    const messages = Object.values(mongooseErr.errors).map((e) => e.message);
    res.status(400).json(apiResponse(false, undefined, undefined, messages.join(', ')));
    return;
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    res.status(400).json(apiResponse(false, undefined, undefined, 'Invalid resource identifier'));
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json(apiResponse(false, undefined, undefined, 'Invalid token'));
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json(apiResponse(false, undefined, undefined, 'Token has expired'));
    return;
  }

  // MongoDB duplicate key error (code 11000)
  if ('code' in err && (err as Error & { code: number }).code === 11000) {
    const mongoErr = err as Error & { keyPattern?: Record<string, unknown> };
    const field = mongoErr.keyPattern ? Object.keys(mongoErr.keyPattern)[0] : 'field';
    res.status(409).json(apiResponse(false, undefined, undefined, `Duplicate value for ${field}`));
    return;
  }

  // Default to 500
  const message =
    config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(500).json(apiResponse(false, undefined, undefined, message));
}
