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

// ─── Raffle ─────────────────────────────────────────────────────────────────

export interface IRafflePrize {
  place: number;
  description: string;
  value: number;
}

export interface IRaffle extends Document {
  campaignId: Types.ObjectId;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  drawDate: Date;
  prizes: IRafflePrize[];
  winnersDrawn: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const rafflePrizeSchema = new Schema<IRafflePrize>(
  {
    place: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const raffleSchema = new Schema<IRaffle>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    ticketPrice: {
      type: Number,
      required: true,
    },
    totalTickets: {
      type: Number,
      required: true,
    },
    soldTickets: {
      type: Number,
      default: 0,
    },
    drawDate: {
      type: Date,
      required: true,
    },
    prizes: {
      type: [rafflePrizeSchema],
      default: [],
    },
    winnersDrawn: {
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

raffleSchema.index({ campaignId: 1 });

export const Raffle = mongoose.model<IRaffle>('Raffle', raffleSchema);

// ─── Raffle Ticket ──────────────────────────────────────────────────────────

export interface IRaffleTicket extends Document {
  raffleId: Types.ObjectId;
  parentId: Types.ObjectId;
  studentId: Types.ObjectId;
  ticketNumber: string;
  purchasedAt: Date;
  isWinner: boolean;
  prizePlace?: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const raffleTicketSchema = new Schema<IRaffleTicket>(
  {
    raffleId: {
      type: Schema.Types.ObjectId,
      ref: 'Raffle',
      required: true,
    },
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
    ticketNumber: {
      type: String,
      required: true,
    },
    purchasedAt: {
      type: Date,
      default: () => new Date(),
    },
    isWinner: {
      type: Boolean,
      default: false,
    },
    prizePlace: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

raffleTicketSchema.index({ raffleId: 1, ticketNumber: 1 }, { unique: true });
raffleTicketSchema.index({ parentId: 1 });

export const RaffleTicket = mongoose.model<IRaffleTicket>('RaffleTicket', raffleTicketSchema);

// ─── Tax Certificate (Section 18A) ────────────────────────────────────────

export interface ITaxCertificate extends Document {
  donationId: Types.ObjectId;
  schoolId: Types.ObjectId;
  certificateNumber: string;
  donorName: string;
  donorIdNumber?: string;
  donorAddress?: string;
  amount: number;
  dateIssued: Date;
  schoolTaxNumber: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taxCertificateSchema = new Schema<ITaxCertificate>(
  {
    donationId: {
      type: Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    donorIdNumber: {
      type: String,
      trim: true,
    },
    donorAddress: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dateIssued: {
      type: Date,
      required: true,
    },
    schoolTaxNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

taxCertificateSchema.index({ certificateNumber: 1 }, { unique: true });
taxCertificateSchema.index({ donationId: 1 });

export const TaxCertificate = mongoose.model<ITaxCertificate>('TaxCertificate', taxCertificateSchema);

// ─── Donor Wall ────────────────────────────────────────────────────────────

export interface IDonorWall extends Document {
  campaignId: Types.ObjectId;
  schoolId: Types.ObjectId;
  donorName: string;
  amount: number;
  message?: string;
  isPublic: boolean;
  donationId: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const donorWallSchema = new Schema<IDonorWall>(
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
    amount: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    donationId: {
      type: Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

donorWallSchema.index({ campaignId: 1, isPublic: 1 });

export const DonorWall = mongoose.model<IDonorWall>('DonorWall', donorWallSchema);

// ─── Recurring Donation ────────────────────────────────────────────────────

export interface IRecurringDonation extends Document {
  campaignId: Types.ObjectId;
  schoolId: Types.ObjectId;
  donorName: string;
  donorEmail: string;
  amount: number;
  frequency: 'monthly' | 'weekly';
  isActive: boolean;
  nextChargeDate: Date;
  lastChargedDate?: Date;
  totalCharged: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const recurringDonationSchema = new Schema<IRecurringDonation>(
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
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['monthly', 'weekly'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    nextChargeDate: {
      type: Date,
      required: true,
    },
    lastChargedDate: {
      type: Date,
    },
    totalCharged: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

recurringDonationSchema.index({ schoolId: 1, isActive: 1 });
recurringDonationSchema.index({ nextChargeDate: 1 });

export const RecurringDonation = mongoose.model<IRecurringDonation>('RecurringDonation', recurringDonationSchema);
