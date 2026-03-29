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
