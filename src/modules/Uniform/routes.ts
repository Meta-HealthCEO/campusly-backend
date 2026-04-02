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
  createSizeGuideSchema,
  updateSizeGuideSchema,
  createPreOrderSchema,
  updatePreOrderStatusSchema,
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

router.get(
  '/orders/:id/timeline',
  authenticate,
  UniformController.getOrderTimeline,
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

// ─── Size Guide Routes ─────────────────────────────────────────────────────

router.post(
  '/items/:itemId/size-guide',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createSizeGuideSchema),
  UniformController.createSizeGuide,
);

router.get(
  '/items/:itemId/size-guide',
  authenticate,
  UniformController.getSizeGuide,
);

router.put(
  '/items/:itemId/size-guide',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateSizeGuideSchema),
  UniformController.updateSizeGuide,
);

router.delete(
  '/items/:itemId/size-guide',
  authenticate,
  authorize('super_admin', 'school_admin'),
  UniformController.deleteSizeGuide,
);

// ─── Pre Order Routes ──────────────────────────────────────────────────────

router.post(
  '/pre-orders',
  authenticate,
  validate(createPreOrderSchema),
  UniformController.createPreOrder,
);

router.get(
  '/pre-orders',
  authenticate,
  UniformController.listPreOrders,
);

router.get(
  '/pre-orders/:id',
  authenticate,
  UniformController.getPreOrder,
);

router.patch(
  '/pre-orders/:id/status',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updatePreOrderStatusSchema),
  UniformController.updatePreOrderStatus,
);

router.delete(
  '/pre-orders/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  UniformController.deletePreOrder,
);

// ─── Size Recommendation Routes ───────────────────────────────────────────

router.get(
  '/size-recommendation/:studentId',
  authenticate,
  UniformController.getSizeRecommendation,
);

router.get(
  '/requirements/:gradeId',
  authenticate,
  UniformController.getUniformRequirements,
);

// ─── Low Stock Routes ──────────────────────────────────────────────────────

router.get(
  '/low-stock',
  authenticate,
  authorize('super_admin', 'school_admin'),
  UniformController.getLowStockItems,
);

export default router;
