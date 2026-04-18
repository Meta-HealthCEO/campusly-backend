import mongoose, { Schema, Document, Types } from 'mongoose';

export const INJURY_BODY_PARTS = [
  'head',
  'neck',
  'shoulder',
  'arm',
  'elbow',
  'wrist',
  'hand',
  'chest',
  'back',
  'hip',
  'groin',
  'thigh',
  'hamstring',
  'quadriceps',
  'knee',
  'calf',
  'shin',
  'ankle',
  'foot',
  'other',
] as const;

export const INJURY_TYPES = [
  'sprain',
  'strain',
  'fracture',
  'contusion',
  'laceration',
  'concussion',
  'overuse',
  'dislocation',
  'other',
] as const;

export const INJURY_SEVERITIES = ['minor', 'moderate', 'severe'] as const;

export const INJURY_STATUSES = [
  'active',
  'recovering',
  'cleared',
  'closed',
] as const;

export const CLEARANCE_LEVELS = [
  'none',
  'light_training',
  'full_training',
  'match_ready',
] as const;

export type InjuryBodyPart = (typeof INJURY_BODY_PARTS)[number];
export type InjuryType = (typeof INJURY_TYPES)[number];
export type InjurySeverity = (typeof INJURY_SEVERITIES)[number];
export type InjuryStatus = (typeof INJURY_STATUSES)[number];
export type ClearanceLevel = (typeof CLEARANCE_LEVELS)[number];

export interface IInjuryRecord extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  teamId?: Types.ObjectId;
  injuryDate: Date;
  bodyPart: InjuryBodyPart;
  type: InjuryType;
  severity: InjurySeverity;
  mechanism?: string;
  description?: string;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  status: InjuryStatus;
  clearanceLevel: ClearanceLevel;
  reportedBy: Types.ObjectId;
  clearedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const injurySchema = new Schema<IInjuryRecord>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'SportTeam' },
    injuryDate: { type: Date, required: true },
    bodyPart: { type: String, enum: INJURY_BODY_PARTS, required: true },
    type: { type: String, enum: INJURY_TYPES, required: true },
    severity: { type: String, enum: INJURY_SEVERITIES, required: true },
    mechanism: { type: String, trim: true },
    description: { type: String, trim: true },
    expectedReturnDate: { type: Date },
    actualReturnDate: { type: Date },
    status: {
      type: String,
      enum: INJURY_STATUSES,
      default: 'active',
    },
    clearanceLevel: {
      type: String,
      enum: CLEARANCE_LEVELS,
      default: 'none',
    },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clearedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

injurySchema.index({ schoolId: 1, studentId: 1, status: 1 });
injurySchema.index({ schoolId: 1, status: 1, injuryDate: -1 });

export const InjuryRecord = mongoose.model<IInjuryRecord>(
  'InjuryRecord',
  injurySchema,
);

export interface IRecoveryLog extends Document {
  schoolId: Types.ObjectId;
  injuryId: Types.ObjectId;
  loggedBy: Types.ObjectId;
  date: Date;
  painLevel?: number;
  mobilityScore?: number;
  activitiesPerformed: string[];
  notes?: string;
  nextMilestone?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const recoveryLogSchema = new Schema<IRecoveryLog>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    injuryId: {
      type: Schema.Types.ObjectId,
      ref: 'InjuryRecord',
      required: true,
    },
    loggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    painLevel: { type: Number, min: 0, max: 10 },
    mobilityScore: { type: Number, min: 0, max: 10 },
    activitiesPerformed: { type: [String], default: [] },
    notes: { type: String, trim: true },
    nextMilestone: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

recoveryLogSchema.index({ injuryId: 1, date: -1 });
recoveryLogSchema.index({ schoolId: 1, injuryId: 1 });

export const RecoveryLog = mongoose.model<IRecoveryLog>(
  'RecoveryLog',
  recoveryLogSchema,
);
