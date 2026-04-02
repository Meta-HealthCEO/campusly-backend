import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { AccountingController } from './controller.js';
import { configSchema, exportSchema } from './validation.js';

const router = Router();

// ─── Config ──────────────────────────────────────────────────────────────────

router.get(
  '/config',
  authorize('super_admin', 'school_admin'),
  AccountingController.getConfig,
);

router.put(
  '/config',
  authorize('super_admin', 'school_admin'),
  validate(configSchema),
  AccountingController.upsertConfig,
);

// ─── Exports ─────────────────────────────────────────────────────────────────

router.post(
  '/export',
  authorize('super_admin', 'school_admin'),
  validate(exportSchema),
  AccountingController.generateExport,
);

router.get(
  '/exports',
  authorize('super_admin', 'school_admin'),
  AccountingController.listExports,
);

router.get(
  '/exports/:id/download',
  authorize('super_admin', 'school_admin'),
  AccountingController.downloadExport,
);

// ─── Reports ─────────────────────────────────────────────────────────────────

router.get(
  '/income-statement',
  authorize('super_admin', 'school_admin'),
  AccountingController.getIncomeStatement,
);

router.get(
  '/cash-flow',
  authorize('super_admin', 'school_admin'),
  AccountingController.getCashFlow,
);

export default router;
