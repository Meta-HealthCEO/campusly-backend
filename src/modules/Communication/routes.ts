import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { CommunicationController } from './controller.js';
import {
  createTemplateSchema,
  updateTemplateSchema,
  sendBulkMessageSchema,
  scheduleMessageSchema,
  previewTemplateSchema,
  updateConfigSchema,
  testChannelSchema,
  registerDeviceSchema,
} from './validation.js';

const router = Router();

// ─── Channel Configuration ──────────────────────────────────────────────────

router.get(
  '/config',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.getConfig,
);

router.put(
  '/config',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(updateConfigSchema),
  CommunicationController.updateConfig,
);

router.post(
  '/config/test',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(testChannelSchema),
  CommunicationController.testChannel,
);

// ─── Template Routes ────────────────────────────────────────────────────────

router.post(
  '/templates',
  authenticate,
  authorize('school_admin', 'super_admin', 'teacher'),
  validate(createTemplateSchema),
  CommunicationController.createTemplate,
);

router.get(
  '/templates',
  authenticate,
  authorize('school_admin', 'super_admin', 'teacher'),
  CommunicationController.listTemplates,
);

router.get(
  '/templates/:id',
  authenticate,
  authorize('school_admin', 'super_admin', 'teacher'),
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
  authorize('school_admin', 'super_admin', 'teacher'),
  CommunicationController.deleteTemplate,
);

router.post(
  '/templates/:id/preview',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(previewTemplateSchema),
  CommunicationController.previewTemplate,
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
  authorize('school_admin', 'super_admin', 'teacher'),
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

// ─── Per-Message Delivery Stats ─────────────────────────────────────────────

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

// ─── Global Delivery Log + Stats ────────────────────────────────────────────

router.get(
  '/delivery-log',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.getDeliveryLog,
);

router.get(
  '/delivery-stats',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.getDeliveryStatsGlobal,
);

router.post(
  '/delivery-log/:id/retry',
  authenticate,
  authorize('school_admin', 'super_admin'),
  CommunicationController.retryDelivery,
);

// ─── Device Registration ────────────────────────────────────────────────────

router.post(
  '/devices',
  authenticate,
  validate(registerDeviceSchema),
  CommunicationController.registerDevice,
);

router.delete(
  '/devices/:token',
  authenticate,
  CommunicationController.unregisterDevice,
);

export default router;
