import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Categories ─────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  schoolId: objectIdSchema,
  name: z.string().min(1, 'Name is required').trim(),
  code: z.string().min(1, 'Code is required').trim().toUpperCase(),
  parentId: objectIdSchema.nullable().optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
}).strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(1).trim().optional(),
  code: z.string().min(1).trim().toUpperCase().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
}).strict();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const seedCategoriesSchema = z.object({
  schoolId: objectIdSchema,
}).strict();

// ─── Budgets ────────────────────────────────────────────────────────────────

const lineItemSchema = z.object({
  categoryId: objectIdSchema,
  description: z.string().optional(),
  annualAmount: z.number().int().positive('Amount must be positive'),
  termAmounts: z.array(z.number().int()).length(4).optional(),
  notes: z.string().optional(),
}).strict();

export const createBudgetSchema = z.object({
  schoolId: objectIdSchema,
  year: z.number().int().min(2020, 'Year must be 2020 or later'),
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
}).strict();

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = z.object({
  name: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'approved', 'revised']).optional(),
  lineItems: z.array(lineItemSchema).min(1).optional(),
}).strict();

export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

// ─── Expenses ───────────────────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  schoolId: objectIdSchema,
  categoryId: objectIdSchema,
  budgetId: objectIdSchema.optional(),
  amount: z.number().int().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').trim(),
  vendor: z.string().trim().optional(),
  invoiceNumber: z.string().trim().optional(),
  invoiceDate: z.string().optional(),
  paymentMethod: z.enum(['cash', 'eft', 'card', 'debit_order', 'cheque', 'other']).optional(),
  receiptUrl: z.string().optional(),
  term: z.number().int().min(1).max(4).optional(),
  notes: z.string().optional(),
}).strict();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = z.object({
  categoryId: objectIdSchema.optional(),
  budgetId: objectIdSchema.optional(),
  amount: z.number().int().positive().optional(),
  description: z.string().min(1).trim().optional(),
  vendor: z.string().trim().optional(),
  invoiceNumber: z.string().trim().optional(),
  invoiceDate: z.string().optional(),
  paymentMethod: z.enum(['cash', 'eft', 'card', 'debit_order', 'cheque', 'other']).optional(),
  receiptUrl: z.string().optional(),
  term: z.number().int().min(1).max(4).optional(),
  notes: z.string().optional(),
}).strict();

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export const approveExpenseSchema = z.object({
  notes: z.string().optional(),
}).strict();

export const rejectExpenseSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
}).strict();

// ─── Query Schemas ──────────────────────────────────────────────────────────

export const expenseQuerySchema = z.object({
  schoolId: objectIdSchema.optional(),
  categoryId: objectIdSchema.optional(),
  budgetId: objectIdSchema.optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  term: z.coerce.number().int().min(1).max(4).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const varianceQuerySchema = z.object({
  schoolId: objectIdSchema.optional(),
  budgetId: objectIdSchema,
  term: z.coerce.number().int().min(1).max(4).optional(),
}).strict();

export const monthlyQuerySchema = z.object({
  schoolId: objectIdSchema.optional(),
  year: z.coerce.number().int().min(2020),
}).strict();

export const cashflowQuerySchema = z.object({
  schoolId: objectIdSchema.optional(),
  budgetId: objectIdSchema,
  months: z.coerce.number().int().min(1).max(24).default(6),
}).strict();

export const comparisonQuerySchema = z.object({
  schoolId: objectIdSchema.optional(),
  years: z.string().min(1, 'Years parameter is required'),
}).strict();

export const alertsQuerySchema = z.object({
  schoolId: objectIdSchema.optional(),
  budgetId: objectIdSchema,
}).strict();

// ─── Receipt Upload ────────────────────────────────────────────────────────

export const uploadReceiptBodySchema = z.object({
  expenseId: objectIdSchema.optional(),
}).strict();
