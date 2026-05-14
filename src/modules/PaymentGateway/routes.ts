import { Router } from 'express';
import { authenticate, authorize, validate } from '../../middleware/index.js';
import { PaymentGatewayController } from './controller.js';
import {
  gatewayConfigSchema,
  initiatePaymentSchema,
  initiateWalletTopupSchema,
  refundSchema,
  onegateFeePaymentSchema,
  onegateWalletTopupSchema,
} from './validation.js';
import {
  initiateOneGateFeePayment,
  initiateOneGateWalletTopup,
} from './controllers/onegate.controller.js';

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

// ─── OneGate Parent Payment Flows (mobile) ──────────────────────────────────

router.post(
  '/onegate/fee-payment',
  authenticate,
  authorize('parent'),
  validate(onegateFeePaymentSchema),
  initiateOneGateFeePayment,
);

router.post(
  '/onegate/wallet-topup',
  authenticate,
  authorize('parent'),
  validate(onegateWalletTopupSchema),
  initiateOneGateWalletTopup,
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
