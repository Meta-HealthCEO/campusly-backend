import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../common/errors.js';

const SCHOOL_BILLING_ROLES = new Set(['super_admin', 'school_admin', 'principal']);

export interface BillingViewer {
  role: string;
  isStandaloneTeacher?: boolean;
  isStandaloneCoach?: boolean;
  isSchoolPrincipal?: boolean;
}

/** Whoever pays: a standalone teacher or coach, or a school's admin or principal. */
export function isBillingOwner(user: BillingViewer | null | undefined): boolean {
  return !!user && (
    user.isStandaloneTeacher === true
    || user.isStandaloneCoach === true
    || user.isSchoolPrincipal === true
    || SCHOOL_BILLING_ROLES.has(user.role)
  );
}

/**
 * Billing actions (checkout, cancel, resume, invoices) act on the caller's
 * school, which learners and parents share. Only whoever pays may use them.
 */
export function requireBillingOwner(req: Request, _res: Response, next: NextFunction): void {
  if (!isBillingOwner(req.user)) {
    next(new ForbiddenError('Only the account owner can manage billing.'));
    return;
  }
  next();
}
