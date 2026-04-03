import { Router, type Request, type Response, type NextFunction } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { ForbiddenError } from '../../common/errors.js';
import { PastoralController } from './controller.js';
import {
  createReferralSchema,
  updateReferralSchema,
  resolveReferralSchema,
  createSessionSchema,
  updateSessionSchema,
  referralQuerySchema,
  sessionQuerySchema,
  reportQuerySchema,
} from './validation.js';

const router = Router();

// ─── Auth Helpers ────────────────────────────────────────────────────────────

/** Teachers and school_admin can submit referrals */
function authorizeReferralReporter(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new ForbiddenError();
  const { role } = req.user;
  if (role === 'super_admin' || role === 'school_admin' || role === 'teacher') {
    return next();
  }
  throw new ForbiddenError('Only staff members can submit referrals');
}

/** Counselors, principals, school_admin, and super_admin can read referrals */
function authorizeReferralViewer(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new ForbiddenError();
  const { role } = req.user;
  if (role === 'super_admin' || role === 'school_admin' || role === 'teacher') {
    return next();
  }
  throw new ForbiddenError('Only staff members can view referrals');
}

/** Only counselors and principals can update referrals */
function requireCounselorOrPrincipal(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) throw new ForbiddenError();
  if (req.user.role === 'super_admin') return next();
  if (req.user.role === 'school_admin' && req.user.isSchoolPrincipal) return next();
  if (req.user.role === 'teacher' && req.user.isCounselor) return next();
  throw new ForbiddenError('Counselor or principal access required');
}

/** Only counselors (and super_admin) can write sessions */
function requireCounselor(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new ForbiddenError();
  if (req.user.role === 'super_admin') return next();
  if (req.user.role === 'teacher' && req.user.isCounselor) return next();
  throw new ForbiddenError('Only counselors can perform this action');
}

/** Counselors and principals can read sessions */
function requireCounselorOrPrincipalRead(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) throw new ForbiddenError();
  if (req.user.role === 'super_admin') return next();
  if (req.user.role === 'school_admin' && req.user.isSchoolPrincipal) return next();
  if (req.user.role === 'teacher' && req.user.isCounselor) return next();
  throw new ForbiddenError('Counselor or principal access required');
}

// ─── Referrals ───────────────────────────────────────────────────────────────

router.post(
  '/referrals',
  authorizeReferralReporter,
  validate(createReferralSchema),
  PastoralController.createReferral,
);

router.get(
  '/referrals',
  authorizeReferralViewer,
  validate({ query: referralQuerySchema }),
  PastoralController.listReferrals,
);

router.put(
  '/referrals/:id',
  requireCounselorOrPrincipal,
  validate(updateReferralSchema),
  PastoralController.updateReferral,
);

router.put(
  '/referrals/:id/resolve',
  requireCounselorOrPrincipal,
  validate(resolveReferralSchema),
  PastoralController.resolveReferral,
);

// ─── Sessions ────────────────────────────────────────────────────────────────

router.post(
  '/sessions',
  requireCounselor,
  validate(createSessionSchema),
  PastoralController.createSession,
);

router.get(
  '/sessions',
  requireCounselorOrPrincipalRead,
  validate({ query: sessionQuerySchema }),
  PastoralController.listSessions,
);

router.put(
  '/sessions/:id',
  requireCounselor,
  validate(updateSessionSchema),
  PastoralController.updateSession,
);

// ─── Wellbeing Profile ───────────────────────────────────────────────────────

router.get(
  '/students/:studentId/wellbeing',
  requireCounselorOrPrincipal,
  PastoralController.getWellbeingProfile,
);

// ─── Caseload ────────────────────────────────────────────────────────────────

router.get(
  '/caseload',
  requireCounselor,
  PastoralController.getCaseload,
);

// ─── Reports ─────────────────────────────────────────────────────────────────

router.get(
  '/reports',
  requireCounselorOrPrincipal,
  validate({ query: reportQuerySchema }),
  PastoralController.getReport,
);

export default router;
