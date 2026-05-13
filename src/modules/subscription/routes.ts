import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { SubscriptionController } from './controller.js';

const router = Router();

router.get('/plans', authenticate, SubscriptionController.listPlans);
router.get('/subscriptions/me', authenticate, SubscriptionController.getMine);
router.post('/subscriptions/checkout', authenticate, SubscriptionController.checkout);
router.post('/subscriptions/cancel', authenticate, SubscriptionController.cancel);
router.post('/subscriptions/resume', authenticate, SubscriptionController.resume);
router.get('/subscriptions/invoices', authenticate, SubscriptionController.listInvoices);
router.get('/subscriptions/checkout-session/:id', authenticate, SubscriptionController.getCheckoutSession);

export default router;
