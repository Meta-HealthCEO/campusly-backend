import { Router } from 'express';
import { authenticate, authorize, validate } from '../../middleware/index.js';
import { PaymentGatewayController } from './controller.js';
import {
  gatewayConfigSchema,
  initiatePaymentSchema,
  initiateWalletTopupSchema,
  refundSchema,
} from './validation.js';

const router = Router();

// ─── Gateway Config (admin only) ────────────────────────────────────────────

router.get(
  '/config',
  authenticate,
  authorize('super_admin', 'school_admin'),
  PaymentGatewayController.getConfig,
);

router.put(
  '/config',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(gatewayConfigSchema),
  PaymentGatewayController.upsertConfig,
);

// ─── Parent Payment Flows ───────────────────────────────────────────────────

router.post(
  '/pay',
  authenticate,
  authorize('parent'),
  validate(initiatePaymentSchema),
  PaymentGatewayController.initiatePayment,
);

router.post(
  '/wallet-topup',
  authenticate,
  authorize('parent'),
  validate(initiateWalletTopupSchema),
  PaymentGatewayController.initiateWalletTopup,
);

router.get(
  '/status/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  PaymentGatewayController.getPaymentStatus,
);

// ─── Webhook (NO AUTH — PayFast calls this directly) ────────────────────────

router.post(
  '/webhook/payfast',
  PaymentGatewayController.handleWebhook,
);

// ─── Admin ──────────────────────────────────────────────────────────────────

router.get(
  '/payments',
  authenticate,
  authorize('super_admin', 'school_admin'),
  PaymentGatewayController.listPayments,
);

router.post(
  '/refund',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(refundSchema),
  PaymentGatewayController.refundPayment,
);

router.get(
  '/analytics',
  authenticate,
  authorize('super_admin', 'school_admin'),
  PaymentGatewayController.getPaymentAnalytics,
);

export default router;
