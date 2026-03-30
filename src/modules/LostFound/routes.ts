import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { LostFoundController } from './controller.js';
import { reportItemSchema, claimItemSchema, archiveItemsSchema } from './validation.js';

const router = express.Router();

// POST / — report item (found or lost)
router.post(
  '/',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin', 'parent'),
  validate(reportItemSchema),
  LostFoundController.reportItem,
);

// GET /stats — lost & found statistics (before /:id to avoid conflict)
router.get(
  '/stats',
  authenticate,
  LostFoundController.getStats,
);

// GET / — list items (filterable)
router.get(
  '/',
  authenticate,
  LostFoundController.getItems,
);

// GET /:id — item detail
router.get(
  '/:id',
  authenticate,
  LostFoundController.getItemById,
);

// POST /:id/claim — claim item
router.post(
  '/:id/claim',
  authenticate,
  authorize('parent', 'teacher', 'school_admin', 'super_admin'),
  validate(claimItemSchema),
  LostFoundController.claimItem,
);

// POST /:id/verify — verify and return
router.post(
  '/:id/verify',
  authenticate,
  authorize('school_admin', 'super_admin'),
  LostFoundController.verifyAndReturn,
);

// POST /:id/match/:matchId — match lost to found
router.post(
  '/:id/match/:matchId',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LostFoundController.matchItems,
);

// GET /:id/suggestions — auto-match suggestions
router.get(
  '/:id/suggestions',
  authenticate,
  LostFoundController.getAutoMatchSuggestions,
);

// POST /archive — archive old unclaimed items
router.post(
  '/archive',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(archiveItemsSchema),
  LostFoundController.archiveOldItems,
);

// DELETE /:id — soft delete
router.delete(
  '/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  LostFoundController.softDelete,
);

export default router;
