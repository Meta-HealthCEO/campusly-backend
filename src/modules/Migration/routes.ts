import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { MigrationController } from './controller.js';
import { uploadFileSchema, updateMappingSchema, createTemplateSchema } from './validation.js';

const router = Router();

// Upload file / create migration job
router.post(
  '/upload',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(uploadFileSchema),
  MigrationController.upload,
);

// Validate data in a job
router.get(
  '/:jobId/validate',
  authenticate,
  authorize('school_admin', 'super_admin'),
  MigrationController.validate,
);

// Preview mapped data
router.get(
  '/:jobId/preview',
  authenticate,
  authorize('school_admin', 'super_admin'),
  MigrationController.preview,
);

// Update field mapping
router.put(
  '/:jobId/mapping',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(updateMappingSchema),
  MigrationController.updateMapping,
);

// Execute import
router.post(
  '/:jobId/execute',
  authenticate,
  authorize('school_admin', 'super_admin'),
  MigrationController.execute,
);

// Get job status
router.get(
  '/:jobId/status',
  authenticate,
  authorize('school_admin', 'super_admin'),
  MigrationController.getStatus,
);

// Get job history for school
router.get(
  '/history',
  authenticate,
  authorize('school_admin', 'super_admin'),
  MigrationController.getHistory,
);

// Templates
router.post(
  '/templates',
  authenticate,
  authorize('super_admin'),
  validate(createTemplateSchema),
  MigrationController.createTemplate,
);

router.get(
  '/templates',
  authenticate,
  authorize('school_admin', 'super_admin'),
  MigrationController.getTemplates,
);

export default router;
