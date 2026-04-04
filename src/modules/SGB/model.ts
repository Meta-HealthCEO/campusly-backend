import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── SGB Position & Status Enums ────────────────────────────────────────────

export type SgbPosition = 'chairperson' | 'deputy_chairperson' | 'secretary' | 'treasurer' | 'member' | 'co_opted';
export type SgbMemberStatus = 'pending' | 'active' | 'inactive';
export type MeetingType = 'ordinary' | 'special' | 'annual_general';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ResolutionCategory = 'financial' | 'policy' | 'staffing' | 'infrastructure' | 'curriculum' | 'general';
export type ResolutionStatus = 'proposed' | 'passed' | 'rejected' | 'deferred';
export type DocumentCategory = 'policy' | 'financial_statement' | 'audit_report' | 'minutes' | 'constitution' | 'annual_report' | 'other';
export type VoteChoice = 'for' | 'against' | 'abstain';
export type SipGoalCategory = 'academic' | 'infrastructure' | 'governance' | 'financial' | 'community';
export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

// ─── SgbMember ──────────────────────────────────────────────────────────────

export interface ISgbMember extends Document {
  userId?: Types.ObjectId;
  schoolId: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  position: SgbPosition;
  term?: string;
  status: SgbMemberStatus;
  invitedBy: Types.ObjectId;
  invitedAt: Date;
  joinedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sgbMemberSchema = new Schema<ISgbMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    email: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    position: { type: String, enum: ['chairperson', 'deputy_chairperson', 'secretary', 'treasurer', 'member', 'co_opted'], required: true },
    term: { type: String },
    status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending', required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedAt: { type: Date, required: true, default: Date.now },
    joinedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

sgbMemberSchema.index({ schoolId: 1, status: 1 });
sgbMemberSchema.index({ email: 1, schoolId: 1 }, { unique: true });

export const SgbMember = mongoose.model<ISgbMember>('SgbMember', sgbMemberSchema);

// ─── SgbMeeting ─────────────────────────────────────────────────────────────

export interface IAgendaItem {
  title: string;
  presenter?: string;
  duration?: number;
}

export interface ISgbMeeting extends Document {
  schoolId: Types.ObjectId;
  title: string;
  date: Date;
  venue: string;
  type: MeetingType;
  status: MeetingStatus;
  agenda: IAgendaItem[];
  minutes?: string;
  attendees: Types.ObjectId[];
  apologies: Types.ObjectId[];
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sgbMeetingSchema = new Schema<ISgbMeeting>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    type: { type: String, enum: ['ordinary', 'special', 'annual_general'], required: true },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled', required: true },
    agenda: [{
      title: { type: String, required: true },
      presenter: { type: String },
      duration: { type: Number },
    }],
    minutes: { type: String },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'SgbMember' }],
    apologies: [{ type: Schema.Types.ObjectId, ref: 'SgbMember' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

sgbMeetingSchema.index({ schoolId: 1, date: -1 });
sgbMeetingSchema.index({ schoolId: 1, status: 1 });

export const SgbMeeting = mongoose.model<ISgbMeeting>('SgbMeeting', sgbMeetingSchema);

// ─── SgbResolution ──────────────────────────────────────────────────────────

export interface IVoterRecord {
  voterId: Types.ObjectId;
  vote: VoteChoice;
  votedAt: Date;
}

export interface ISgbResolution extends Document {
  meetingId: Types.ObjectId;
  schoolId: Types.ObjectId;
  title: string;
  description?: string;
  category: ResolutionCategory;
  status: ResolutionStatus;
  requiresVote: boolean;
  votes: { for: number; against: number; abstain: number };
  voterRecords: IVoterRecord[];
  linkedDocumentId?: Types.ObjectId;
  proposedBy: Types.ObjectId;
  resolvedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sgbResolutionSchema = new Schema<ISgbResolution>(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'SgbMeeting', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, enum: ['financial', 'policy', 'staffing', 'infrastructure', 'curriculum', 'general'], required: true },
    status: { type: String, enum: ['proposed', 'passed', 'rejected', 'deferred'], default: 'proposed', required: true },
    requiresVote: { type: Boolean, default: true },
    votes: {
      for: { type: Number, default: 0 },
      against: { type: Number, default: 0 },
      abstain: { type: Number, default: 0 },
    },
    voterRecords: [{
      voterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      vote: { type: String, enum: ['for', 'against', 'abstain'], required: true },
      votedAt: { type: Date, default: Date.now },
    }],
    linkedDocumentId: { type: Schema.Types.ObjectId, ref: 'SgbDocument' },
    proposedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resolvedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

sgbResolutionSchema.index({ meetingId: 1 });
sgbResolutionSchema.index({ schoolId: 1, status: 1 });
sgbResolutionSchema.index({ schoolId: 1, category: 1 });

export const SgbResolution = mongoose.model<ISgbResolution>('SgbResolution', sgbResolutionSchema);

// ─── SgbDocument ────────────────────────────────────────────────────────────

export interface ISgbDocument extends Document {
  schoolId: Types.ObjectId;
  title: string;
  category: DocumentCategory;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  policyReviewDate?: Date;
  version: number;
  uploadedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sgbDocumentSchema = new Schema<ISgbDocument>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ['policy', 'financial_statement', 'audit_report', 'minutes', 'constitution', 'annual_report', 'other'], required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    policyReviewDate: { type: Date },
    version: { type: Number, default: 1 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

sgbDocumentSchema.index({ schoolId: 1, category: 1 });
sgbDocumentSchema.index({ schoolId: 1, policyReviewDate: 1 });

export const SgbDocument = mongoose.model<ISgbDocument>('SgbDocument', sgbDocumentSchema);

// ─── SchoolImprovementPlan ──────────────────────────────────────────────────

export interface IMilestone {
  title: string;
  targetDate: string;
  status: MilestoneStatus;
  completedDate?: string;
}

export interface ISipGoal {
  title: string;
  category: SipGoalCategory;
  milestones: IMilestone[];
  progress: number;
}

export interface ISchoolImprovementPlan extends Document {
  schoolId: Types.ObjectId;
  year: number;
  goals: ISipGoal[];
  overallProgress: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sipSchema = new Schema<ISchoolImprovementPlan>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    year: { type: Number, required: true },
    goals: [{
      title: { type: String, required: true },
      category: { type: String, enum: ['academic', 'infrastructure', 'governance', 'financial', 'community'], required: true },
      milestones: [{
        title: { type: String, required: true },
        targetDate: { type: String, required: true },
        status: { type: String, enum: ['not_started', 'in_progress', 'completed', 'blocked'], default: 'not_started' },
        completedDate: { type: String },
      }],
      progress: { type: Number, default: 0 },
    }],
    overallProgress: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

sipSchema.index({ schoolId: 1, year: 1 }, { unique: true });

export const SchoolImprovementPlan = mongoose.model<ISchoolImprovementPlan>('SchoolImprovementPlan', sipSchema);
