import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { createRateLimiter } from '../../middleware/rateLimiter.js';
import { requireBillingOwner } from '../../middleware/require-billing-owner.js';
import { SubscriptionController } from './controller.js';
import { handleOneGateWebhook } from './webhook.js';

const router = Router();

const baseWebhookLimiter = createRateLimiter(60 * 1000, 60);

function webhookLimiter(req: Request, res: Response, next: NextFunction): void {
  const allow = (process.env.ONEGATE_IP_ALLOWLIST ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allow.length > 0 && req.ip && allow.includes(req.ip)) {
    next();
    return;
  }
  void baseWebhookLimiter(req, res, next);
}

router.get('/plans', authenticate, SubscriptionController.listPlans);
router.get('/subscriptions/me', authenticate, SubscriptionController.getMine);
router.get('/subscriptions/ai-usage', authenticate, SubscriptionController.getAIUsage);
router.post('/subscriptions/checkout', authenticate, requireBillingOwner, SubscriptionController.checkout);
router.post('/subscriptions/cancel', authenticate, requireBillingOwner, SubscriptionController.cancel);
router.post('/subscriptions/resume', authenticate, requireBillingOwner, SubscriptionController.resume);
router.get('/subscriptions/invoices', authenticate, requireBillingOwner, SubscriptionController.listInvoices);
router.get('/subscriptions/checkout-session/:id', authenticate, requireBillingOwner, SubscriptionController.getCheckoutSession);

// Public — OneGate-server-to-server callback. Idempotency handled inside the handler.
// Rate limit: 60 req/min per IP, with ONEGATE_IP_ALLOWLIST exempt.
router.post('/webhooks/onegate', webhookLimiter, handleOneGateWebhook);

export default router;
