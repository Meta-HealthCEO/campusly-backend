import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { TransportController } from './controller.js';
import {
  createBusRouteSchema,
  updateBusRouteSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  createBoardingLogSchema,
  logAlightSchema,
  createTransportAlertSchema,
} from './validation.js';

const router = Router();

// ─── Bus Route Routes ───────────────────────────────────────────────────────

router.post(
  '/routes',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createBusRouteSchema),
  TransportController.createBusRoute,
);

router.get(
  '/routes',
  authenticate,
  TransportController.listBusRoutes,
);

router.get(
  '/routes/:id',
  authenticate,
  TransportController.getBusRoute,
);

router.put(
  '/routes/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateBusRouteSchema),
  TransportController.updateBusRoute,
);

router.delete(
  '/routes/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  TransportController.deleteBusRoute,
);

// ─── Assignment Routes ──────────────────────────────────────────────────────

router.post(
  '/assignments',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createAssignmentSchema),
  TransportController.createAssignment,
);

router.get(
  '/assignments',
  authenticate,
  TransportController.listAssignments,
);

router.get(
  '/assignments/:id',
  authenticate,
  TransportController.getAssignment,
);

router.put(
  '/assignments/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateAssignmentSchema),
  TransportController.updateAssignment,
);

router.delete(
  '/assignments/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  TransportController.deleteAssignment,
);

// ─── Boarding Log Routes ────────────────────────────────────────────────────

router.post(
  '/boarding',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(createBoardingLogSchema),
  TransportController.createBoardingLog,
);

router.get(
  '/boarding',
  authenticate,
  TransportController.listBoardingLogs,
);

router.patch(
  '/boarding/:id/alight',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(logAlightSchema),
  TransportController.logAlight,
);

// ─── Transport Alert Routes ─────────────────────────────────────────────────

router.post(
  '/alerts',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createTransportAlertSchema),
  TransportController.createTransportAlert,
);

router.get(
  '/alerts',
  authenticate,
  TransportController.listTransportAlerts,
);

router.get(
  '/alerts/:id',
  authenticate,
  TransportController.getTransportAlert,
);

router.patch(
  '/alerts/:id/resolve',
  authenticate,
  authorize('super_admin', 'school_admin'),
  TransportController.resolveTransportAlert,
);

router.delete(
  '/alerts/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  TransportController.deleteTransportAlert,
);

export default router;
