import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { BudgetController } from './controller.js';
import { receiptUpload } from './service-upload.js';
import {
  createCategorySchema,
  updateCategorySchema,
  seedCategoriesSchema,
  createBudgetSchema,
  updateBudgetSchema,
  createExpenseSchema,
  updateExpenseSchema,
  approveExpenseSchema,
  rejectExpenseSchema,
  expenseQuerySchema,
  varianceQuerySchema,
  monthlyQuerySchema,
  cashflowQuerySchema,
  comparisonQuerySchema,
  alertsQuerySchema,
  uploadReceiptBodySchema,
} from './validation.js';

const router = Router();

// ─── Categories ─────────────────────────────────────────────────────────────

router.post(
  '/categories',
  authorize('super_admin', 'school_admin'),
  validate(createCategorySchema),
  BudgetController.createCategory,
);

router.get(
  '/categories',
  authorize('super_admin', 'school_admin'),
  BudgetController.listCategories,
);

router.put(
  '/categories/:id',
  authorize('super_admin', 'school_admin'),
  validate(updateCategorySchema),
  BudgetController.updateCategory,
);

router.delete(
  '/categories/:id',
  authorize('super_admin', 'school_admin'),
  BudgetController.deleteCategory,
);

router.post(
  '/categories/seed',
  authorize('super_admin', 'school_admin'),
  validate(seedCategoriesSchema),
  BudgetController.seedCategories,
);

// ─── Budgets ────────────────────────────────────────────────────────────────

router.post(
  '/budgets',
  authorize('super_admin', 'school_admin'),
  validate(createBudgetSchema),
  BudgetController.createBudget,
);

router.get(
  '/budgets',
  authorize('super_admin', 'school_admin'),
  BudgetController.listBudgets,
);

router.get(
  '/budgets/:id',
  authorize('super_admin', 'school_admin'),
  BudgetController.getBudget,
);

router.put(
  '/budgets/:id',
  authorize('super_admin', 'school_admin'),
  validate(updateBudgetSchema),
  BudgetController.updateBudget,
);

router.delete(
  '/budgets/:id',
  authorize('super_admin', 'school_admin'),
  BudgetController.deleteBudget,
);

// ─── Expenses ───────────────────────────────────────────────────────────────

router.post(
  '/expenses',
  authorize('super_admin', 'school_admin', 'teacher', 'staff'),
  validate(createExpenseSchema),
  BudgetController.createExpense,
);

router.get(
  '/expenses',
  authorize('super_admin', 'school_admin', 'teacher', 'staff'),
  validate({ query: expenseQuerySchema }),
  BudgetController.listExpenses,
);

router.get(
  '/expenses/:id',
  authorize('super_admin', 'school_admin', 'teacher', 'staff'),
  BudgetController.getExpense,
);

router.put(
  '/expenses/:id',
  authorize('super_admin', 'school_admin', 'teacher', 'staff'),
  validate(updateExpenseSchema),
  BudgetController.updateExpense,
);

router.delete(
  '/expenses/:id',
  authorize('super_admin', 'school_admin'),
  BudgetController.deleteExpense,
);

router.post(
  '/expenses/:id/approve',
  authorize('super_admin', 'school_admin'),
  validate(approveExpenseSchema),
  BudgetController.approveExpense,
);

router.post(
  '/expenses/:id/reject',
  authorize('super_admin', 'school_admin'),
  validate(rejectExpenseSchema),
  BudgetController.rejectExpense,
);

router.post(
  '/expenses/upload-receipt',
  authorize('super_admin', 'school_admin', 'teacher', 'staff'),
  receiptUpload.single('receipt'),
  validate(uploadReceiptBodySchema),
  BudgetController.uploadReceipt,
);

// ─── Reports ────────────────────────────────────────────────────────────────

router.get(
  '/reports/variance',
  authorize('super_admin', 'school_admin'),
  validate({ query: varianceQuerySchema }),
  BudgetController.getVariance,
);

router.get(
  '/reports/monthly',
  authorize('super_admin', 'school_admin'),
  validate({ query: monthlyQuerySchema }),
  BudgetController.getMonthly,
);

router.get(
  '/reports/cashflow',
  authorize('super_admin', 'school_admin'),
  validate({ query: cashflowQuerySchema }),
  BudgetController.getCashflow,
);

router.get(
  '/reports/comparison',
  authorize('super_admin', 'school_admin'),
  validate({ query: comparisonQuerySchema }),
  BudgetController.getComparison,
);

router.get(
  '/reports/export',
  authorize('super_admin', 'school_admin'),
  BudgetController.exportReport,
);

// ─── Alerts ─────────────────────────────────────────────────────────────────

router.get(
  '/alerts',
  authorize('super_admin', 'school_admin'),
  validate({ query: alertsQuerySchema }),
  BudgetController.getAlerts,
);

export default router;
