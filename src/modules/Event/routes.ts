import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { EventController } from './controller.js';
import { createEventSchema, updateEventSchema, createRsvpSchema, updateRsvpSchema } from './validation.js';

const router = Router();

// ─── Event Routes ───────────────────────────────────────────────────────────

router.post(
  '/',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createEventSchema),
  EventController.create,
);

router.get(
  '/',
  authenticate,
  EventController.list,
);

router.get(
  '/:id',
  authenticate,
  EventController.getById,
);

router.put(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateEventSchema),
  EventController.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  EventController.delete,
);

// ─── RSVP Routes ────────────────────────────────────────────────────────────

router.post(
  '/rsvp',
  authenticate,
  validate(createRsvpSchema),
  EventController.createRsvp,
);

router.put(
  '/:eventId/rsvp',
  authenticate,
  validate(updateRsvpSchema),
  EventController.updateRsvp,
);

router.get(
  '/:eventId/rsvps',
  authenticate,
  EventController.getEventRsvps,
);

router.delete(
  '/:eventId/rsvp',
  authenticate,
  EventController.deleteRsvp,
);

export default router;
