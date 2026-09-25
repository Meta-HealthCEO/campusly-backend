import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Subscription, Plan } from './model.js';

const ENTITLED_STATUSES = new Set(['trialing', 'active']);

/** How long a past-due subscription keeps its plan while the card is fixed or retried. */
export const PAST_DUE_GRACE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/** When a past-due subscription's grace ends (null when it has no record of falling behind). */
export function pastDueGraceEnd(sub: { pastDueSince?: Date | null }): Date | null {
  return sub.pastDueSince ? new Date(sub.pastDueSince.getTime() + PAST_DUE_GRACE_DAYS * DAY_MS) : null;
}

/**
 * Whether a subscription currently carries its plan: trialing or active;
 * past_due only for PAST_DUE_GRACE_DAYS after it fell behind; canceled but
 * still inside the period already paid for (or the free trial it was
 * canceled in).
 */
export function isSubscriptionEntitled(
  sub: { status: string; currentPeriodEnd?: Date | null; trialEndsAt?: Date | null; pastDueSince?: Date | null } | null,
  now: Date = new Date(),
): boolean {
  if (!sub) return false;
  if (sub.status === 'canceled') {
    const end = sub.currentPeriodEnd ?? sub.trialEndsAt ?? null;
    return !!end && end.getTime() > now.getTime();
  }
  if (sub.status === 'past_due') {
    const graceEnd = pastDueGraceEnd(sub);
    return !!graceEnd && graceEnd.getTime() > now.getTime();
  }
  // free / unpaid / anything else → no plan entitlements
  return ENTITLED_STATUSES.has(sub.status);
}

export async function resolveEntitlements(
  schoolId: mongoose.Types.ObjectId | string,
): Promise<Record<string, unknown>> {
  const oid = typeof schoolId === 'string' ? new mongoose.Types.ObjectId(schoolId) : schoolId;
  const sub = await Subscription.findOne({ schoolId: oid });
  if (!sub || !isSubscriptionEntitled(sub)) return {};

  const plan = await Plan.findOne({ code: sub.planCode });
  return (plan?.entitlements ?? {}) as Record<string, unknown>;
}

export function requireEntitlement(feature: string) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Subscription gating currently applies only to standalone teachers
    // (the teacher-first GTM cohort). Real schools — school admins, HODs,
    // bursars, etc. — operate under the school-tier subscription model and
    // are not subject to per-feature entitlement gating here.
    if (req.user?.isStandaloneTeacher !== true) {
      next();
      return;
    }

    const ents = await resolveEntitlements(schoolId);
    if (ents[feature] === true) {
      next();
      return;
    }
    res.status(402).json({ error: 'Payment required', feature });
  };
}
