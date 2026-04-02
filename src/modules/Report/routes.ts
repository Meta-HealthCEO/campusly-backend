import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { ReportController } from './controller.js';
import { reportQuerySchema } from './validation.js';

const router = Router();

// ─── Dashboard ──────────────────────────────────────────────────────────────

router.get(
  '/dashboard',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate({ query: reportQuerySchema }),
  ReportController.getDashboardStats,
);

// ─── Revenue ────────────────────────────────────────────────────────────────

router.get(
  '/revenue',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate({ query: reportQuerySchema }),
  ReportController.getRevenueReport,
);

// ─── Attendance ─────────────────────────────────────────────────────────────

router.get(
  '/attendance',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate({ query: reportQuerySchema }),
  ReportController.getAttendanceReport,
);

// ─── Academic Performance ───────────────────────────────────────────────────

router.get(
  '/academic-performance',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate({ query: reportQuerySchema }),
  ReportController.getAcademicPerformanceReport,
);

// ─── Student Report Card ────────────────────────────────────────────────────

router.get(
  '/student-report-card/:studentId',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate({ query: reportQuerySchema }),
  ReportController.getStudentReportCard,
);

// ─── Debtors ────────────────────────────────────────────────────────────────

router.get(
  '/debtors',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate({ query: reportQuerySchema }),
  ReportController.getDebtorsReport,
);

// ─── Tuck Shop Sales ────────────────────────────────────────────────────────

router.get(
  '/tuck-shop-sales',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate({ query: reportQuerySchema }),
  ReportController.getTuckShopSalesReport,
);

export default router;
