import { z } from 'zod/v4';
import { FeeFrequency, InvoiceStatus } from '../../common/enums.js';

// ─── Fee Type ──────────────────────────────────────────────────────────────────

export const createFeeTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  schoolId: z.string().min(1, 'School ID is required'),
  description: z.string().optional(),
  amount: z.int().positive('Amount must be a positive integer in cents'),
  frequency: z.enum(Object.values(FeeFrequency) as [string, ...string[]]),
  category: z.enum(['tuition', 'extramural', 'camp', 'uniform', 'transport', 'other']),
});

export const updateFeeTypeSchema = z.object({
  name: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  amount: z.int().positive('Amount must be a positive integer in cents').optional(),
  frequency: z.enum(Object.values(FeeFrequency) as [string, ...string[]]).optional(),
  category: z.enum(['tuition', 'extramural', 'camp', 'uniform', 'transport', 'other']).optional(),
  isActive: z.boolean().optional(),
});

// ─── Fee Schedule ──────────────────────────────────────────────────────────────

export const createFeeScheduleSchema = z.object({
  feeTypeId: z.string().min(1, 'Fee type ID is required'),
  schoolId: z.string().min(1, 'School ID is required'),
  academicYear: z.int().min(2000).max(2100),
  term: z.int().min(1).max(4).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  appliesTo: z.object({
    type: z.enum(['school', 'grade', 'student']),
    targetId: z.string().min(1, 'Target ID is required'),
  }),
});

export const updateFeeScheduleSchema = z.object({
  academicYear: z.int().min(2000).max(2100).optional(),
  term: z.int().min(1).max(4).optional(),
  dueDate: z.string().optional(),
  appliesTo: z
    .object({
      type: z.enum(['school', 'grade', 'student']),
      targetId: z.string().min(1),
    })
    .optional(),
});

// ─── Invoice ───────────────────────────────────────────────────────────────────

export const createInvoiceSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  schoolId: z.string().min(1, 'School ID is required'),
  feeScheduleId: z.string().min(1, 'Fee schedule ID is required'),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Description is required'),
        amount: z.int().positive('Amount must be a positive integer in cents'),
      }),
    )
    .min(1, 'At least one item is required'),
  dueDate: z.string().min(1, 'Due date is required'),
});

// ─── Payment ───────────────────────────────────────────────────────────────────

export const recordPaymentSchema = z.object({
  amount: z.int().positive('Amount must be a positive integer in cents'),
  paymentMethod: z.enum(['cash', 'eft', 'debit_order', 'card']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Debit Order ───────────────────────────────────────────────────────────────

export const createDebitOrderSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  schoolId: z.string().min(1, 'School ID is required'),
  bankName: z.string().min(1, 'Bank name is required').trim(),
  accountNumber: z.string().min(1, 'Account number is required').trim(),
  branchCode: z.string().min(1, 'Branch code is required').trim(),
  accountHolder: z.string().min(1, 'Account holder is required').trim(),
  amount: z.int().positive('Amount must be a positive integer in cents'),
  dayOfMonth: z.int().min(1).max(31),
});

export const updateDebitOrderSchema = z.object({
  bankName: z.string().min(1).trim().optional(),
  accountNumber: z.string().min(1).trim().optional(),
  branchCode: z.string().min(1).trim().optional(),
  accountHolder: z.string().min(1).trim().optional(),
  amount: z.int().positive('Amount must be a positive integer in cents').optional(),
  dayOfMonth: z.int().min(1).max(31).optional(),
  isActive: z.boolean().optional(),
});

// ─── Inferred Types ────────────────────────────────────────────────────────────

export type CreateFeeTypeInput = z.infer<typeof createFeeTypeSchema>;
export type UpdateFeeTypeInput = z.infer<typeof updateFeeTypeSchema>;
export type CreateFeeScheduleInput = z.infer<typeof createFeeScheduleSchema>;
export type UpdateFeeScheduleInput = z.infer<typeof updateFeeScheduleSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type CreateDebitOrderInput = z.infer<typeof createDebitOrderSchema>;
export type UpdateDebitOrderInput = z.infer<typeof updateDebitOrderSchema>;
