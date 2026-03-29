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
  createCreditNoteSchema,
  approveCreditNoteSchema,
  createFeeExemptionSchema,
  createPaymentArrangementSchema,
  escalateCollectionSchema,
  writeOffDebtSchema,
  applyDiscountSchema,
  bulkInvoiceSchema,
  generateStatementSchema,
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

// ─── Debtors Report ─────────────────────────────────────────────────────────

router.get(
  '/debtors/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.getDebtorsReport,
);

// ─── Collections ────────────────────────────────────────────────────────────

router.post(
  '/collections/escalate',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(escalateCollectionSchema),
  FeeController.escalateCollection,
);

router.get(
  '/collections/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.listCollectionActions,
);

// ─── Statements ─────────────────────────────────────────────────────────────

router.post(
  '/statements',
  authenticate,
  validate(generateStatementSchema),
  FeeController.generateStatement,
);

// ─── Late Fees ──────────────────────────────────────────────────────────────

router.post(
  '/late-fees/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.calculateLateFees,
);

// ─── Allocate Payment ───────────────────────────────────────────────────────

router.post(
  '/allocate-payment/student/:studentId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(recordPaymentSchema),
  FeeController.allocatePayment,
);

// ─── Payment Arrangements ───────────────────────────────────────────────────

router.post(
  '/payment-arrangements',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createPaymentArrangementSchema),
  FeeController.createPaymentArrangement,
);

router.get(
  '/payment-arrangements/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.listPaymentArrangements,
);

// ─── Write Off ──────────────────────────────────────────────────────────────

router.post(
  '/write-off',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(writeOffDebtSchema),
  FeeController.writeOffDebt,
);

// ─── Discount ───────────────────────────────────────────────────────────────

router.post(
  '/discount',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(applyDiscountSchema),
  FeeController.applyDiscount,
);

// ─── Parent Account Balance ─────────────────────────────────────────────────

router.get(
  '/parents/:parentId/school/:schoolId/balance',
  authenticate,
  FeeController.getParentAccountBalance,
);

// ─── Bulk Invoice ───────────────────────────────────────────────────────────

router.post(
  '/invoices/bulk',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(bulkInvoiceSchema),
  FeeController.bulkInvoiceGeneration,
);

// ─── Credit Notes ───────────────────────────────────────────────────────────

router.post(
  '/credit-notes',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createCreditNoteSchema),
  FeeController.createCreditNote,
);

router.patch(
  '/credit-notes/:id/approve',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(approveCreditNoteSchema),
  FeeController.approveCreditNote,
);

router.get(
  '/credit-notes/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.listCreditNotes,
);

// ─── Fee Exemptions ─────────────────────────────────────────────────────────

router.post(
  '/exemptions',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createFeeExemptionSchema),
  FeeController.createFeeExemption,
);

router.get(
  '/exemptions/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.listFeeExemptions,
);

// ─── Account Ledger ─────────────────────────────────────────────────────────

router.get(
  '/ledger/student/:studentId/school/:schoolId',
  authenticate,
  FeeController.getAccountLedger,
);

export default router;
