import { logger } from '../common/logger.js';
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../modules/Audit/service.js';

export function auditMiddleware(entity: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only audit CUD operations
    const method = req.method.toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      next();
      return;
    }

    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      // Log after response is sent
      const actionMap: Record<string, string> = {
        POST: 'create',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete',
      };

      const action = actionMap[method] ?? 'update';

      if (req.user) {
        AuditService.logAction({
          userId: req.user.id,
          schoolId: req.user.schoolId,
          action: action as 'create' | 'update' | 'delete',
          entity,
          entityId: req.params.id as string | undefined,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }).catch((err) => {
          logger.error({ err }, '[AuditMiddleware] Failed to log audit');
        });
      }

      return originalJson(body);
    } as typeof res.json;

    next();
  };
}
