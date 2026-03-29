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

export default router;
