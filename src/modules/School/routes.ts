import express from 'express';
import { SchoolController } from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createSchoolSchema, updateSchoolSchema, updateSettingsSchema } from './validation.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('super_admin'),
  validate(createSchoolSchema),
  SchoolController.create,
);

router.get(
  '/',
  authenticate,
  authorize('super_admin'),
  SchoolController.list,
);

router.get(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  SchoolController.getById,
);

router.put(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateSchoolSchema),
  SchoolController.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize('super_admin'),
  SchoolController.delete,
);

router.patch(
  '/:id/settings',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateSettingsSchema),
  SchoolController.updateSettings,
);

export default router;
