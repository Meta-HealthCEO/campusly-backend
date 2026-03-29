import mongoose, { Schema, Document, Types } from 'mongoose';
import { FeeFrequency, InvoiceStatus } from '../../common/enums.js';

// ─── Fee Type ──────────────────────────────────────────────────────────────────

export type FeeCategory = 'tuition' | 'extramural' | 'camp' | 'uniform' | 'transport' | 'other';

export interface IFeeType extends Document {
  name: string;
  schoolId: Types.ObjectId;
  description?: string;
  amount: number;
  frequency: FeeFrequency;
  category: FeeCategory;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const feeTypeSchema = new Schema<IFeeType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    description: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    frequency: {
      type: String,
      enum: Object.values(FeeFrequency),
      required: true,
    },
    category: {
      type: String,
      enum: ['tuition', 'extramural', 'camp', 'uniform', 'transport', 'other'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

feeTypeSchema.index({ schoolId: 1, category: 1 });

export const FeeType = mongoose.model<IFeeType>('FeeType', feeTypeSchema);

// ─── Fee Schedule ──────────────────────────────────────────────────────────────

export interface IFeeScheduleAppliesTo {
  type: 'school' | 'grade' | 'student';
  targetId: Types.ObjectId;
}

export interface IFeeSchedule extends Document {
  feeTypeId: Types.ObjectId;
  schoolId: Types.ObjectId;
  academicYear: number;
  term?: number;
  dueDate: Date;
  appliesTo: IFeeScheduleAppliesTo;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const feeScheduleSchema = new Schema<IFeeSchedule>(
  {
    feeTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'FeeType',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    academicYear: {
      type: Number,
      required: true,
    },
    term: {
      type: Number,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    appliesTo: {
      type: {
        type: String,
        enum: ['school', 'grade', 'student'],
        required: true,
      },
      targetId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

feeScheduleSchema.index({ schoolId: 1, academicYear: 1 });

export const FeeSchedule = mongoose.model<IFeeSchedule>('FeeSchedule', feeScheduleSchema);

// ─── Invoice ───────────────────────────────────────────────────────────────────

export interface IInvoiceItem {
  description: string;
  amount: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  feeScheduleId: Types.ObjectId;
  items: IInvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  receiptNumber?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    feeScheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'FeeSchedule',
      required: true,
    },
    items: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        _id: false,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.PENDING,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    receiptNumber: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

invoiceSchema.index({ studentId: 1, status: 1 });
invoiceSchema.index({ schoolId: 1, status: 1 });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

// ─── Payment ───────────────────────────────────────────────────────────────────

export type FeePaymentMethod = 'cash' | 'eft' | 'debit_order' | 'card' | 'snapscan' | 'wallet';

export interface IPayment extends Document {
  invoiceId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  amount: number;
  paymentMethod: FeePaymentMethod;
  reference?: string;
  notes?: string;
  recordedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'eft', 'debit_order', 'card', 'snapscan', 'wallet'],
      required: true,
    },
    reference: {
      type: String,
    },
    notes: {
      type: String,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ studentId: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

// ─── Debit Order ───────────────────────────────────────────────────────────────

export interface IDebitOrder extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountHolder: string;
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const debitOrderSchema = new Schema<IDebitOrder>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    branchCode: {
      type: String,
      required: true,
      trim: true,
    },
    accountHolder: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dayOfMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

debitOrderSchema.index({ studentId: 1 });
debitOrderSchema.index({ schoolId: 1, isActive: 1 });

export const DebitOrder = mongoose.model<IDebitOrder>('DebitOrder', debitOrderSchema);
