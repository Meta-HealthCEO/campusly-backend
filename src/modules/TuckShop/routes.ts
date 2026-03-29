import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { TuckShopController } from './controller.js';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  placeOrderSchema,
} from './validation.js';

const router = Router();

// ─── Menu Item Routes ─────────────────────────────────────────────────────────

router.post(
  '/menu',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(createMenuItemSchema),
  TuckShopController.createMenuItem,
);

router.get(
  '/menu',
  authenticate,
  TuckShopController.listMenuItems,
);

router.get(
  '/menu/:id',
  authenticate,
  TuckShopController.getMenuItem,
);

router.put(
  '/menu/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(updateMenuItemSchema),
  TuckShopController.updateMenuItem,
);

router.delete(
  '/menu/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  TuckShopController.deleteMenuItem,
);

router.patch(
  '/menu/:id/stock',
  authenticate,
  authorize('school_admin', 'super_admin'),
  TuckShopController.updateStock,
);

// ─── Order Routes ─────────────────────────────────────────────────────────────

router.post(
  '/orders',
  authenticate,
  authorize('school_admin', 'super_admin', 'teacher'),
  validate(placeOrderSchema),
  TuckShopController.placeOrder,
);

router.get(
  '/orders/student/:studentId',
  authenticate,
  TuckShopController.getStudentOrders,
);

router.get(
  '/orders/:id',
  authenticate,
  TuckShopController.getOrder,
);

// ─── Sales Routes ─────────────────────────────────────────────────────────────

router.get(
  '/sales/daily',
  authenticate,
  authorize('school_admin', 'super_admin'),
  TuckShopController.getDailySales,
);

export default router;
