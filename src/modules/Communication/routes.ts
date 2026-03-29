import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { CommunicationController } from './controller.js';
import { createTemplateSchema, updateTemplateSchema, sendBulkMessageSchema } from './validation.js';

const router = Router();

// ─── Template Routes ────────────────────────────────────────────────────────

router.post(
  '/templates',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(createTemplateSchema),
  CommunicationController.createTemplate,
);

router.get(
  '/templates',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.listTemplates,
);

router.get(
  '/templates/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.getTemplate,
);

router.put(
  '/templates/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(updateTemplateSchema),
  CommunicationController.updateTemplate,
);

router.delete(
  '/templates/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.deleteTemplate,
);

// ─── Bulk Message Routes ────────────────────────────────────────────────────

router.post(
  '/send',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(sendBulkMessageSchema),
  CommunicationController.sendBulkMessage,
);

router.get(
  '/messages',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.listMessages,
);

router.get(
  '/messages/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.getMessage,
);

// ─── Delivery Stats ─────────────────────────────────────────────────────────

router.get(
  '/messages/:id/stats',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.getDeliveryStats,
);

router.get(
  '/messages/:id/logs',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.getMessageLogs,
);

export default router;
