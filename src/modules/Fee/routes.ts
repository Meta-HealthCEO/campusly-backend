import { Router } from 'express';
import { authenticate, authorize, validate, requireParentOwnership, validateSchoolScope } from '../../middleware/index.js';
import { requireCapability } from '../../middleware/capability.js';
import { FeeController } from './controller.js';
import { FeeExportController } from './export.controller.js';
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

// ─── CSV Exports ────────────────────────────────────────────────────────────

router.get(
  '/export/invoices',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeExportController.exportInvoices,
);

router.get(
  '/export/debtors',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeExportController.exportDebtors,
);

// ─── Fee Types ───────────────────────────────────────────────────────────────

router.post(
  '/types',
  authenticate,
  requireCapability('manage_fees'),
  validate(createFeeTypeSchema),
  FeeController.createFeeType,
);

router.get(
  '/types/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  validateSchoolScope(),
  FeeController.listFeeTypes,
);

router.get(
  '/types/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  FeeController.getFeeType,
);

router.patch(
  '/types/:id',
  authenticate,
  requireCapability('manage_fees'),
  validate(updateFeeTypeSchema),
  FeeController.updateFeeType,
);

router.delete(
  '/types/:id',
  authenticate,
  requireCapability('manage_fees'),
  FeeController.deleteFeeType,
);

// ─── Fee Schedules ───────────────────────────────────────────────────────────

router.post(
  '/schedules',
  authenticate,
  requireCapability('manage_fees'),
  validate(createFeeScheduleSchema),
  FeeController.createFeeSchedule,
);

router.get(
  '/schedules/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  validateSchoolScope(),
  FeeController.listFeeSchedules,
);

router.get(
  '/schedules/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  FeeController.getFeeSchedule,
);

router.patch(
  '/schedules/:id',
  authenticate,
  requireCapability('manage_fees'),
  validate(updateFeeScheduleSchema),
  FeeController.updateFeeSchedule,
);

router.delete(
  '/schedules/:id',
  authenticate,
  requireCapability('manage_fees'),
  FeeController.deleteFeeSchedule,
);

// ─── Invoices ────────────────────────────────────────────────────────────────

router.post(
  '/invoices',
  authenticate,
  requireCapability('manage_fees'),
  validate(createInvoiceSchema),
  FeeController.createInvoice,
);

router.get(
  '/invoices/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  validateSchoolScope(),
  FeeController.listInvoices,
);

router.get(
  '/invoices/school/:schoolId/overdue',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validateSchoolScope(),
  FeeController.getOverdueInvoices,
);

router.get(
  '/invoices/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  FeeController.getInvoice,
);

router.post(
  '/invoices/:id/pay',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  validate(recordPaymentSchema),
  FeeController.recordPayment,
);

// ─── Payments ────────────────────────────────────────────────────────────────

router.get(
  '/payments/:invoiceId',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  FeeController.getPayments,
);

// ─── Student Balance ─────────────────────────────────────────────────────────

router.get(
  '/students/:studentId/balance',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  requireParentOwnership('studentId'),
  FeeController.getStudentBalance,
);

// ─── Debit Orders ────────────────────────────────────────────────────────────

router.post(
  '/debit-orders',
  authenticate,
  requireCapability('manage_fees'),
  validate(createDebitOrderSchema),
  FeeController.createDebitOrder,
);

router.get(
  '/debit-orders/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validateSchoolScope(),
  FeeController.listDebitOrders,
);

router.get(
  '/debit-orders/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FeeController.getDebitOrder,
);

router.patch(
  '/debit-orders/:id',
  authenticate,
  requireCapability('manage_fees'),
  validate(updateDebitOrderSchema),
  FeeController.updateDebitOrder,
);

router.delete(
  '/debit-orders/:id',
  authenticate,
  requireCapability('manage_fees'),
  FeeController.deleteDebitOrder,
);

// ─── Debtors Report ─────────────────────────────────────────────────────────

router.get(
  '/debtors/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validateSchoolScope(),
  FeeController.getDebtorsReport,
);

// ─── Collections ────────────────────────────────────────────────────────────

router.post(
  '/collections/escalate',
  authenticate,
  requireCapability('manage_fees'),
  validate(escalateCollectionSchema),
  FeeController.escalateCollection,
);

router.get(
  '/collections/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validateSchoolScope(),
  FeeController.listCollectionActions,
);

// ─── Statements ─────────────────────────────────────────────────────────────

router.post(
  '/statements',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  validate(generateStatementSchema),
  FeeController.generateStatement,
);

// ─── Late Fees ──────────────────────────────────────────────────────────────

router.post(
  '/late-fees/school/:schoolId',
  authenticate,
  requireCapability('manage_fees'),
  validateSchoolScope(),
  FeeController.calculateLateFees,
);

// ─── Allocate Payment ───────────────────────────────────────────────────────

router.post(
  '/allocate-payment/student/:studentId',
  authenticate,
  requireCapability('manage_fees'),
  validate(recordPaymentSchema),
  FeeController.allocatePayment,
);

// ─── Payment Arrangements ───────────────────────────────────────────────────

router.post(
  '/payment-arrangements',
  authenticate,
  requireCapability('manage_fees'),
  validate(createPaymentArrangementSchema),
  FeeController.createPaymentArrangement,
);

router.get(
  '/payment-arrangements/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validateSchoolScope(),
  FeeController.listPaymentArrangements,
);

// ─── Write Off ──────────────────────────────────────────────────────────────

router.post(
  '/write-off',
  authenticate,
  requireCapability('manage_fees'),
  validate(writeOffDebtSchema),
  FeeController.writeOffDebt,
);

// ─── Discount ───────────────────────────────────────────────────────────────

router.post(
  '/discount',
  authenticate,
  requireCapability('manage_fees'),
  validate(applyDiscountSchema),
  FeeController.applyDiscount,
);

// ─── Parent Account Balance ─────────────────────────────────────────────────

router.get(
  '/parents/:parentId/school/:schoolId/balance',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  validateSchoolScope(),
  FeeController.getParentAccountBalance,
);

// ─── Bulk Invoice ───────────────────────────────────────────────────────────

router.post(
  '/invoices/bulk',
  authenticate,
  requireCapability('manage_fees'),
  validate(bulkInvoiceSchema),
  FeeController.bulkInvoiceGeneration,
);

// ─── Credit Notes ───────────────────────────────────────────────────────────

router.post(
  '/credit-notes',
  authenticate,
  requireCapability('manage_fees'),
  validate(createCreditNoteSchema),
  FeeController.createCreditNote,
);

router.patch(
  '/credit-notes/:id/approve',
  authenticate,
  requireCapability('manage_fees'),
  validate(approveCreditNoteSchema),
  FeeController.approveCreditNote,
);

router.get(
  '/credit-notes/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validateSchoolScope(),
  FeeController.listCreditNotes,
);

// ─── Fee Exemptions ─────────────────────────────────────────────────────────

router.post(
  '/exemptions',
  authenticate,
  requireCapability('manage_fees'),
  validate(createFeeExemptionSchema),
  FeeController.createFeeExemption,
);

router.get(
  '/exemptions/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validateSchoolScope(),
  FeeController.listFeeExemptions,
);

// ─── Account Ledger ─────────────────────────────────────────────────────────

router.get(
  '/ledger/student/:studentId/school/:schoolId',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  validateSchoolScope(),
  requireParentOwnership('studentId'),
  FeeController.getAccountLedger,
);

export default router;
