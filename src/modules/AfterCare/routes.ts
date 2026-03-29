import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { AfterCareController } from './controller.js';
import {
  createRegistrationSchema,
  updateRegistrationSchema,
  checkInSchema,
  checkOutSchema,
  createPickupAuthSchema,
  updatePickupAuthSchema,
  createSignOutLogSchema,
  createActivitySchema,
  updateActivitySchema,
  generateInvoicesSchema,
} from './validation.js';

const router = Router();

// ─── Registration Routes ────────────────────────────────────────────────────

router.post(
  '/registrations',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createRegistrationSchema),
  AfterCareController.createRegistration,
);

router.get(
  '/registrations',
  authenticate,
  AfterCareController.listRegistrations,
);

router.get(
  '/registrations/:id',
  authenticate,
  AfterCareController.getRegistration,
);

router.put(
  '/registrations/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateRegistrationSchema),
  AfterCareController.updateRegistration,
);

router.delete(
  '/registrations/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AfterCareController.deleteRegistration,
);

// ─── Attendance Routes ──────────────────────────────────────────────────────

router.post(
  '/attendance/check-in',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(checkInSchema),
  AfterCareController.checkIn,
);

router.patch(
  '/attendance/:id/check-out',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(checkOutSchema),
  AfterCareController.checkOut,
);

router.get(
  '/attendance',
  authenticate,
  AfterCareController.listAttendance,
);

router.get(
  '/attendance/:id',
  authenticate,
  AfterCareController.getAttendance,
);

router.delete(
  '/attendance/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AfterCareController.deleteAttendance,
);

// ─── Pickup Authorization Routes ────────────────────────────────────────────

router.post(
  '/pickup-auth',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createPickupAuthSchema),
  AfterCareController.createPickupAuth,
);

router.get(
  '/pickup-auth',
  authenticate,
  AfterCareController.listPickupAuths,
);

router.put(
  '/pickup-auth/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updatePickupAuthSchema),
  AfterCareController.updatePickupAuth,
);

router.delete(
  '/pickup-auth/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AfterCareController.deletePickupAuth,
);

// ─── Sign Out Log Routes ────────────────────────────────────────────────────

router.post(
  '/sign-out',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(createSignOutLogSchema),
  AfterCareController.createSignOutLog,
);

router.get(
  '/sign-out',
  authenticate,
  AfterCareController.listSignOutLogs,
);

// ─── Activity Routes ────────────────────────────────────────────────────────

router.post(
  '/activities',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(createActivitySchema),
  AfterCareController.createActivity,
);

router.get(
  '/activities',
  authenticate,
  AfterCareController.listActivities,
);

router.get(
  '/activities/:id',
  authenticate,
  AfterCareController.getActivity,
);

router.put(
  '/activities/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(updateActivitySchema),
  AfterCareController.updateActivity,
);

router.delete(
  '/activities/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AfterCareController.deleteActivity,
);

// ─── Invoice Routes ─────────────────────────────────────────────────────────

router.post(
  '/invoices/generate',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(generateInvoicesSchema),
  AfterCareController.generateInvoices,
);

router.get(
  '/invoices',
  authenticate,
  AfterCareController.listInvoices,
);

router.patch(
  '/invoices/:id/paid',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AfterCareController.markInvoicePaid,
);

export default router;
