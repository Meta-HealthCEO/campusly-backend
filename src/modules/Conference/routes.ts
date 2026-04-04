import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { ConferenceController } from './controller.js';
import {
  createEventSchema,
  updateEventSchema,
  changeEventStatusSchema,
  listEventsSchema,
  setAvailabilitySchema,
  createBookingSchema,
  listBookingsSchema,
  myScheduleSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
  joinWaitlistSchema,
  listWaitlistSchema,
} from './validation.js';

const router = Router();

// ─── Events ──────────────────────────────────────────────────────────────────

router.post(
  '/events',
  authorize('super_admin', 'school_admin'),
  validate({ body: createEventSchema }),
  ConferenceController.createEvent,
);

router.get(
  '/events',
  authorize('super_admin', 'school_admin', 'teacher', 'parent'),
  validate({ query: listEventsSchema }),
  ConferenceController.listEvents,
);

router.get(
  '/events/:id',
  authorize('super_admin', 'school_admin', 'teacher', 'parent'),
  ConferenceController.getEvent,
);

router.put(
  '/events/:id',
  authorize('super_admin', 'school_admin'),
  validate({ body: updateEventSchema }),
  ConferenceController.updateEvent,
);

router.patch(
  '/events/:id/status',
  authorize('super_admin', 'school_admin'),
  validate({ body: changeEventStatusSchema }),
  ConferenceController.changeEventStatus,
);

router.delete(
  '/events/:id',
  authorize('super_admin', 'school_admin'),
  ConferenceController.deleteEvent,
);

// ─── Teacher Availability ────────────────────────────────────────────────────

router.post(
  '/events/:eventId/availability',
  authorize('super_admin', 'school_admin', 'teacher'),
  validate({ body: setAvailabilitySchema }),
  ConferenceController.setAvailability,
);

router.get(
  '/events/:eventId/availability',
  authorize('super_admin', 'school_admin', 'teacher', 'parent'),
  ConferenceController.getAvailability,
);

// ─── Bookings ────────────────────────────────────────────────────────────────

router.post(
  '/bookings',
  authorize('super_admin', 'school_admin', 'parent'),
  validate({ body: createBookingSchema }),
  ConferenceController.createBooking,
);

router.get(
  '/bookings',
  authorize('super_admin', 'school_admin', 'teacher', 'parent'),
  validate({ query: listBookingsSchema }),
  ConferenceController.listBookings,
);

router.get(
  '/bookings/my-schedule',
  authorize('parent', 'teacher'),
  validate({ query: myScheduleSchema }),
  ConferenceController.getMySchedule,
);

router.patch(
  '/bookings/:id/cancel',
  authorize('super_admin', 'school_admin', 'parent'),
  validate({ body: cancelBookingSchema }),
  ConferenceController.cancelBooking,
);

router.patch(
  '/bookings/:id/status',
  authorize('super_admin', 'school_admin', 'teacher'),
  validate({ body: updateBookingStatusSchema }),
  ConferenceController.updateBookingStatus,
);

// ─── Waitlist ────────────────────────────────────────────────────────────────

router.post(
  '/waitlist',
  authorize('super_admin', 'school_admin', 'parent'),
  validate({ body: joinWaitlistSchema }),
  ConferenceController.joinWaitlist,
);

router.get(
  '/waitlist',
  authorize('super_admin', 'school_admin', 'teacher', 'parent'),
  validate({ query: listWaitlistSchema }),
  ConferenceController.listWaitlist,
);

router.delete(
  '/waitlist/:id',
  authorize('super_admin', 'school_admin', 'parent'),
  ConferenceController.removeFromWaitlist,
);

// ─── Reports ─────────────────────────────────────────────────────────────────

router.get(
  '/events/:eventId/report',
  authorize('super_admin', 'school_admin'),
  ConferenceController.getEventReport,
);

export default router;
