import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Pastoral Referral ───────────────────────────────────────────────────────

export type ReferralReason =
  | 'academic'
  | 'behavioural'
  | 'emotional'
  | 'social'
  | 'family'
  | 'substance'
  | 'bullying'
  | 'self_harm'
  | 'other';

export type ReferralUrgency = 'low' | 'medium' | 'high' | 'critical';
export type ReferralStatus = 'referred' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
export type ReferralOutcome =
  | 'positive'
  | 'ongoing'
  | 'referred_external'
  | 'no_further_action';

export interface IPastoralReferral extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  referredBy: Types.ObjectId;
  reason: ReferralReason;
  description: string;
  urgency: ReferralUrgency;
  referrerNotes: string;
  status: ReferralStatus;
  assignedCounselorId?: Types.ObjectId;
  counselorNotes: string;
  outcome?: ReferralOutcome;
  resolutionNotes: string;
  resolvedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pastoralReferralSchema = new Schema<IPastoralReferral>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: [
        'academic', 'behavioural', 'emotional', 'social', 'family',
        'substance', 'bullying', 'self_harm', 'other',
      ],
      required: true,
    },
    description: { type: String, required: true, minlength: 10 },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    referrerNotes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['referred', 'acknowledged', 'in_progress', 'resolved', 'closed'],
      default: 'referred',
    },
    assignedCounselorId: { type: Schema.Types.ObjectId, ref: 'User' },
    counselorNotes: { type: String, default: '' },
    outcome: {
      type: String,
      enum: ['positive', 'ongoing', 'referred_external', 'no_further_action'],
    },
    resolutionNotes: { type: String, default: '' },
    resolvedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

pastoralReferralSchema.index({ schoolId: 1, status: 1, createdAt: -1 });
pastoralReferralSchema.index({ studentId: 1, isDeleted: 1 });
pastoralReferralSchema.index({ referredBy: 1, createdAt: -1 });
pastoralReferralSchema.index({ assignedCounselorId: 1, status: 1 });

export const PastoralReferral = mongoose.model<IPastoralReferral>(
  'PastoralReferral',
  pastoralReferralSchema,
);

// ─── Counselor Session ───────────────────────────────────────────────────────

export type SessionType = 'individual' | 'group' | 'crisis' | 'follow_up' | 'consultation';
export type ConfidentialityLevel = 'standard' | 'sensitive' | 'restricted';

export interface ICounselorSession extends Document {
  studentId: Types.ObjectId;
  counselorId: Types.ObjectId;
  schoolId: Types.ObjectId;
  referralId?: Types.ObjectId;
  sessionDate: Date;
  sessionType: SessionType;
  duration: number;
  // TODO: encrypt summary and followUpActions at rest using an encryption service
  summary: string;
  followUpActions: string;
  followUpDate?: Date;
  confidentialityLevel: ConfidentialityLevel;
  parentNotified: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const counselorSessionSchema = new Schema<ICounselorSession>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    counselorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    referralId: { type: Schema.Types.ObjectId, ref: 'PastoralReferral' },
    sessionDate: { type: Date, required: true },
    sessionType: {
      type: String,
      enum: ['individual', 'group', 'crisis', 'follow_up', 'consultation'],
      required: true,
    },
    duration: { type: Number, required: true, min: 5, max: 180 },
    // TODO: encrypt summary and followUpActions at rest using an encryption service
    summary: { type: String, required: true },
    followUpActions: { type: String, default: '' },
    followUpDate: { type: Date },
    confidentialityLevel: {
      type: String,
      enum: ['standard', 'sensitive', 'restricted'],
      required: true,
    },
    parentNotified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

counselorSessionSchema.index({ counselorId: 1, sessionDate: -1 });
counselorSessionSchema.index({ studentId: 1, sessionDate: -1 });
counselorSessionSchema.index({ schoolId: 1, counselorId: 1, followUpDate: 1 });
counselorSessionSchema.index({ referralId: 1 });

export const CounselorSession = mongoose.model<ICounselorSession>(
  'CounselorSession',
  counselorSessionSchema,
);
