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
  createSecondHandListingSchema,
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

// ─── Second Hand Marketplace Routes ─────────────────────────────────────────

router.post(
  '/second-hand',
  authenticate,
  validate(createSecondHandListingSchema),
  UniformController.createSecondHandListing,
);

router.get(
  '/second-hand',
  authenticate,
  UniformController.listSecondHandListings,
);

router.get(
  '/second-hand/my-listings/:parentId',
  authenticate,
  UniformController.getMyListings,
);

router.get(
  '/second-hand/:id',
  authenticate,
  UniformController.getSecondHandListing,
);

router.patch(
  '/second-hand/:id/reserve',
  authenticate,
  UniformController.reserveSecondHandListing,
);

router.patch(
  '/second-hand/:id/sold',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  UniformController.markSecondHandSold,
);

export default router;
