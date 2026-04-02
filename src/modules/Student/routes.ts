import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { requireParentOwnership } from '../../middleware/parentOwnership.js';
import { StudentController } from './controller.js';
import { StudentExportController } from './export.controller.js';
import {
  createStudentSchema,
  updateStudentSchema,
  updateMedicalProfileSchema,
} from './validation.js';

const router = Router();

// ─── CSV Export ─────────────────────────────────────────────────────────────

router.get(
  '/export',
  authenticate,
  authorize('super_admin', 'school_admin'),
  StudentExportController.exportStudents,
);

router.post(
  '/',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createStudentSchema),
  StudentController.create,
);

router.get(
  '/',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'student', 'parent'),
  StudentController.list,
);

router.get(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'parent'),
  requireParentOwnership('id'),
  StudentController.getById,
);

router.put(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateStudentSchema),
  StudentController.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  StudentController.delete,
);

router.patch(
  '/:id/medical',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateMedicalProfileSchema),
  StudentController.updateMedicalProfile,
);

export default router;
