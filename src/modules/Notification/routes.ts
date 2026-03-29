import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { NotificationController } from './controller.js';
import {
  createNotificationSchema,
  bulkNotificationSchema,
  updatePreferenceSchema,
} from './validation.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(createNotificationSchema),
  NotificationController.create,
);

router.get(
  '/',
  authenticate,
  NotificationController.list,
);

router.get(
  '/unread-count',
  authenticate,
  NotificationController.getUnreadCount,
);

router.patch(
  '/read-all',
  authenticate,
  NotificationController.markAllAsRead,
);

router.patch(
  '/:id/read',
  authenticate,
  NotificationController.markAsRead,
);

router.post(
  '/bulk',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(bulkNotificationSchema),
  NotificationController.bulkCreate,
);

router.get(
  '/preferences',
  authenticate,
  NotificationController.getPreferences,
);

router.put(
  '/preferences',
  authenticate,
  validate(updatePreferenceSchema),
  NotificationController.updatePreferences,
);

export default router;
