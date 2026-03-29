import { Router } from 'express';
import { authenticate, authorize, validate } from '../../middleware/index.js';
import { FeeController } from './controller.js';
import {
  createFeeTypeSchema,
  updateFeeTypeSchema,
  createFeeScheduleSchema,
  updateFeeScheduleSchema,
  createInvoiceSchema,
  recordPaymentSchema,
  createDebitOrderSchema,
  updateDebitOrderSchema,
} from './validation.js';

const router = Router();

// ─── Fee Types ───────────────────────────────────────────────────────────────

router.post(
  '/types',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createFeeTypeSchema),
  FeeController.createFeeType,
);

router.get(
  '/types/school/:schoolId',
  authenticate,
  FeeController.listFeeTypes,
);

router.get(
  '/types/:id',
  authenticate,
  FeeController.getFeeType,
);

router.patch(
  '/types/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateFeeTypeSchema),
  FeeController.updateFeeType,
);

router.delete(
  '/types/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.deleteFeeType,
);

// ─── Fee Schedules ───────────────────────────────────────────────────────────

router.post(
  '/schedules',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createFeeScheduleSchema),
  FeeController.createFeeSchedule,
);

router.get(
  '/schedules/school/:schoolId',
  authenticate,
  FeeController.listFeeSchedules,
);

router.get(
  '/schedules/:id',
  authenticate,
  FeeController.getFeeSchedule,
);

router.patch(
  '/schedules/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateFeeScheduleSchema),
  FeeController.updateFeeSchedule,
);

router.delete(
  '/schedules/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.deleteFeeSchedule,
);

// ─── Invoices ────────────────────────────────────────────────────────────────

router.post(
  '/invoices',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createInvoiceSchema),
  FeeController.createInvoice,
);

router.get(
  '/invoices/school/:schoolId',
  authenticate,
  FeeController.listInvoices,
);

router.get(
  '/invoices/school/:schoolId/overdue',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.getOverdueInvoices,
);

router.get(
  '/invoices/:id',
  authenticate,
  FeeController.getInvoice,
);

router.post(
  '/invoices/:id/pay',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(recordPaymentSchema),
  FeeController.recordPayment,
);

// ─── Payments ────────────────────────────────────────────────────────────────

router.get(
  '/payments/:invoiceId',
  authenticate,
  FeeController.getPayments,
);

// ─── Student Balance ─────────────────────────────────────────────────────────

router.get(
  '/students/:studentId/balance',
  authenticate,
  FeeController.getStudentBalance,
);

// ─── Debit Orders ────────────────────────────────────────────────────────────

router.post(
  '/debit-orders',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createDebitOrderSchema),
  FeeController.createDebitOrder,
);

router.get(
  '/debit-orders/school/:schoolId',
  authenticate,
  FeeController.listDebitOrders,
);

router.get(
  '/debit-orders/:id',
  authenticate,
  FeeController.getDebitOrder,
);

router.patch(
  '/debit-orders/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateDebitOrderSchema),
  FeeController.updateDebitOrder,
);

router.delete(
  '/debit-orders/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.deleteDebitOrder,
);

export default router;
