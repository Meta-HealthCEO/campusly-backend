import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Subscription, Plan } from './model.js';
import { getFreeAllowance } from './free-allowance.js';
import { AppError } from '../../common/errors.js';

const ENTITLED_STATUSES = new Set(['trialing', 'active', 'past_due']);

export async function resolveEntitlements(
  schoolId: mongoose.Types.ObjectId | string,
): Promise<Record<string, unknown>> {
  const oid = typeof schoolId === 'string' ? new mongoose.Types.ObjectId(schoolId) : schoolId;
  const sub = await Subscription.findOne({ schoolId: oid });
  if (!sub) return {};

  // Canceled but still within paid period → entitled until period end
  if (sub.status === 'canceled') {
    if (!sub.currentPeriodEnd || sub.currentPeriodEnd.getTime() <= Date.now()) return {};
  } else if (!ENTITLED_STATUSES.has(sub.status)) {
    // free / unpaid / anything else → no plan entitlements
    return {};
  }

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

/**
 * Whether this caller may generate an AI paper: school teachers always (school
 * billing); standalone teachers with paperGeneration (Pro/trial), or while
 * they have free AI papers left. Shared by every path that creates AI papers.
 * Two simultaneous requests at 1 remaining can both pass — a bounded
 * overshoot we accept rather than lock the generation path.
 */
export async function hasPaperGenerationAccess(schoolId: string, isStandaloneTeacher: boolean): Promise<boolean> {
  if (!isStandaloneTeacher) return true;
  const ents = await resolveEntitlements(schoolId);
  if (ents.paperGeneration === true) return true;
  const allowance = await getFreeAllowance(schoolId);
  return allowance.paperGenerations.remaining > 0;
}

/** Service-level guard for AI paper creation outside the generate route (e.g. lesson materials). */
export async function assertPaperGenerationAccess(schoolId: string, isStandaloneTeacher: boolean): Promise<void> {
  if (!(await hasPaperGenerationAccess(schoolId, isStandaloneTeacher))) {
    throw new AppError("You've used your free AI papers. Upgrade to Pro to keep generating papers.", 402);
  }
}

/**
 * Like requireEntitlement('paperGeneration'), but a free-plan standalone
 * teacher may generate up to FREE_PAPER_GENERATIONS AI papers first, so they
 * see the product work before being asked for a card.
 */
export function requirePaperGenerationAccess() {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (await hasPaperGenerationAccess(schoolId, req.user?.isStandaloneTeacher === true)) {
      next();
      return;
    }
    res.status(402).json({ error: 'Payment required', feature: 'paperGeneration', freeRemaining: 0 });
  };
}
