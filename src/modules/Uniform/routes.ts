import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { UniformController } from './controller.js';
import {
  createUniformItemSchema,
  updateUniformItemSchema,
  createUniformOrderSchema,
  updateUniformOrderStatusSchema,
} from './validation.js';

const router = Router();

// ─── Uniform Item Routes ────────────────────────────────────────────────────

router.post(
  '/items',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createUniformItemSchema),
  UniformController.createItem,
);

router.get(
  '/items',
  authenticate,
  UniformController.listItems,
);

router.get(
  '/items/:id',
  authenticate,
  UniformController.getItem,
);

router.put(
  '/items/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateUniformItemSchema),
  UniformController.updateItem,
);

router.delete(
  '/items/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  UniformController.deleteItem,
);

// ─── Uniform Order Routes ───────────────────────────────────────────────────

router.post(
  '/orders',
  authenticate,
  validate(createUniformOrderSchema),
  UniformController.createOrder,
);

router.get(
  '/orders',
  authenticate,
  UniformController.listOrders,
);

router.get(
  '/orders/:id',
  authenticate,
  UniformController.getOrder,
);

router.patch(
  '/orders/:id/status',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateUniformOrderStatusSchema),
  UniformController.updateOrderStatus,
);

router.delete(
  '/orders/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  UniformController.deleteOrder,
);

export default router;
