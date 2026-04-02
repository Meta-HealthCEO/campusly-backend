import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { MeetingController } from './controller.js';
import {
  createMeetingDaySchema,
  createSlotsSchema,
  bookSlotSchema,
  completeSlotSchema,
} from './validation.js';

const router = Router();

// ─── Admin Routes ─────────────────────────────────────────────────────────────

router.post(
  '/days',
  authorize('school_admin'),
  validate(createMeetingDaySchema),
  MeetingController.createMeetingDay,
);

router.get(
  '/days',
  MeetingController.listMeetingDays,
);

router.post(
  '/slots/generate',
  authorize('school_admin'),
  validate(createSlotsSchema),
  MeetingController.generateSlots,
);

router.get(
  '/days/:id/stats',
  authorize('school_admin'),
  MeetingController.getMeetingDayStats,
);

// ─── Teacher Routes ───────────────────────────────────────────────────────────

router.get(
  '/teacher/slots',
  authorize('teacher'),
  MeetingController.getTeacherSlots,
);

router.patch(
  '/slots/:id/complete',
  authorize('teacher'),
  validate(completeSlotSchema),
  MeetingController.markComplete,
);

// ─── Parent Routes ────────────────────────────────────────────────────────────

router.get(
  '/available',
  authorize('parent'),
  MeetingController.getAvailableSlots,
);

router.post(
  '/slots/:id/book',
  authorize('parent'),
  validate(bookSlotSchema),
  MeetingController.bookSlot,
);

router.patch(
  '/slots/:id/cancel',
  authorize('parent', 'school_admin'),
  MeetingController.cancelBooking,
);

router.get(
  '/parent/bookings',
  authorize('parent'),
  MeetingController.getParentBookings,
);

export default router;
