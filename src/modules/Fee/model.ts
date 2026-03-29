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

export type CollectionStage = 'friendly_reminder' | 'warning_letter' | 'final_demand' | 'legal_handover' | 'write_off';

export interface IInvoice extends Document {
  invoiceNumber: string;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  feeScheduleId: Types.ObjectId;
  items: IInvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  lateFeeAmount: number;
  discountAmount: number;
  collectionStage?: CollectionStage;
  writeOffAmount: number;
  writeOffDate?: Date;
  writeOffReason?: string;
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
    lateFeeAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    collectionStage: {
      type: String,
      enum: ['friendly_reminder', 'warning_letter', 'final_demand', 'legal_handover', 'write_off'],
    },
    writeOffAmount: {
      type: Number,
      default: 0,
    },
    writeOffDate: {
      type: Date,
    },
    writeOffReason: {
      type: String,
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
invoiceSchema.index({ schoolId: 1, collectionStage: 1 });

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
  receiptNumber?: string;
  paymentDate: Date;
  bankReference?: string;
  reconciled: boolean;
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
    receiptNumber: {
      type: String,
    },
    paymentDate: {
      type: Date,
      default: () => new Date(),
    },
    bankReference: {
      type: String,
    },
    reconciled: {
      type: Boolean,
      default: false,
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
paymentSchema.index({ reconciled: 1 });

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

// ─── Credit Note ──────────────────────────────────────────────────────────────

export type CreditNoteStatus = 'pending' | 'approved' | 'rejected';

export interface ICreditNote extends Document {
  invoiceId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  amount: number;
  reason: string;
  approvedBy?: Types.ObjectId;
  creditNoteNumber: string;
  status: CreditNoteStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const creditNoteSchema = new Schema<ICreditNote>(
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
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    creditNoteNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

creditNoteSchema.index({ invoiceId: 1 });
creditNoteSchema.index({ schoolId: 1, status: 1 });
creditNoteSchema.index({ creditNoteNumber: 1 }, { unique: true });

export const CreditNote = mongoose.model<ICreditNote>('CreditNote', creditNoteSchema);

// ─── Fee Exemption ────────────────────────────────────────────────────────────

export type ExemptionType = 'full' | 'partial' | 'bursary' | 'sibling_discount' | 'staff_discount' | 'early_payment';
export type ExemptionStatus = 'active' | 'expired' | 'revoked';

export interface IFeeExemption extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  feeTypeId: Types.ObjectId;
  exemptionType: ExemptionType;
  discountPercentage?: number;
  fixedAmount?: number;
  reason: string;
  approvedBy: Types.ObjectId;
  validFrom: Date;
  validTo: Date;
  status: ExemptionStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const feeExemptionSchema = new Schema<IFeeExemption>(
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
    feeTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'FeeType',
      required: true,
    },
    exemptionType: {
      type: String,
      enum: ['full', 'partial', 'bursary', 'sibling_discount', 'staff_discount', 'early_payment'],
      required: true,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    fixedAmount: {
      type: Number,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

feeExemptionSchema.index({ studentId: 1, feeTypeId: 1 });
feeExemptionSchema.index({ schoolId: 1, status: 1 });

export const FeeExemption = mongoose.model<IFeeExemption>('FeeExemption', feeExemptionSchema);

// ─── Payment Arrangement ──────────────────────────────────────────────────────

export type ArrangementFrequency = 'weekly' | 'monthly';
export type ArrangementStatus = 'active' | 'completed' | 'defaulted' | 'cancelled';

export interface IInstalment {
  dueDate: Date;
  amount: number;
  paidAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidDate?: Date;
}

export interface IPaymentArrangement extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  totalOutstanding: number;
  instalmentAmount: number;
  numberOfInstalments: number;
  frequency: ArrangementFrequency;
  startDate: Date;
  nextPaymentDate: Date;
  remainingInstalments: number;
  status: ArrangementStatus;
  instalments: IInstalment[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentArrangementSchema = new Schema<IPaymentArrangement>(
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
    totalOutstanding: {
      type: Number,
      required: true,
    },
    instalmentAmount: {
      type: Number,
      required: true,
    },
    numberOfInstalments: {
      type: Number,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    nextPaymentDate: {
      type: Date,
      required: true,
    },
    remainingInstalments: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'defaulted', 'cancelled'],
      default: 'active',
    },
    instalments: [
      {
        dueDate: { type: Date, required: true },
        amount: { type: Number, required: true },
        paidAmount: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ['pending', 'paid', 'overdue', 'partial'],
          default: 'pending',
        },
        paidDate: { type: Date },
        _id: false,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

paymentArrangementSchema.index({ studentId: 1, status: 1 });
paymentArrangementSchema.index({ schoolId: 1, status: 1 });
paymentArrangementSchema.index({ nextPaymentDate: 1 });

export const PaymentArrangement = mongoose.model<IPaymentArrangement>('PaymentArrangement', paymentArrangementSchema);

// ─── Collection Action ────────────────────────────────────────────────────────

export interface ICollectionAction extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  invoiceId: Types.ObjectId;
  stage: CollectionStage;
  scheduledDate: Date;
  sentDate?: Date;
  sentVia?: string;
  notes?: string;
  performedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const collectionActionSchema = new Schema<ICollectionAction>(
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
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    stage: {
      type: String,
      enum: ['friendly_reminder', 'warning_letter', 'final_demand', 'legal_handover', 'write_off'],
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    sentDate: {
      type: Date,
    },
    sentVia: {
      type: String,
    },
    notes: {
      type: String,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

collectionActionSchema.index({ invoiceId: 1, stage: 1 });
collectionActionSchema.index({ schoolId: 1, stage: 1 });
collectionActionSchema.index({ scheduledDate: 1, sentDate: 1 });

export const CollectionAction = mongoose.model<ICollectionAction>('CollectionAction', collectionActionSchema);

// ─── Account Ledger ───────────────────────────────────────────────────────────

export type LedgerEntryType = 'debit' | 'credit' | 'payment' | 'refund' | 'write_off' | 'interest' | 'discount';

export interface IAccountLedger extends Document {
  parentId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  type: LedgerEntryType;
  amount: number;
  runningBalance: number;
  reference?: string;
  description: string;
  relatedInvoiceId?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountLedgerSchema = new Schema<IAccountLedger>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Parent',
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
    type: {
      type: String,
      enum: ['debit', 'credit', 'payment', 'refund', 'write_off', 'interest', 'discount'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    runningBalance: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    relatedInvoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

accountLedgerSchema.index({ parentId: 1, createdAt: -1 });
accountLedgerSchema.index({ studentId: 1, createdAt: -1 });
accountLedgerSchema.index({ schoolId: 1, type: 1 });

export const AccountLedger = mongoose.model<IAccountLedger>('AccountLedger', accountLedgerSchema);
