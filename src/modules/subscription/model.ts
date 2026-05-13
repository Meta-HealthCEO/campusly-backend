import mongoose, { Schema, model, type Document } from 'mongoose';

export type SubscriberType = 'teacher' | 'student' | 'school';
export type PlanInterval = 'month' | 'year' | null;

export interface IPlan extends Document {
  code: string;
  name: string;
  description?: string;
  subscriberType: SubscriberType;
  amountExclTax: number;
  taxRate: number;
  currency: string;
  interval: PlanInterval;
  trialDays: number;
  entitlements: Record<string, unknown>;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    subscriberType: {
      type: String,
      enum: ['teacher', 'student', 'school'],
      required: true,
    },
    amountExclTax: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, required: true, default: 'ZAR' },
    interval: { type: String, enum: ['month', 'year', null], default: null },
    trialDays: { type: Number, required: true, default: 0, min: 0 },
    entitlements: { type: Schema.Types.Mixed, required: true, default: {} },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Plan = model<IPlan>('Plan', PlanSchema);

export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export interface ISubscription extends Document {
  schoolId: mongoose.Types.ObjectId;
  subscriberType: SubscriberType;
  planCode: string;
  status: SubscriptionStatus;
  trialEndsAt: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  nextBillingAt: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  endedAt: Date | null;
  cardTokenGuid: string | null;
  cardLastFour: string | null;
  cardBrand: string | null;
  cardExpiryMonth: number | null;
  cardExpiryYear: number | null;
  retryCount: number;
  nextRetryAt: Date | null;
  lastFailureReason: string | null;
  processingLockedAt: Date | null;
  gatewayProvider: string;
  gatewayCustomerRef: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, unique: true, index: true },
    subscriberType: { type: String, enum: ['teacher', 'student', 'school'], required: true },
    planCode: { type: String, required: true },
    status: {
      type: String,
      enum: ['free', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'],
      required: true,
      index: true,
    },
    trialEndsAt: { type: Date, default: null },
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    nextBillingAt: { type: Date, default: null, index: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    cardTokenGuid: { type: String, default: null },
    cardLastFour: { type: String, default: null },
    cardBrand: { type: String, default: null },
    cardExpiryMonth: { type: Number, default: null, min: 1, max: 12 },
    cardExpiryYear: { type: Number, default: null },
    retryCount: { type: Number, default: 0, min: 0 },
    nextRetryAt: { type: Date, default: null },
    lastFailureReason: { type: String, default: null },
    processingLockedAt: { type: Date, default: null },
    gatewayProvider: { type: String, default: 'onegate' },
    gatewayCustomerRef: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Subscription = model<ISubscription>('Subscription', SubscriptionSchema);

export type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type InvoicePurpose = 'verification' | 'subscription';

export interface IInvoice extends Document {
  subscriptionId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  planCode: string;
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  merchantReference: string;
  gatewayTransactionId: number | null;
  gatewayReference: string | null;
  gatewayResponse: unknown;
  periodStart: Date;
  periodEnd: Date;
  attemptedAt: Date | null;
  paidAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;
  refundedAmount: number;
  purpose: InvoicePurpose;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true, index: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    planCode: { type: String, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true, default: 0 },
    taxRate: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, required: true, default: 'ZAR' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      required: true,
    },
    merchantReference: { type: String, required: true, unique: true, index: true },
    gatewayTransactionId: { type: Number, default: null, index: true },
    gatewayReference: { type: String, default: null },
    gatewayResponse: { type: Schema.Types.Mixed, default: null },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    attemptedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    failureReason: { type: String, default: null },
    refundedAmount: { type: Number, default: 0 },
    purpose: { type: String, enum: ['verification', 'subscription'], required: true },
  },
  { timestamps: true },
);

export const Invoice = model<IInvoice>('SubscriptionInvoice', InvoiceSchema);

export type WebhookEventStatus = 'pending' | 'processed' | 'failed' | 'ignored';

export interface IWebhookEvent extends Document {
  gatewayTransactionId: number;
  payloadHash: string;
  rawPayload: unknown;
  receivedAt: Date;
  processedAt: Date | null;
  status: WebhookEventStatus;
  error: string | null;
  verifiedViaLookup: boolean;
}

const WebhookEventSchema = new Schema<IWebhookEvent>({
  gatewayTransactionId: { type: Number, required: true, unique: true, index: true },
  payloadHash: { type: String, required: true },
  rawPayload: { type: Schema.Types.Mixed, required: true },
  receivedAt: { type: Date, default: () => new Date() },
  processedAt: { type: Date, default: null },
  status: { type: String, enum: ['pending', 'processed', 'failed', 'ignored'], required: true },
  error: { type: String, default: null },
  verifiedViaLookup: { type: Boolean, default: false },
});

export const WebhookEvent = model<IWebhookEvent>('WebhookEvent', WebhookEventSchema);

export type CheckoutSessionPurpose = 'tokenisation' | 'update_card';
export type CheckoutSessionStatus = 'pending' | 'completed' | 'failed' | 'expired';

export interface ICheckoutSession extends Document {
  userId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  planCode: string;
  merchantReference: string;
  paymentKey: string;
  redirectUrl: string | null;
  purpose: CheckoutSessionPurpose;
  status: CheckoutSessionStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CheckoutSessionSchema = new Schema<ICheckoutSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    planCode: { type: String, required: true },
    merchantReference: { type: String, required: true, unique: true, index: true },
    paymentKey: { type: String, required: true },
    redirectUrl: { type: String, default: null },
    purpose: { type: String, enum: ['tokenisation', 'update_card'], required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'expired'],
      required: true,
      default: 'pending',
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const CheckoutSession = model<ICheckoutSession>('CheckoutSession', CheckoutSessionSchema);
