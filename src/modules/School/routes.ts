import express from 'express';
import { SchoolController } from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { requireCapability } from '../../middleware/capability.js';
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

// Static routes MUST come before /:id to avoid being swallowed by the param
router.get(
  '/usage',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  SchoolController.getUsage,
);

router.get(
  '/join-code',
  authenticate,
  authorize('super_admin', 'school_admin'),
  SchoolController.getJoinCode,
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
  requireCapability('manage_school_settings'),
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
  requireCapability('manage_school_settings'),
  validate(updateSettingsSchema),
  SchoolController.updateSettings,
);

export default router;
