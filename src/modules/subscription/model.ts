import { Schema, model, type Document } from 'mongoose';

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
