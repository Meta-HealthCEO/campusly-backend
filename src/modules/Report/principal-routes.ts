import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { PrincipalController } from './principal-controller.js';
import { principalQuerySchema, benchmarkUpdateSchema } from './principal-validation.js';
import { ForbiddenError } from '../../common/errors.js';

// ─── Middleware: requirePrincipal ────────────────────────────────────────────

function requirePrincipal(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role === 'super_admin') return next();
  if (req.user?.role === 'school_admin' && req.user.isSchoolPrincipal) return next();
  throw new ForbiddenError('Principal access required');
}

const router = Router();

// All routes require authentication + principal access
router.use(authenticate, requirePrincipal);

// ─── KPI Overview ───────────────────────────────────────────────────────────

router.get(
  '/kpis',
  validate({ query: principalQuerySchema }),
  PrincipalController.getKpis,
);

// ─── Benchmarks ─────────────────────────────────────────────────────────────

router.get('/benchmarks', PrincipalController.getBenchmarks);
router.put(
  '/benchmarks',
  validate({ body: benchmarkUpdateSchema }),
  PrincipalController.updateBenchmarks,
);

// ─── Term Trends ────────────────────────────────────────────────────────────

router.get(
  '/trends',
  validate({ query: principalQuerySchema }),
  PrincipalController.getTrends,
);

// ─── Subject Heatmap ────────────────────────────────────────────────────────

router.get(
  '/subject-heatmap',
  validate({ query: principalQuerySchema }),
  PrincipalController.getSubjectHeatmap,
);

// ─── Teacher Performance ────────────────────────────────────────────────────

router.get(
  '/teacher-performance',
  validate({ query: principalQuerySchema }),
  PrincipalController.getTeacherPerformance,
);

// ─── Financial Health ───────────────────────────────────────────────────────

router.get(
  '/financial-health',
  validate({ query: principalQuerySchema }),
  PrincipalController.getFinancialHealth,
);

// ─── Risk Alerts ────────────────────────────────────────────────────────────

router.get('/risk-alerts', PrincipalController.getRiskAlerts);

// ─── Executive Summary ──────────────────────────────────────────────────────

router.get(
  '/executive-summary',
  validate({ query: principalQuerySchema }),
  PrincipalController.getExecutiveSummary,
);

export default router;
