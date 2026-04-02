import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { EventController } from './controller.js';
import { EventWaitlistFeedbackController } from './waitlist-feedback.controller.js';
import {
  createEventSchema,
  updateEventSchema,
  createRsvpSchema,
  updateRsvpSchema,
  purchaseTicketSchema,
  createSeatsSchema,
  reserveSeatSchema,
  checkInSchema,
  uploadGallerySchema,
} from './validation.js';
import {
  joinWaitlistSchema,
  submitFeedbackSchema,
} from './waitlist-feedback.validation.js';

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

// Ticket QR lookup must be defined before /:id to avoid "tickets" matching as an id
router.get(
  '/tickets/qr/:qrCode',
  authenticate,
  EventController.getTicketByQrCode,
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

// ─── Ticket Routes ──────────────────────────────────────────────────────────

router.post(
  '/:eventId/tickets',
  authenticate,
  validate(purchaseTicketSchema),
  EventController.purchaseTicket,
);

router.get(
  '/:eventId/tickets',
  authenticate,
  EventController.listTicketsByEvent,
);

router.patch(
  '/:eventId/tickets/:ticketId/cancel',
  authenticate,
  EventController.cancelTicket,
);

// ─── Seat Routes ────────────────────────────────────────────────────────────

router.post(
  '/:eventId/seats',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createSeatsSchema),
  EventController.createSeats,
);

router.get(
  '/:eventId/seats',
  authenticate,
  EventController.listSeatsByEvent,
);

router.patch(
  '/:eventId/seats/:seatId/reserve',
  authenticate,
  validate(reserveSeatSchema),
  EventController.reserveSeat,
);

router.patch(
  '/:eventId/seats/:seatId/release',
  authenticate,
  EventController.releaseSeat,
);

// ─── Check-In Routes ────────────────────────────────────────────────────────

router.post(
  '/:eventId/check-in',
  authenticate,
  validate(checkInSchema),
  EventController.checkIn,
);

router.get(
  '/:eventId/check-ins',
  authenticate,
  EventController.listCheckInsByEvent,
);

router.get(
  '/:eventId/check-in/stats',
  authenticate,
  EventController.checkInStats,
);

// ─── Gallery Routes ─────────────────────────────────────────────────────────

router.post(
  '/:eventId/gallery',
  authenticate,
  validate(uploadGallerySchema),
  EventController.uploadGalleryImage,
);

router.get(
  '/:eventId/gallery',
  authenticate,
  EventController.listGalleryByEvent,
);

router.delete(
  '/:eventId/gallery/:imageId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  EventController.deleteGalleryImage,
);

// ─── Waitlist Routes ───────────────────────────────────────────────────────

router.post(
  '/:eventId/waitlist',
  authenticate,
  authorize('parent'),
  validate(joinWaitlistSchema),
  EventWaitlistFeedbackController.joinWaitlist,
);

router.get(
  '/:eventId/waitlist',
  authenticate,
  authorize('super_admin', 'school_admin'),
  EventWaitlistFeedbackController.getWaitlist,
);

router.post(
  '/:eventId/waitlist/process',
  authenticate,
  authorize('super_admin', 'school_admin'),
  EventWaitlistFeedbackController.processWaitlist,
);

// ─── Feedback Routes ───────────────────────────────────────────────────────

router.post(
  '/:eventId/feedback',
  authenticate,
  authorize('parent'),
  validate(submitFeedbackSchema),
  EventWaitlistFeedbackController.submitFeedback,
);

router.get(
  '/:eventId/feedback',
  authenticate,
  EventWaitlistFeedbackController.getEventFeedback,
);

// ─── iCal Route ────────────────────────────────────────────────────────────

router.get(
  '/:eventId/ical',
  authenticate,
  EventWaitlistFeedbackController.generateICal,
);

export default router;
