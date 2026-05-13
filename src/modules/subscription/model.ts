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
