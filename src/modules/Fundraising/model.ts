import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Campaign ───────────────────────────────────────────────────────────────

export interface ICampaign extends Document {
  title: string;
  description?: string;
  schoolId: Types.ObjectId;
  targetAmount: number;
  raisedAmount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    raisedAmount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
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

campaignSchema.index({ schoolId: 1, isActive: 1 });
campaignSchema.index({ schoolId: 1, startDate: -1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);

// ─── Donation ───────────────────────────────────────────────────────────────

export interface IDonation extends Document {
  campaignId: Types.ObjectId;
  schoolId: Types.ObjectId;
  donorName: string;
  donorEmail?: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<IDonation>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    donorEmail: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

donationSchema.index({ campaignId: 1, createdAt: -1 });
donationSchema.index({ schoolId: 1, createdAt: -1 });

export const Donation = mongoose.model<IDonation>('Donation', donationSchema);
