import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { CommunicationController } from './controller.js';
import { createTemplateSchema, updateTemplateSchema, sendBulkMessageSchema, scheduleMessageSchema } from './validation.js';

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

// ─── Schedule Route ─────────────────────────────────────────────────────────

router.post(
  '/schedule',
  authenticate,
  authorize('school_admin', 'teacher'),
  validate(scheduleMessageSchema),
  CommunicationController.scheduleMessage,
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

// ─── Read Receipts ──────────────────────────────────────────────────────────

router.patch(
  '/messages/:id/mark-read',
  authenticate,
  authorize('parent', 'teacher', 'student'),
  CommunicationController.markMessageRead,
);

router.get(
  '/messages/:id/read-receipts',
  authenticate,
  authorize('school_admin', 'teacher'),
  CommunicationController.getReadReceipts,
);

router.get(
  '/messages/:id/read-stats',
  authenticate,
  authorize('school_admin', 'teacher'),
  CommunicationController.getReadReceiptStats,
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
