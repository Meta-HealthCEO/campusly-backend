import { z } from 'zod/v4';
import { FeeFrequency, InvoiceStatus } from '../../common/enums.js';
import { objectIdSchema } from '../../common/validation.js';

// ─── Fee Type ──────────────────────────────────────────────────────────────────

export const createFeeTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  schoolId: objectIdSchema,
  description: z.string().optional(),
  amount: z.int().positive('Amount must be a positive integer in cents'),
  frequency: z.enum(Object.values(FeeFrequency) as [string, ...string[]]),
  category: z.enum(['tuition', 'extramural', 'camp', 'uniform', 'transport', 'other']),
}).strict();

export const updateFeeTypeSchema = z.object({
  name: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  amount: z.int().positive('Amount must be a positive integer in cents').optional(),
  frequency: z.enum(Object.values(FeeFrequency) as [string, ...string[]]).optional(),
  category: z.enum(['tuition', 'extramural', 'camp', 'uniform', 'transport', 'other']).optional(),
  isActive: z.boolean().optional(),
}).strict();

// ─── Fee Schedule ──────────────────────────────────────────────────────────────

export const createFeeScheduleSchema = z.object({
  feeTypeId: objectIdSchema,
  schoolId: objectIdSchema,
  academicYear: z.int().min(2000).max(2100),
  term: z.int().min(1).max(4).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  appliesTo: z.object({
    type: z.enum(['school', 'grade', 'student']),
    targetId: objectIdSchema,
  }),
}).strict();

export const updateFeeScheduleSchema = z.object({
  academicYear: z.int().min(2000).max(2100).optional(),
  term: z.int().min(1).max(4).optional(),
  dueDate: z.string().optional(),
  appliesTo: z
    .object({
      type: z.enum(['school', 'grade', 'student']),
      targetId: objectIdSchema,
    })
    .optional(),
}).strict();

// ─── Invoice ───────────────────────────────────────────────────────────────────

export const createInvoiceSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  feeScheduleId: objectIdSchema,
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Description is required'),
        amount: z.int().positive('Amount must be a positive integer in cents'),
      }),
    )
    .min(1, 'At least one item is required'),
  dueDate: z.string().min(1, 'Due date is required'),
}).strict();

// ─── Payment ───────────────────────────────────────────────────────────────────

export const recordPaymentSchema = z.object({
  amount: z.int().positive('Amount must be a positive integer in cents'),
  paymentMethod: z.enum(['cash', 'eft', 'debit_order', 'card']),
  reference: z.string().optional(),
  notes: z.string().optional(),
}).strict();

// ─── Debit Order ───────────────────────────────────────────────────────────────

export const createDebitOrderSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  bankName: z.string().min(1, 'Bank name is required').trim(),
  accountNumber: z.string().min(1, 'Account number is required').trim(),
  branchCode: z.string().min(1, 'Branch code is required').trim(),
  accountHolder: z.string().min(1, 'Account holder is required').trim(),
  amount: z.int().positive('Amount must be a positive integer in cents'),
  dayOfMonth: z.int().min(1).max(31),
}).strict();

export const updateDebitOrderSchema = z.object({
  bankName: z.string().min(1).trim().optional(),
  accountNumber: z.string().min(1).trim().optional(),
  branchCode: z.string().min(1).trim().optional(),
  accountHolder: z.string().min(1).trim().optional(),
  amount: z.int().positive('Amount must be a positive integer in cents').optional(),
  dayOfMonth: z.int().min(1).max(31).optional(),
  isActive: z.boolean().optional(),
}).strict();

// ─── Credit Note ──────────────────────────────────────────────────────────────

export const createCreditNoteSchema = z.object({
  invoiceId: objectIdSchema,
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  amount: z.int().positive('Amount must be a positive integer in cents'),
  reason: z.string().min(1, 'Reason is required').trim(),
}).strict();

export const approveCreditNoteSchema = z.object({
  status: z.enum(['approved', 'rejected']),
}).strict();

// ─── Fee Exemption ────────────────────────────────────────────────────────────

export const createFeeExemptionSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  feeTypeId: objectIdSchema,
  exemptionType: z.enum(['full', 'partial', 'bursary', 'sibling_discount', 'staff_discount', 'early_payment']),
  discountPercentage: z.number().min(0).max(100).optional(),
  fixedAmount: z.int().positive().optional(),
  reason: z.string().min(1, 'Reason is required').trim(),
  validFrom: z.string().min(1, 'Valid from date is required'),
  validTo: z.string().min(1, 'Valid to date is required'),
}).strict();

// ─── Payment Arrangement ──────────────────────────────────────────────────────

export const createPaymentArrangementSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  totalOutstanding: z.int().positive('Total outstanding must be a positive integer in cents'),
  instalmentAmount: z.int().positive('Instalment amount must be a positive integer in cents'),
  numberOfInstalments: z.int().min(2, 'At least 2 instalments required').max(60),
  frequency: z.enum(['weekly', 'monthly']),
  startDate: z.string().min(1, 'Start date is required'),
}).strict();

// ─── Collection Action ────────────────────────────────────────────────────────

export const escalateCollectionSchema = z.object({
  invoiceId: objectIdSchema,
  stage: z.enum(['friendly_reminder', 'warning_letter', 'final_demand', 'legal_handover', 'write_off']),
  notes: z.string().optional(),
  sentVia: z.string().optional(),
}).strict();

// ─── Write Off ────────────────────────────────────────────────────────────────

export const writeOffDebtSchema = z.object({
  invoiceId: objectIdSchema,
  amount: z.int().positive('Amount must be a positive integer in cents'),
  reason: z.string().min(1, 'Reason is required').trim(),
}).strict();

// ─── Discount ─────────────────────────────────────────────────────────────────

export const applyDiscountSchema = z.object({
  invoiceId: objectIdSchema,
  amount: z.int().positive('Discount amount must be a positive integer in cents'),
  reason: z.string().min(1, 'Reason is required').trim(),
}).strict();

// ─── Bulk Invoice ─────────────────────────────────────────────────────────────

export const bulkInvoiceSchema = z.object({
  schoolId: objectIdSchema,
  feeScheduleId: objectIdSchema,
  studentIds: z.array(objectIdSchema).min(1, 'At least one student ID is required'),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Description is required'),
        amount: z.int().positive('Amount must be a positive integer in cents'),
      }),
    )
    .min(1, 'At least one item is required'),
  dueDate: z.string().min(1, 'Due date is required'),
}).strict();

// ─── Statement ────────────────────────────────────────────────────────────────

export const generateStatementSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
}).strict();

// ─── Inferred Types ────────────────────────────────────────────────────────────

export type CreateFeeTypeInput = z.infer<typeof createFeeTypeSchema>;
export type UpdateFeeTypeInput = z.infer<typeof updateFeeTypeSchema>;
export type CreateFeeScheduleInput = z.infer<typeof createFeeScheduleSchema>;
export type UpdateFeeScheduleInput = z.infer<typeof updateFeeScheduleSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type CreateDebitOrderInput = z.infer<typeof createDebitOrderSchema>;
export type UpdateDebitOrderInput = z.infer<typeof updateDebitOrderSchema>;
export type CreateCreditNoteInput = z.infer<typeof createCreditNoteSchema>;
export type ApproveCreditNoteInput = z.infer<typeof approveCreditNoteSchema>;
export type CreateFeeExemptionInput = z.infer<typeof createFeeExemptionSchema>;
export type CreatePaymentArrangementInput = z.infer<typeof createPaymentArrangementSchema>;
export type EscalateCollectionInput = z.infer<typeof escalateCollectionSchema>;
export type WriteOffDebtInput = z.infer<typeof writeOffDebtSchema>;
export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>;
export type BulkInvoiceInput = z.infer<typeof bulkInvoiceSchema>;
export type GenerateStatementInput = z.infer<typeof generateStatementSchema>;
