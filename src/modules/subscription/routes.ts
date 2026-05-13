import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { SubscriptionController } from './controller.js';

const router = Router();

router.get('/plans', authenticate, SubscriptionController.listPlans);
router.get('/subscriptions/me', authenticate, SubscriptionController.getMine);
router.post('/subscriptions/checkout', authenticate, SubscriptionController.checkout);

export default router;
