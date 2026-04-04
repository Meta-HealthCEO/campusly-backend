import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { ForbiddenError } from '../../common/errors.js';
import { DepartmentController } from './controller.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createObservationSchema,
  updateObservationSchema,
  performanceQuerySchema,
  moderationQuerySchema,
  observationQuerySchema,
  commonAssessmentQuerySchema,
} from './validation.js';

const router = Router();

/**
 * Middleware: HOD can only access their own department.
 * Admins and super_admins bypass this check.
 */
function requireHOD(req: Request, _res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user) throw new ForbiddenError('Authentication required');

  if (user.role === 'super_admin' || user.role === 'school_admin') {
    return next();
  }

  const deptId = req.params.id;
  if (
    user.role === 'teacher' &&
    user.isHOD === true &&
    user.departmentId?.toString() === deptId
  ) {
    return next();
  }

  throw new ForbiddenError('HOD access required for this department');
}

// ─── Department CRUD (admin only) ────────────────────────────────────────────

router.post(
  '/',
  authorize('school_admin'),
  validate(createDepartmentSchema),
  DepartmentController.create,
);

router.get(
  '/',
  authorize('teacher', 'school_admin'),
  DepartmentController.list,
);

router.get(
  '/:id',
  authorize('teacher', 'school_admin'),
  requireHOD,
  DepartmentController.getById,
);

router.put(
  '/:id',
  authorize('school_admin'),
  validate(updateDepartmentSchema),
  DepartmentController.update,
);

router.delete(
  '/:id',
  authorize('school_admin'),
  DepartmentController.remove,
);

// ─── Analytics (HOD + admin) ─────────────────────────────────────────────────

router.get(
  '/:id/performance',
  authorize('teacher', 'school_admin'),
  requireHOD,
  validate({ query: performanceQuerySchema }),
  DepartmentController.performance,
);

router.get(
  '/:id/pacing',
  authorize('teacher', 'school_admin'),
  requireHOD,
  validate({ query: performanceQuerySchema }),
  DepartmentController.pacing,
);

router.get(
  '/:id/moderation',
  authorize('teacher', 'school_admin'),
  requireHOD,
  validate({ query: moderationQuerySchema }),
  DepartmentController.moderation,
);

router.get(
  '/:id/workload',
  authorize('teacher', 'school_admin'),
  requireHOD,
  DepartmentController.workload,
);

router.get(
  '/:id/common-assessments',
  authorize('teacher', 'school_admin'),
  requireHOD,
  validate({ query: commonAssessmentQuerySchema }),
  DepartmentController.commonAssessments,
);

// ─── Observations (HOD + admin) ──────────────────────────────────────────────

router.get(
  '/:id/observations',
  authorize('teacher', 'school_admin'),
  requireHOD,
  validate({ query: observationQuerySchema }),
  DepartmentController.listObservations,
);

router.post(
  '/:id/observations',
  authorize('teacher', 'school_admin'),
  requireHOD,
  validate(createObservationSchema),
  DepartmentController.createObservation,
);

router.put(
  '/:id/observations/:observationId',
  authorize('teacher', 'school_admin'),
  requireHOD,
  validate(updateObservationSchema),
  DepartmentController.updateObservation,
);

router.delete(
  '/:id/observations/:observationId',
  authorize('teacher', 'school_admin'),
  requireHOD,
  DepartmentController.deleteObservation,
);

export default router;
