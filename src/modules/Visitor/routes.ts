import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { requireCapability } from '../../middleware/capability.js';
import { VisitorController } from './controller.js';
import {
  registerVisitorSchema,
  checkoutVisitorSchema,
  listVisitorsSchema,
  createPreRegistrationSchema,
  listPreRegistrationsSchema,
  createLateArrivalSchema,
  listLateArrivalsSchema,
  createEarlyDepartureSchema,
  listEarlyDeparturesSchema,
  dailyReportSchema,
} from './validation.js';

const router = Router();

// ─── Visitors ─────────────────────────────────────────────────────────────────

router.post(
  '/',
  requireCapability('manage_visitors'),
  validate({ body: registerVisitorSchema }),
  VisitorController.register,
);

router.get(
  '/',
  authorize('super_admin', 'school_admin'),
  validate({ query: listVisitorsSchema }),
  VisitorController.list,
);

router.get(
  '/on-premises',
  authorize('super_admin', 'school_admin'),
  VisitorController.getOnPremises,
);

router.get(
  '/on-premises/export',
  authorize('super_admin', 'school_admin'),
  VisitorController.exportOnPremises,
);

// ─── Daily Report ─────────────────────────────────────────────────────────────

router.get(
  '/daily-report',
  authorize('super_admin', 'school_admin'),
  validate({ query: dailyReportSchema }),
  VisitorController.getDailyReport,
);

// ─── Pre-Registration ─────────────────────────────────────────────────────────

router.post(
  '/pre-register',
  requireCapability('manage_visitors'),
  validate({ body: createPreRegistrationSchema }),
  VisitorController.createPreRegistration,
);

router.get(
  '/pre-register',
  authorize('super_admin', 'school_admin', 'teacher'),
  validate({ query: listPreRegistrationsSchema }),
  VisitorController.listPreRegistrations,
);

router.patch(
  '/pre-register/:id/cancel',
  requireCapability('manage_visitors'),
  VisitorController.cancelPreRegistration,
);

// ─── Late Arrivals ────────────────────────────────────────────────────────────

router.post(
  '/late-arrivals',
  requireCapability('manage_visitors'),
  validate({ body: createLateArrivalSchema }),
  VisitorController.createLateArrival,
);

router.get(
  '/late-arrivals',
  authorize('super_admin', 'school_admin', 'teacher'),
  validate({ query: listLateArrivalsSchema }),
  VisitorController.listLateArrivals,
);

// ─── Early Departures ─────────────────────────────────────────────────────────

router.post(
  '/early-departures',
  requireCapability('manage_visitors'),
  validate({ body: createEarlyDepartureSchema }),
  VisitorController.createEarlyDeparture,
);

router.get(
  '/early-departures',
  authorize('super_admin', 'school_admin', 'teacher'),
  validate({ query: listEarlyDeparturesSchema }),
  VisitorController.listEarlyDepartures,
);

// ─── Single Visitor (must be after static routes) ─────────────────────────────

router.get(
  '/:id',
  authorize('super_admin', 'school_admin'),
  VisitorController.getById,
);

router.patch(
  '/:id/checkout',
  requireCapability('manage_visitors'),
  validate({ body: checkoutVisitorSchema }),
  VisitorController.checkout,
);

export default router;
