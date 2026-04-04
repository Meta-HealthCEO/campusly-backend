import { Router, type Request, type Response, type NextFunction } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { ForbiddenError } from '../../common/errors.js';
import { IncidentController } from './controller.js';
import {
  createIncidentSchema, updateIncidentSchema,
  createActionSchema, updateActionSchema,
  createNoteSchema, updateNoteSchema,
} from './validation.js';

const router = Router();

// ─── Middleware ─────────────────────────────────────────────────────────────

/** Allow teachers (including counselors), school_admin, super_admin */
function authorizeIncidentReporter(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new ForbiddenError();
  const { role } = req.user;
  if (role === 'super_admin' || role === 'school_admin' || role === 'teacher') {
    return next();
  }
  throw new ForbiddenError('You do not have permission to manage incidents');
}

/** Only counselors, principal, super_admin can access confidential notes */
function requireConfidentialAccess(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new ForbiddenError();
  if (req.user.role === 'super_admin') return next();
  if (req.user.role === 'school_admin' && req.user.isSchoolPrincipal) return next();
  if (req.user.role === 'teacher' && req.user.isCounselor) return next();
  throw new ForbiddenError('Confidential access required');
}

/** Only counselors can CREATE confidential notes */
function requireCounselor(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new ForbiddenError();
  if (req.user.role === 'super_admin') return next();
  if (req.user.role === 'teacher' && req.user.isCounselor) return next();
  throw new ForbiddenError('Only counselors can perform this action');
}

/** Counselors + admin can view all incidents; regular teachers can also view */
function authorizeIncidentViewer(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new ForbiddenError();
  const { role } = req.user;
  if (role === 'super_admin' || role === 'school_admin' || role === 'teacher') {
    return next();
  }
  throw new ForbiddenError('You do not have permission to view incidents');
}

// ─── Reports (must come before /:id) ──────────────────────────────────────

router.get(
  '/reports/summary',
  authorize('super_admin', 'school_admin', 'teacher'),
  IncidentController.reportsSummary,
);

// ─── Incident CRUD ─────────────────────────────────────────────────────────

router.post(
  '/',
  authorizeIncidentReporter,
  validate(createIncidentSchema),
  IncidentController.create,
);

router.get('/', authorizeIncidentViewer, IncidentController.list);

router.get('/:id', authorizeIncidentViewer, IncidentController.getById);

router.put(
  '/:id',
  authorizeIncidentReporter,
  validate(updateIncidentSchema),
  IncidentController.update,
);

router.delete(
  '/:id',
  authorize('super_admin', 'school_admin'),
  IncidentController.remove,
);

// ─── Follow-up Actions ─────────────────────────────────────────────────────

router.get('/:id/actions', authorizeIncidentViewer, IncidentController.listActions);

router.post(
  '/:id/actions',
  authorizeIncidentReporter,
  validate(createActionSchema),
  IncidentController.createAction,
);

router.put(
  '/:id/actions/:actionId',
  authorizeIncidentReporter,
  validate(updateActionSchema),
  IncidentController.updateAction,
);

// ─── Confidential Notes ────────────────────────────────────────────────────

router.get(
  '/:id/confidential-notes',
  requireConfidentialAccess,
  IncidentController.listNotes,
);

router.post(
  '/:id/confidential-notes',
  requireCounselor,
  validate(createNoteSchema),
  IncidentController.createNote,
);

router.put(
  '/:id/confidential-notes/:noteId',
  requireCounselor,
  validate(updateNoteSchema),
  IncidentController.updateNote,
);

export default router;
