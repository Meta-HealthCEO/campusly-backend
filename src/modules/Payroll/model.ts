import mongoose, { Schema } from 'mongoose';
import type { Document, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const PAYROLL_RUN_STATUSES = ['draft', 'reviewed', 'approved', 'processed'] as const;
export type PayrollRunStatus = (typeof PAYROLL_RUN_STATUSES)[number];

export const ACCOUNT_TYPES = ['cheque', 'savings', 'transmission'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const CERTIFICATE_TYPES = ['IRP5', 'IT3a'] as const;
export type CertificateType = (typeof CERTIFICATE_TYPES)[number];

export const CERTIFICATE_STATUSES = ['generated', 'issued', 'amended'] as const;
export type CertificateStatus = (typeof CERTIFICATE_STATUSES)[number];

export const ADJUSTMENT_TYPES = ['addition', 'deduction'] as const;
export type AdjustmentType = (typeof ADJUSTMENT_TYPES)[number];

// ─── TaxTable ─────────────────────────────────────────────────────────────────

export interface ITaxBracket {
  from: number;
  to: number | null;
  rate: number;
  baseAmount: number;
}

export interface ITaxTable extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  taxYear: number;
  brackets: ITaxBracket[];
  rebates: { primary: number; secondary: number; tertiary: number };
  taxThresholds: { under65: number; age65to74: number; age75plus: number };
  uifRate: number;
  uifCeiling: number;
  sdlRate: number;
  medicalCredits: { main: number; firstDependant: number; additionalDependant: number };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taxBracketSchema = new Schema<ITaxBracket>(
  {
    from: { type: Number, required: true },
    to: { type: Number, default: null },
    rate: { type: Number, required: true },
    baseAmount: { type: Number, required: true },
  },
  { _id: false },
);

const taxTableSchema = new Schema<ITaxTable>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    taxYear: { type: Number, required: true },
    brackets: { type: [taxBracketSchema], required: true },
    rebates: {
      primary: { type: Number, required: true },
      secondary: { type: Number, required: true },
      tertiary: { type: Number, required: true },
    },
    taxThresholds: {
      under65: { type: Number, required: true },
      age65to74: { type: Number, required: true },
      age75plus: { type: Number, required: true },
    },
    uifRate: { type: Number, required: true },
    uifCeiling: { type: Number, required: true },
    sdlRate: { type: Number, required: true },
    medicalCredits: {
      main: { type: Number, required: true },
      firstDependant: { type: Number, required: true },
      additionalDependant: { type: Number, required: true },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

taxTableSchema.index({ schoolId: 1, taxYear: 1 }, { unique: true });

export const TaxTable = mongoose.model<ITaxTable>('TaxTable', taxTableSchema);

// ─── SalaryRecord ─────────────────────────────────────────────────────────────

export interface IAllowance {
  name: string;
  amount: number;
  taxable: boolean;
}

export interface IDeduction {
  name: string;
  amount: number;
  preTax: boolean;
}

export interface IBankDetails {
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: AccountType;
}

export interface ISalaryRecord extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  staffId: Types.ObjectId;
  basicSalary: number;
  allowances: IAllowance[];
  deductions: IDeduction[];
  bankDetails: IBankDetails;
  taxNumber: string | null;
  uifNumber: string | null;
  dateOfBirth: Date;
  startDate: Date;
  department: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const allowanceSchema = new Schema<IAllowance>(
  { name: { type: String, required: true }, amount: { type: Number, required: true }, taxable: { type: Boolean, required: true } },
  { _id: false },
);

const deductionSchema = new Schema<IDeduction>(
  { name: { type: String, required: true }, amount: { type: Number, required: true }, preTax: { type: Boolean, required: true } },
  { _id: false },
);

const bankDetailsSchema = new Schema<IBankDetails>(
  {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    branchCode: { type: String, required: true },
    accountType: { type: String, enum: ACCOUNT_TYPES, required: true },
  },
  { _id: false },
);

const salaryRecordSchema = new Schema<ISalaryRecord>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: [allowanceSchema], default: [] },
    deductions: { type: [deductionSchema], default: [] },
    bankDetails: { type: bankDetailsSchema, required: true },
    taxNumber: { type: String, default: null },
    uifNumber: { type: String, default: null },
    dateOfBirth: { type: Date, required: true },
    startDate: { type: Date, required: true },
    department: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

salaryRecordSchema.index({ schoolId: 1, staffId: 1 }, { unique: true });
salaryRecordSchema.index({ schoolId: 1, department: 1 });
salaryRecordSchema.index({ schoolId: 1, isActive: 1 });

export const SalaryRecord = mongoose.model<ISalaryRecord>('SalaryRecord', salaryRecordSchema);

// ─── SalaryHistory ────────────────────────────────────────────────────────────

export interface ISalaryHistory extends Document {
  _id: Types.ObjectId;
  salaryRecordId: Types.ObjectId;
  changedBy: Types.ObjectId;
  changedAt: Date;
  field: string;
  previousValue: unknown;
  newValue: unknown;
  reason: string | null;
  isDeleted: boolean;
}

const salaryHistorySchema = new Schema<ISalaryHistory>(
  {
    salaryRecordId: { type: Schema.Types.ObjectId, ref: 'SalaryRecord', required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, required: true },
    field: { type: String, required: true },
    previousValue: { type: Schema.Types.Mixed, required: true },
    newValue: { type: Schema.Types.Mixed, required: true },
    reason: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: false },
);

salaryHistorySchema.index({ salaryRecordId: 1, changedAt: -1 });

export const SalaryHistory = mongoose.model<ISalaryHistory>('SalaryHistory', salaryHistorySchema);
