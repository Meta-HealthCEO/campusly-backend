import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── SIP Plan ────────────────────────────────────────────────────────────────

export type SIPStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface ISIPPlan extends Document {
  schoolId: Types.ObjectId;
  title: string;
  year: number;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: SIPStatus;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sipPlanSchema = new Schema<ISIPPlan>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'active', 'completed', 'archived'], default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

sipPlanSchema.index({ schoolId: 1, year: 1 });
sipPlanSchema.index({ schoolId: 1, status: 1 });

export const SIPPlan = mongoose.model<ISIPPlan>('SIPPlan', sipPlanSchema);

// ─── SIP Goal ────────────────────────────────────────────────────────────────

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';
export type GoalPriority = 'high' | 'medium' | 'low';

export interface ISIPGoal extends Document {
  sipId: Types.ObjectId;
  schoolId: Types.ObjectId;
  title: string;
  description?: string;
  wseArea: number;
  responsiblePersonId?: Types.ObjectId;
  targetDate: Date;
  completionPercent: number;
  status: GoalStatus;
  priority: GoalPriority;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sipGoalSchema = new Schema<ISIPGoal>(
  {
    sipId: { type: Schema.Types.ObjectId, ref: 'SIPPlan', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    wseArea: { type: Number, required: true, min: 1, max: 9 },
    responsiblePersonId: { type: Schema.Types.ObjectId, ref: 'User' },
    targetDate: { type: Date, required: true },
    completionPercent: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'overdue'],
      default: 'not_started',
    },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

sipGoalSchema.index({ sipId: 1, status: 1 });
sipGoalSchema.index({ schoolId: 1, wseArea: 1 });

export const SIPGoal = mongoose.model<ISIPGoal>('SIPGoal', sipGoalSchema);

// ─── SIP Evidence ────────────────────────────────────────────────────────────

export interface ISIPEvidence extends Document {
  goalId: Types.ObjectId;
  schoolId: Types.ObjectId;
  title: string;
  fileUrl: string;
  fileType?: string;
  uploadedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sipEvidenceSchema = new Schema<ISIPEvidence>(
  {
    goalId: { type: Schema.Types.ObjectId, ref: 'SIPGoal', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const SIPEvidence = mongoose.model<ISIPEvidence>('SIPEvidence', sipEvidenceSchema);

// ─── SIP Review ──────────────────────────────────────────────────────────────

export interface ISIPReview extends Document {
  goalId: Types.ObjectId;
  schoolId: Types.ObjectId;
  quarter: number;
  year: number;
  notes: string;
  completionPercent: number;
  reviewedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sipReviewSchema = new Schema<ISIPReview>(
  {
    goalId: { type: Schema.Types.ObjectId, ref: 'SIPGoal', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    quarter: { type: Number, required: true, min: 1, max: 4 },
    year: { type: Number, required: true },
    notes: { type: String, required: true },
    completionPercent: { type: Number, required: true, min: 0, max: 100 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const SIPReview = mongoose.model<ISIPReview>('SIPReview', sipReviewSchema);

// ─── Policy ──────────────────────────────────────────────────────────────────

export type PolicyCategory = 'hr' | 'academic' | 'safety' | 'financial' | 'governance' | 'general';
export type PolicyStatus = 'draft' | 'active' | 'under_review' | 'archived';

export interface IPolicyVersion {
  version: number;
  content?: string;
  fileUrl?: string;
  updatedAt: Date;
  updatedBy: Types.ObjectId;
}

export interface IPolicy extends Document {
  schoolId: Types.ObjectId;
  title: string;
  category: PolicyCategory;
  content?: string;
  fileUrl?: string;
  version: number;
  previousVersions: IPolicyVersion[];
  status: PolicyStatus;
  reviewDate?: Date;
  lastReviewedAt?: Date;
  lastReviewedBy?: Types.ObjectId;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const policyVersionSchema = new Schema<IPolicyVersion>(
  {
    version: { type: Number, required: true },
    content: { type: String },
    fileUrl: { type: String },
    updatedAt: { type: Date, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: false },
);

const policySchema = new Schema<IPolicy>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['hr', 'academic', 'safety', 'financial', 'governance', 'general'],
      required: true,
    },
    content: { type: String },
    fileUrl: { type: String },
    version: { type: Number, default: 1 },
    previousVersions: { type: [policyVersionSchema], default: [] },
    status: {
      type: String,
      enum: ['draft', 'active', 'under_review', 'archived'],
      default: 'draft',
    },
    reviewDate: { type: Date },
    lastReviewedAt: { type: Date },
    lastReviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

policySchema.index({ schoolId: 1, category: 1 });
policySchema.index({ schoolId: 1, status: 1 });
policySchema.index({ schoolId: 1, reviewDate: 1 });

export const Policy = mongoose.model<IPolicy>('Policy', policySchema);

// ─── Policy Acknowledgement ──────────────────────────────────────────────────

export interface IPolicyAcknowledgement extends Document {
  policyId: Types.ObjectId;
  schoolId: Types.ObjectId;
  userId: Types.ObjectId;
  acknowledgedAt: Date;
  version: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const policyAcknowledgementSchema = new Schema<IPolicyAcknowledgement>(
  {
    policyId: { type: Schema.Types.ObjectId, ref: 'Policy', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    acknowledgedAt: { type: Date, required: true },
    version: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

policyAcknowledgementSchema.index({ policyId: 1, userId: 1 }, { unique: true });
policyAcknowledgementSchema.index({ schoolId: 1, userId: 1 });

export const PolicyAcknowledgement = mongoose.model<IPolicyAcknowledgement>(
  'PolicyAcknowledgement',
  policyAcknowledgementSchema,
);
