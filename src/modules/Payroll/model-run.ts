import mongoose, { Schema } from 'mongoose';
import type { Document, Types } from 'mongoose';
import {
  PAYROLL_RUN_STATUSES,
  ADJUSTMENT_TYPES,
  CERTIFICATE_TYPES,
  CERTIFICATE_STATUSES,
} from './model.js';
import type { PayrollRunStatus, AdjustmentType, CertificateType, CertificateStatus } from './model.js';

// ─── PayrollRun ───────────────────────────────────────────────────────────────

export interface IAdjustment {
  name: string;
  amount: number;
  type: AdjustmentType;
}

export interface IPayrollItem {
  _id?: Types.ObjectId;
  staffId: Types.ObjectId;
  salaryRecordId: Types.ObjectId;
  basicSalary: number;
  allowances: number;
  grossPay: number;
  unpaidLeaveDays: number;
  leaveDeduction: number;
  preTaxDeductions: number;
  taxableIncome: number;
  paye: number;
  uifEmployee: number;
  uifEmployer: number;
  sdl: number;
  postTaxDeductions: number;
  adjustments: IAdjustment[];
  netPay: number;
}

export interface IPayrollTotals {
  grossPay: number;
  totalPAYE: number;
  totalUIF: number;
  totalUIFEmployer: number;
  totalSDL: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
}

export interface IPayrollRun extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  month: number;
  year: number;
  description: string | null;
  status: PayrollRunStatus;
  totals: IPayrollTotals;
  items: IPayrollItem[];
  reviewedBy: Types.ObjectId | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  approvedBy: Types.ObjectId | null;
  approvedAt: Date | null;
  processedBy: Types.ObjectId | null;
  processedAt: Date | null;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adjustmentSchema = new Schema<IAdjustment>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ADJUSTMENT_TYPES, required: true },
  },
  { _id: false },
);

const payrollItemSchema = new Schema<IPayrollItem>(
  {
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    salaryRecordId: { type: Schema.Types.ObjectId, ref: 'SalaryRecord', required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, required: true },
    grossPay: { type: Number, required: true },
    unpaidLeaveDays: { type: Number, default: 0 },
    leaveDeduction: { type: Number, default: 0 },
    preTaxDeductions: { type: Number, default: 0 },
    taxableIncome: { type: Number, required: true },
    paye: { type: Number, required: true },
    uifEmployee: { type: Number, required: true },
    uifEmployer: { type: Number, required: true },
    sdl: { type: Number, required: true },
    postTaxDeductions: { type: Number, default: 0 },
    adjustments: { type: [adjustmentSchema], default: [] },
    netPay: { type: Number, required: true },
  },
);

const payrollTotalsSchema = new Schema<IPayrollTotals>(
  {
    grossPay: { type: Number, required: true },
    totalPAYE: { type: Number, required: true },
    totalUIF: { type: Number, required: true },
    totalUIFEmployer: { type: Number, required: true },
    totalSDL: { type: Number, required: true },
    totalDeductions: { type: Number, required: true },
    totalNetPay: { type: Number, required: true },
    employeeCount: { type: Number, required: true },
  },
  { _id: false },
);

const payrollRunSchema = new Schema<IPayrollRun>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2020 },
    description: { type: String, default: null },
    status: { type: String, enum: PAYROLL_RUN_STATUSES, default: 'draft' },
    totals: { type: payrollTotalsSchema, required: true },
    items: { type: [payrollItemSchema], default: [] },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNotes: { type: String, default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    processedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

payrollRunSchema.index({ schoolId: 1, year: 1, month: 1 }, { unique: true });
payrollRunSchema.index({ schoolId: 1, status: 1 });

export const PayrollRun = mongoose.model<IPayrollRun>('PayrollRun', payrollRunSchema);

// ─── TaxCertificate ───────────────────────────────────────────────────────────

export interface ITaxCertificate extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  staffId: Types.ObjectId;
  taxYear: number;
  certificateType: CertificateType;
  certificateNumber: string;
  totalIncome: number;
  totalPAYE: number;
  totalUIF: number;
  totalDeductions: number;
  status: CertificateStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taxCertificateSchema = new Schema<ITaxCertificate>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taxYear: { type: Number, required: true },
    certificateType: { type: String, enum: CERTIFICATE_TYPES, required: true },
    certificateNumber: { type: String, required: true },
    totalIncome: { type: Number, required: true },
    totalPAYE: { type: Number, required: true },
    totalUIF: { type: Number, required: true },
    totalDeductions: { type: Number, required: true },
    status: { type: String, enum: CERTIFICATE_STATUSES, default: 'generated' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

taxCertificateSchema.index({ schoolId: 1, taxYear: 1, staffId: 1 }, { unique: true });
taxCertificateSchema.index({ certificateNumber: 1 }, { unique: true });

export const PayrollTaxCertificate = mongoose.model<ITaxCertificate>('PayrollTaxCertificate', taxCertificateSchema);
