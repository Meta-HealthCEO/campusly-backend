import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { StudentController } from './controller.js';
import {
  createStudentSchema,
  updateStudentSchema,
  updateMedicalProfileSchema,
} from './validation.js';

const router = Router();

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
  authorize('super_admin', 'school_admin', 'teacher'),
  StudentController.list,
);

router.get(
  '/:id',
  authenticate,
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
