import { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod/v4';
import { z } from 'zod/v4';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: ValidationSchemas | ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // If single schema passed, treat as body validation (backwards compatible)
    if ('safeParse' in schemas && typeof (schemas as ZodTypeAny).safeParse === 'function' && !('body' in schemas || 'query' in schemas || 'params' in schemas)) {
      const result = (schemas as ZodTypeAny).safeParse(req.body);

      if (!result.success) {
        const errors = z.prettifyError(result.error);

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }

      req.body = result.data;
      next();
      return;
    }

    // Multi-schema validation
    const multi = schemas as ValidationSchemas;

    if (multi.body) {
      const result = multi.body.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: z.prettifyError(result.error),
        });
        return;
      }
      req.body = result.data;
    }

    if (multi.query) {
      const result = multi.query.safeParse(req.query);
      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: z.prettifyError(result.error),
        });
        return;
      }
      (req as Request).query = result.data as typeof req.query;
    }

    if (multi.params) {
      const result = multi.params.safeParse(req.params);
      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: z.prettifyError(result.error),
        });
        return;
      }
      req.params = result.data as typeof req.params;
    }

    next();
  };
}
