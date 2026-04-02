import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Accounting Config ───────────────────────────────────────────────────────

export type AccountingProvider = 'sage_one' | 'xero' | 'quickbooks' | 'pastel' | 'none';
export type VatCode = 'standard' | 'zero_rated' | 'exempt';
export type SyncFrequency = 'manual' | 'daily' | 'weekly';

export interface IGLMapping {
  feeCategory: string;
  accountCode: string;
  accountName: string;
  vatCode: VatCode;
}

export interface IBankMapping {
  paymentMethod: string;
  bankAccountCode: string;
  bankAccountName: string;
}

export interface IAccountingConfig extends Document {
  schoolId: Types.ObjectId;
  provider: AccountingProvider;
  vatRegistered: boolean;
  vatNumber?: string;
  glMapping: IGLMapping[];
  bankMapping: IBankMapping[];
  syncFrequency: SyncFrequency;
  lastExportAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountingConfigSchema = new Schema<IAccountingConfig>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ['sage_one', 'xero', 'quickbooks', 'pastel', 'none'],
      default: 'none',
    },
    vatRegistered: {
      type: Boolean,
      default: false,
    },
    vatNumber: {
      type: String,
    },
    glMapping: [
      {
        feeCategory: { type: String, required: true },
        accountCode: { type: String, required: true },
        accountName: { type: String, required: true },
        vatCode: {
          type: String,
          enum: ['standard', 'zero_rated', 'exempt'],
          default: 'zero_rated',
        },
        _id: false,
      },
    ],
    bankMapping: [
      {
        paymentMethod: { type: String, required: true },
        bankAccountCode: { type: String, required: true },
        bankAccountName: { type: String, required: true },
        _id: false,
      },
    ],
    syncFrequency: {
      type: String,
      enum: ['manual', 'daily', 'weekly'],
      default: 'manual',
    },
    lastExportAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const AccountingConfig = mongoose.model<IAccountingConfig>(
  'AccountingConfig',
  accountingConfigSchema,
);

// ─── Accounting Export ───────────────────────────────────────────────────────

export type ExportFormat = 'csv' | 'sage_csv' | 'xero_csv' | 'pastel_csv' | 'quickbooks_iif';
export type ExportStatus = 'generating' | 'ready' | 'failed';

export interface IAccountingExport extends Document {
  schoolId: Types.ObjectId;
  exportedBy: Types.ObjectId;
  format: ExportFormat;
  dateRange: { from: Date; to: Date };
  recordCount: number;
  fileName: string;
  status: ExportStatus;
  downloadUrl?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountingExportSchema = new Schema<IAccountingExport>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    exportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    format: {
      type: String,
      enum: ['csv', 'sage_csv', 'xero_csv', 'pastel_csv', 'quickbooks_iif'],
      required: true,
    },
    dateRange: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    recordCount: {
      type: Number,
      default: 0,
    },
    fileName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['generating', 'ready', 'failed'],
      default: 'generating',
    },
    downloadUrl: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

accountingExportSchema.index({ schoolId: 1, createdAt: -1 });

export const AccountingExport = mongoose.model<IAccountingExport>(
  'AccountingExport',
  accountingExportSchema,
);
