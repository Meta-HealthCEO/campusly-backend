import mongoose, { Schema, Document, Types } from 'mongoose';
import { TransactionType } from '../../common/enums.js';

// ─── Wallet ────────────────────────────────────────────────────────────────────

export interface IWallet extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  balance: number;
  dailyLimit: number;
  currency: string;
  autoTopUpEnabled: boolean;
  autoTopUpAmount?: number;
  autoTopUpThreshold?: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
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
    balance: {
      type: Number,
      default: 0,
    },
    dailyLimit: {
      type: Number,
      default: 10000, // R100 in cents
    },
    currency: {
      type: String,
      default: 'ZAR',
    },
    autoTopUpEnabled: {
      type: Boolean,
      default: false,
    },
    autoTopUpAmount: {
      type: Number,
    },
    autoTopUpThreshold: {
      type: Number,
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

walletSchema.index({ studentId: 1 }, { unique: true });
walletSchema.index({ schoolId: 1 });

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);

// ─── Wallet Transaction ────────────────────────────────────────────────────────

export interface IWalletTransaction extends Document {
  walletId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  description: string;
  reference?: string;
  balanceAfter: number;
  performedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    performedBy: {
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

walletTransactionSchema.index({ walletId: 1, createdAt: -1 });

export const WalletTransaction = mongoose.model<IWalletTransaction>(
  'WalletTransaction',
  walletTransactionSchema,
);

// ─── Wristband ─────────────────────────────────────────────────────────────────

export interface IWristband extends Document {
  wristbandId: string;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  isActive: boolean;
  activatedAt: Date;
  deactivatedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wristbandSchema = new Schema<IWristband>(
  {
    wristbandId: {
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
    isActive: {
      type: Boolean,
      default: true,
    },
    activatedAt: {
      type: Date,
      required: true,
    },
    deactivatedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

wristbandSchema.index({ wristbandId: 1 }, { unique: true });
wristbandSchema.index({ studentId: 1 });

export const Wristband = mongoose.model<IWristband>('Wristband', wristbandSchema);
