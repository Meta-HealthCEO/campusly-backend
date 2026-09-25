export interface AppErrorExtra {
  /** A stable, machine-readable reason the client can act on (e.g. 'AI_ALLOWANCE'). */
  code?: string;
  /** Extra numbers the client shows with the message (e.g. { used, limit }). */
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, statusCode: number, isOperational = true, extra: AppErrorExtra = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = extra.code;
    this.details = extra.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}
