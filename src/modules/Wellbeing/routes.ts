import { Router, type Request, type Response, type NextFunction } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { ForbiddenError } from '../../common/errors.js';
import { WellbeingController } from './controller.js';
import {
  createSurveySchema, updateSurveySchema, submitResponseSchema,
} from './validation.js';

const router = Router();

// ─── Middleware ─────────────────────────────────────────────────────────────

/** Counselors, school_admin, super_admin can manage surveys */
function requireSurveyManager(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new ForbiddenError();
  if (req.user.role === 'super_admin' || req.user.role === 'school_admin') return next();
  if (req.user.role === 'teacher' && req.user.isCounselor) return next();
  throw new ForbiddenError('Only counselors and admins can manage surveys');
}

// ─── Student Active Survey ─────────────────────────────────────────────────

router.get(
  '/surveys/active',
  authorize('student'),
  WellbeingController.getActiveSurvey,
);

// ─── Survey CRUD ───────────────────────────────────────────────────────────

router.get('/surveys', requireSurveyManager, WellbeingController.listSurveys);

router.post(
  '/surveys',
  requireSurveyManager,
  validate(createSurveySchema),
  WellbeingController.createSurvey,
);

router.get('/surveys/:id', requireSurveyManager, WellbeingController.getSurvey);

router.put(
  '/surveys/:id',
  requireSurveyManager,
  validate(updateSurveySchema),
  WellbeingController.updateSurvey,
);

router.delete('/surveys/:id', requireSurveyManager, WellbeingController.deleteSurvey);

// ─── Student Response ──────────────────────────────────────────────────────

router.post(
  '/surveys/:id/respond',
  authorize('student'),
  validate(submitResponseSchema),
  WellbeingController.submitResponse,
);

// ─── Survey Results ────────────────────────────────────────────────────────

router.get(
  '/surveys/:id/results',
  requireSurveyManager,
  WellbeingController.getSurveyResults,
);

// ─── Mood Dashboard ────────────────────────────────────────────────────────

router.get('/mood-dashboard', requireSurveyManager, WellbeingController.getMoodDashboard);

export default router;
