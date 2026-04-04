import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Tax Table ────────────────────────────────────────────────────────────────

const taxBracketSchema = z.object({
  from: z.number().int().min(0),
  to: z.number().int().min(0).nullable(),
  rate: z.number().min(0).max(100),
  baseAmount: z.number().int().min(0),
}).strict();

export const createTaxTableSchema = z.object({
  taxYear: z.number().int().min(2020),
  brackets: z.array(taxBracketSchema).min(1),
  rebates: z.object({
    primary: z.number().int().min(0),
    secondary: z.number().int().min(0),
    tertiary: z.number().int().min(0),
  }).strict(),
  taxThresholds: z.object({
    under65: z.number().int().min(0),
    age65to74: z.number().int().min(0),
    age75plus: z.number().int().min(0),
  }).strict(),
  uifRate: z.number().min(0).max(10),
  uifCeiling: z.number().int().min(0),
  sdlRate: z.number().min(0).max(10),
  medicalCredits: z.object({
    main: z.number().int().min(0),
    firstDependant: z.number().int().min(0),
    additionalDependant: z.number().int().min(0),
  }).strict(),
}).strict();

export type CreateTaxTableInput = z.infer<typeof createTaxTableSchema>;

export const getTaxTableSchema = z.object({
  taxYear: z.coerce.number().int().min(2020).optional(),
}).strict();

// ─── Salary Record ────────────────────────────────────────────────────────────

const allowanceSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().int().positive(),
  taxable: z.boolean(),
}).strict();

const deductionItemSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().int().positive(),
  preTax: z.boolean(),
}).strict();

const bankDetailsSchema = z.object({
  bankName: z.string().min(1).max(100),
  accountNumber: z.string().min(5).max(20),
  branchCode: z.string().min(3).max(10),
  accountType: z.enum(['cheque', 'savings', 'transmission']),
}).strict();

export const createSalarySchema = z.object({
  staffId: objectIdSchema,
  basicSalary: z.number().int().positive(),
  allowances: z.array(allowanceSchema).optional().default([]),
  deductions: z.array(deductionItemSchema).optional().default([]),
  bankDetails: bankDetailsSchema,
  taxNumber: z.string().regex(/^\d{10}$/).nullable().optional(),
  uifNumber: z.string().max(20).nullable().optional(),
  dateOfBirth: z.string().date(),
  startDate: z.string().date(),
  department: z.string().max(100).nullable().optional(),
}).strict();

export type CreateSalaryInput = z.infer<typeof createSalarySchema>;

export const updateSalarySchema = z.object({
  basicSalary: z.number().int().positive().optional(),
  allowances: z.array(allowanceSchema).optional(),
  deductions: z.array(deductionItemSchema).optional(),
  bankDetails: bankDetailsSchema.optional(),
  taxNumber: z.string().regex(/^\d{10}$/).nullable().optional(),
  uifNumber: z.string().max(20).nullable().optional(),
  dateOfBirth: z.string().date().optional(),
  startDate: z.string().date().optional(),
  department: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
  reason: z.string().max(500).optional(),
}).strict();

export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>;

export const listSalariesSchema = z.object({
  department: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
}).strict();

// ─── Payroll Run ──────────────────────────────────────────────────────────────

export const createPayrollRunSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  description: z.string().max(200).nullable().optional(),
}).strict();

export type CreatePayrollRunInput = z.infer<typeof createPayrollRunSchema>;

export const listRunsSchema = z.object({
  year: z.coerce.number().int().min(2020).optional(),
  status: z.enum(['draft', 'reviewed', 'approved', 'processed']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
}).strict();

export const reviewRunSchema = z.object({
  reviewNotes: z.string().max(1000).optional(),
}).strict();

export type ReviewRunInput = z.infer<typeof reviewRunSchema>;

const adjustmentSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().int().positive(),
  type: z.enum(['addition', 'deduction']),
}).strict();

export const adjustItemSchema = z.object({
  adjustments: z.array(adjustmentSchema).min(1),
}).strict();

export type AdjustItemInput = z.infer<typeof adjustItemSchema>;

// ─── Tax Certificates ─────────────────────────────────────────────────────────

export const generateCertificatesSchema = z.object({
  taxYear: z.number().int().min(2020),
  certificateType: z.enum(['IRP5', 'IT3a']),
}).strict();

export type GenerateCertificatesInput = z.infer<typeof generateCertificatesSchema>;

// ─── Reports ──────────────────────────────────────────────────────────────────

export const ctcReportSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020),
}).strict();

// ─── Bank File ────────────────────────────────────────────────────────────────

export const bankFileSchema = z.object({
  format: z.enum(['acb', 'csv']).optional().default('csv'),
}).strict();
