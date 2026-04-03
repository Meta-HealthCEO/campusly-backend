import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { CurriculumController } from './controller.js';
import {
  createPlanSchema,
  updatePlanSchema,
  planQuerySchema,
  submitProgressSchema,
  progressQuerySchema,
  overviewQuerySchema,
  saveBenchmarkSchema,
  benchmarkQuerySchema,
  updateInterventionSchema,
  interventionQuerySchema,
} from './validation.js';

const router = Router();

const ADMIN_ROLES = ['super_admin', 'school_admin', 'principal'] as const;
const HOD_ROLES = ['super_admin', 'school_admin', 'principal', 'hod'] as const;
const READ_ROLES = ['super_admin', 'school_admin', 'principal', 'hod', 'teacher'] as const;

// ─── Plans ───────────────────────────────────────────────────────────────────

router.post(
  '/plans',
  authorize(...ADMIN_ROLES),
  validate(createPlanSchema),
  CurriculumController.createPlan,
);

router.get(
  '/plans',
  authorize(...READ_ROLES),
  validate({ query: planQuerySchema }),
  CurriculumController.listPlans,
);

router.get(
  '/plans/:id',
  authorize(...READ_ROLES),
  CurriculumController.getPlan,
);

router.put(
  '/plans/:id',
  authorize(...ADMIN_ROLES),
  validate(updatePlanSchema),
  CurriculumController.updatePlan,
);

router.delete(
  '/plans/:id',
  authorize(...ADMIN_ROLES),
  CurriculumController.deletePlan,
);

// ─── Progress ────────────────────────────────────────────────────────────────

router.post(
  '/plans/:planId/progress',
  authorize(...READ_ROLES),
  validate(submitProgressSchema),
  CurriculumController.submitProgress,
);

router.get(
  '/plans/:planId/progress',
  authorize(...READ_ROLES),
  validate({ query: progressQuerySchema }),
  CurriculumController.listProgress,
);

// ─── Pacing Overview ─────────────────────────────────────────────────────────

router.get(
  '/pacing/overview',
  authorize(...HOD_ROLES),
  validate({ query: overviewQuerySchema }),
  CurriculumController.getPacingOverview,
);

// ─── Benchmarks ──────────────────────────────────────────────────────────────

router.post(
  '/benchmarks',
  authorize(...ADMIN_ROLES),
  validate(saveBenchmarkSchema),
  CurriculumController.saveBenchmark,
);

router.get(
  '/benchmarks',
  authorize(...READ_ROLES),
  validate({ query: benchmarkQuerySchema }),
  CurriculumController.listBenchmarks,
);

router.get(
  '/benchmarks/comparison',
  authorize(...HOD_ROLES),
  validate({ query: benchmarkQuerySchema }),
  CurriculumController.getBenchmarkComparison,
);

router.get(
  '/benchmarks/trends',
  authorize(...HOD_ROLES),
  validate({ query: benchmarkQuerySchema }),
  CurriculumController.getBenchmarkTrends,
);

// ─── Interventions ───────────────────────────────────────────────────────────

router.get(
  '/interventions',
  authorize(...HOD_ROLES),
  validate({ query: interventionQuerySchema }),
  CurriculumController.listInterventions,
);

router.put(
  '/interventions/:id',
  authorize(...HOD_ROLES),
  validate(updateInterventionSchema),
  CurriculumController.updateIntervention,
);

export default router;
