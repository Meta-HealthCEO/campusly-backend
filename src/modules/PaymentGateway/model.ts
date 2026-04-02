import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Payment Gateway Provider ─────────────────────────────────────────────────

export type GatewayProvider = 'payfast' | 'yoco' | 'paystack' | 'stripe';

export type OnlinePaymentStatus =
  | 'initiated'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type OnlinePaymentType =
  | 'fee_payment'
  | 'wallet_topup'
  | 'event_ticket'
  | 'uniform_order'
  | 'donation';

export type OnlinePaymentMethod = 'card' | 'eft' | 'instant_eft' | 'qr_code';

// ─── Payment Gateway Config ──────────────────────────────────────────────────

export interface IGatewayCredentials {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  sandboxMode: boolean;
}

export interface IPaymentGatewayConfig extends Document {
  schoolId: Types.ObjectId;
  provider: GatewayProvider;
  credentials: IGatewayCredentials;
  enabled: boolean;
  webhookSecret: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentGatewayConfigSchema = new Schema<IPaymentGatewayConfig>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ['payfast', 'yoco', 'paystack', 'stripe'],
      default: 'payfast',
    },
    credentials: {
      merchantId: { type: String, required: true },
      merchantKey: { type: String, required: true },
      passphrase: { type: String, required: true },
      sandboxMode: { type: Boolean, default: true },
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    webhookSecret: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

paymentGatewayConfigSchema.index({ schoolId: 1 }, { unique: true });

export const PaymentGatewayConfig = mongoose.model<IPaymentGatewayConfig>(
  'PaymentGatewayConfig',
  paymentGatewayConfigSchema,
);

// ─── Online Payment ──────────────────────────────────────────────────────────

export interface IOnlinePayment extends Document {
  schoolId: Types.ObjectId;
  parentId: Types.ObjectId;
  studentId?: Types.ObjectId;
  invoiceIds: Types.ObjectId[];
  walletId?: Types.ObjectId;
  paymentType: OnlinePaymentType;
  amount: number;
  currency: string;
  provider: string;
  externalTransactionId?: string;
  status: OnlinePaymentStatus;
  paymentMethod?: OnlinePaymentMethod;
  gatewayFee: number;
  netAmount: number;
  receiptNumber?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  gatewayResponse?: Record<string, unknown>;
  initiatedAt: Date;
  completedAt?: Date;
  failureReason?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const onlinePaymentSchema = new Schema<IOnlinePayment>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
    invoiceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
      },
    ],
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    paymentType: {
      type: String,
      enum: ['fee_payment', 'wallet_topup', 'event_ticket', 'uniform_order', 'donation'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'ZAR',
    },
    provider: {
      type: String,
      required: true,
    },
    externalTransactionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['initiated', 'pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'initiated',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'eft', 'instant_eft', 'qr_code'],
    },
    gatewayFee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: 0,
    },
    receiptNumber: {
      type: String,
    },
    returnUrl: {
      type: String,
      required: true,
    },
    cancelUrl: {
      type: String,
      required: true,
    },
    notifyUrl: {
      type: String,
      required: true,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
    initiatedAt: {
      type: Date,
      default: () => new Date(),
    },
    completedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

onlinePaymentSchema.index({ schoolId: 1, parentId: 1 });
onlinePaymentSchema.index({ externalTransactionId: 1 });
onlinePaymentSchema.index({ schoolId: 1, status: 1 });

export const OnlinePayment = mongoose.model<IOnlinePayment>(
  'OnlinePayment',
  onlinePaymentSchema,
);
