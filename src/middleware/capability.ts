import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../common/errors.js';
import { canUser, type Capability } from '../common/permissions.js';

const CAPABILITY_MESSAGES: Record<Capability, string> = {
  manage_school_settings:  'You do not have permission to manage school settings.',
  manage_school_config:    'You do not have permission to manage school configuration.',
  manage_academic_setup:   'You do not have permission to manage academic setup.',
  manage_users:            'You do not have permission to manage users.',
  manage_fees:             'You do not have permission to manage fees.',
  manage_pastoral:         'You do not have permission to manage pastoral cases.',
  manage_sport_config:     'You do not have permission to manage sport configuration.',
  manage_library:          'You do not have permission to manage the library.',
  manage_visitors:         'You do not have permission to manage visitors.',
  view_audit_log:          'You do not have permission to view the audit log.',
};

export function requireCapability(cap: Capability) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError('Authentication is required');
    if (!canUser(req.user, cap)) {
      res.status(403).json({
        success: false,
        code: 'FORBIDDEN_CAPABILITY',
        capability: cap,
        error: CAPABILITY_MESSAGES[cap],
      });
      return;
    }
    next();
  };
}
