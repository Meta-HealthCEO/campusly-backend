import { Router } from 'express';
import { authenticate, authorize, validate } from '../../middleware/index.js';
import { WhatsAppController } from './controller.js';
import {
  configSchema,
  sendMessageSchema,
  broadcastSchema,
  optInSchema,
  optOutSchema,
} from './validation.js';

const router = Router();

// ─── Admin Config ──────────────────────────────────────────────────────────

router.get(
  '/config',
  authenticate,
  authorize('super_admin', 'school_admin'),
  WhatsAppController.getConfig,
);

router.put(
  '/config',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(configSchema),
  WhatsAppController.upsertConfig,
);

// ─── Send Messages ─────────────────────────────────────────────────────────

router.post(
  '/send',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(sendMessageSchema),
  WhatsAppController.sendMessage,
);

router.post(
  '/broadcast',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(broadcastSchema),
  WhatsAppController.broadcast,
);

// ─── Webhook (NO AUTH — Twilio calls this directly) ────────────────────────

router.post(
  '/webhook',
  WhatsAppController.handleWebhook,
);

// ─── Delivery Reports (admin) ──────────────────────────────────────────────

router.get(
  '/delivery-report',
  authenticate,
  authorize('super_admin', 'school_admin'),
  WhatsAppController.getDeliveryReport,
);

router.get(
  '/delivery-stats',
  authenticate,
  authorize('super_admin', 'school_admin'),
  WhatsAppController.getDeliveryStats,
);

// ─── Opt-In / Opt-Out (parent) ─────────────────────────────────────────────

router.post(
  '/opt-in',
  authenticate,
  authorize('parent'),
  validate(optInSchema),
  WhatsAppController.optIn,
);

router.post(
  '/opt-out',
  authenticate,
  authorize('parent'),
  validate(optOutSchema),
  WhatsAppController.optOut,
);

router.get(
  '/opt-in-status',
  authenticate,
  authorize('parent'),
  WhatsAppController.getOptInStatus,
);

export default router;
