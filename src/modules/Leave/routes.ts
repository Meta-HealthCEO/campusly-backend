import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { LeaveController } from './controller.js';
import {
  createLeaveRequestSchema,
  reviewLeaveRequestSchema,
  listLeaveRequestsSchema,
  leavePolicySchema,
  leaveBalanceInitSchema,
  leaveCalendarQuerySchema,
  substituteQuerySchema,
  reportSummaryQuerySchema,
} from './validation.js';

const router = Router();

// ─── Policy ───────────────────────────────────────────────────────────────────

router.get(
  '/policy',
  authorize('super_admin', 'school_admin', 'teacher'),
  LeaveController.getPolicy,
);

router.put(
  '/policy',
  authorize('super_admin', 'school_admin'),
  validate({ body: leavePolicySchema }),
  LeaveController.updatePolicy,
);

// ─── Requests ─────────────────────────────────────────────────────────────────

router.post(
  '/requests',
  authorize('super_admin', 'school_admin', 'teacher'),
  validate({ body: createLeaveRequestSchema }),
  LeaveController.createRequest,
);

router.get(
  '/requests',
  authorize('super_admin', 'school_admin', 'teacher'),
  validate({ query: listLeaveRequestsSchema }),
  LeaveController.listRequests,
);

router.get(
  '/requests/:id',
  authorize('super_admin', 'school_admin', 'teacher'),
  LeaveController.getRequest,
);

router.put(
  '/requests/:id/review',
  authorize('super_admin', 'school_admin'),
  validate({ body: reviewLeaveRequestSchema }),
  LeaveController.reviewRequest,
);

router.put(
  '/requests/:id/cancel',
  authorize('super_admin', 'school_admin', 'teacher'),
  LeaveController.cancelRequest,
);

// ─── Balances ─────────────────────────────────────────────────────────────────

router.get(
  '/balances',
  authorize('super_admin', 'school_admin', 'teacher'),
  LeaveController.getBalances,
);

router.post(
  '/balances/initialize',
  authorize('super_admin', 'school_admin'),
  validate({ body: leaveBalanceInitSchema }),
  LeaveController.initializeBalances,
);

// ─── Calendar ─────────────────────────────────────────────────────────────────

router.get(
  '/calendar',
  authorize('super_admin', 'school_admin', 'teacher'),
  validate({ query: leaveCalendarQuerySchema }),
  LeaveController.getCalendar,
);

// ─── Substitutes ──────────────────────────────────────────────────────────────

router.get(
  '/substitutes',
  authorize('super_admin', 'school_admin', 'teacher'),
  validate({ query: substituteQuerySchema }),
  LeaveController.getSuggestions,
);

// ─── Reports ──────────────────────────────────────────────────────────────────

router.get(
  '/reports/summary',
  authorize('super_admin', 'school_admin'),
  validate({ query: reportSummaryQuerySchema }),
  LeaveController.getReportSummary,
);

export default router;
