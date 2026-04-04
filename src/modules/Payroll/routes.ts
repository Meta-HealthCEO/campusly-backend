import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { PayrollController } from './controller.js';
import {
  createTaxTableSchema,
  getTaxTableSchema,
  createSalarySchema,
  updateSalarySchema,
  listSalariesSchema,
  createPayrollRunSchema,
  listRunsSchema,
  reviewRunSchema,
  adjustItemSchema,
  generateCertificatesSchema,
  ctcReportSchema,
  bankFileSchema,
} from './validation.js';

const router = Router();

// ─── Tax Tables ───────────────────────────────────────────────────────────────

router.get(
  '/tax-tables',
  authorize('school_admin', 'super_admin'),
  validate({ query: getTaxTableSchema }),
  PayrollController.getTaxTable,
);

router.post(
  '/tax-tables',
  authorize('super_admin', 'school_admin'),
  validate({ body: createTaxTableSchema }),
  PayrollController.upsertTaxTable,
);

// ─── Salary Records ──────────────────────────────────────────────────────────

router.post(
  '/salaries',
  authorize('school_admin', 'super_admin'),
  validate({ body: createSalarySchema }),
  PayrollController.createSalary,
);

router.get(
  '/salaries',
  authorize('school_admin', 'super_admin'),
  validate({ query: listSalariesSchema }),
  PayrollController.listSalaries,
);

router.get(
  '/salaries/:id',
  authorize('school_admin', 'super_admin', 'teacher'),
  PayrollController.getSalary,
);

router.put(
  '/salaries/:id',
  authorize('school_admin', 'super_admin'),
  validate({ body: updateSalarySchema }),
  PayrollController.updateSalary,
);

router.get(
  '/salaries/:id/history',
  authorize('school_admin', 'super_admin'),
  PayrollController.getSalaryHistory,
);

// ─── Payroll Runs ─────────────────────────────────────────────────────────────

router.post(
  '/runs',
  authorize('school_admin', 'super_admin'),
  validate({ body: createPayrollRunSchema }),
  PayrollController.createRun,
);

router.get(
  '/runs',
  authorize('school_admin', 'super_admin'),
  validate({ query: listRunsSchema }),
  PayrollController.listRuns,
);

router.get(
  '/runs/:id',
  authorize('school_admin', 'super_admin'),
  PayrollController.getRun,
);

router.put(
  '/runs/:id/review',
  authorize('school_admin', 'super_admin'),
  validate({ body: reviewRunSchema }),
  PayrollController.reviewRun,
);

router.put(
  '/runs/:id/approve',
  authorize('school_admin', 'super_admin'),
  PayrollController.approveRun,
);

router.put(
  '/runs/:id/process',
  authorize('school_admin', 'super_admin'),
  PayrollController.processRun,
);

router.put(
  '/runs/:id/items/:itemId',
  authorize('school_admin', 'super_admin'),
  validate({ body: adjustItemSchema }),
  PayrollController.adjustItem,
);

// ─── Bank File ────────────────────────────────────────────────────────────────

router.get(
  '/runs/:id/bank-file',
  authorize('school_admin', 'super_admin'),
  validate({ query: bankFileSchema }),
  PayrollController.getBankFile,
);

// ─── Payslips ─────────────────────────────────────────────────────────────────

router.get(
  '/payslips/:runId/:staffId',
  authorize('school_admin', 'super_admin', 'teacher'),
  PayrollController.getPayslip,
);

// ─── Tax Certificates ────────────────────────────────────────────────────────

router.post(
  '/tax-certificates/generate',
  authorize('school_admin', 'super_admin'),
  validate({ body: generateCertificatesSchema }),
  PayrollController.generateCertificates,
);

// ─── Reports ──────────────────────────────────────────────────────────────────

router.get(
  '/reports/cost-to-company',
  authorize('school_admin', 'super_admin'),
  validate({ query: ctcReportSchema }),
  PayrollController.getCostToCompany,
);

export default router;
