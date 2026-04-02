import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { AnnouncementController } from './controller.js';
import { createAnnouncementSchema, updateAnnouncementSchema, schedulePublishSchema } from './validation.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createAnnouncementSchema),
  AnnouncementController.create,
);

router.get(
  '/',
  authenticate,
  AnnouncementController.list,
);

router.get(
  '/active',
  authenticate,
  AnnouncementController.getActive,
);

router.get(
  '/:id',
  authenticate,
  AnnouncementController.getById,
);

router.put(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateAnnouncementSchema),
  AnnouncementController.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AnnouncementController.delete,
);

router.patch(
  '/:id/publish',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AnnouncementController.publish,
);

router.patch(
  '/:id/unpublish',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AnnouncementController.unpublish,
);

router.patch(
  '/:id/schedule',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(schedulePublishSchema),
  AnnouncementController.schedulePublish,
);

router.get(
  '/:id/read-analytics',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AnnouncementController.getReadAnalytics,
);

router.patch(
  '/:id/mark-read',
  authenticate,
  AnnouncementController.markAnnouncementRead,
);

export default router;
