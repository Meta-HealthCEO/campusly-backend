import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── CurriculumTopic (subdoc) ─────────────────────────────────────────────────

export type TopicStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface ICurriculumTopic {
  _id: Types.ObjectId;
  title: string;
  description: string;
  weekNumber: number;
  expectedStartDate: Date;
  expectedEndDate: Date;
  capsReference: string;
  status: TopicStatus;
  completedDate: Date | null;
  percentComplete: number;
}

const curriculumTopicSchema = new Schema<ICurriculumTopic>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    weekNumber: { type: Number, required: true },
    expectedStartDate: { type: Date, required: true },
    expectedEndDate: { type: Date, required: true },
    capsReference: { type: String, default: '' },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'skipped'],
      default: 'not_started',
    },
    completedDate: { type: Date, default: null },
    percentComplete: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: true },
);

// ─── CurriculumPlan ──────────────────────────────────────────────────────────

export interface ICurriculumPlan extends Document {
  schoolId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  term: number;
  year: number;
  topics: ICurriculumTopic[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const curriculumPlanSchema = new Schema<ICurriculumPlan>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    term: { type: Number, required: true, min: 1, max: 4 },
    year: { type: Number, required: true },
    topics: { type: [curriculumTopicSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

curriculumPlanSchema.index(
  { schoolId: 1, subjectId: 1, gradeId: 1, term: 1, year: 1 },
  { unique: true },
);
curriculumPlanSchema.index({ schoolId: 1, year: 1, term: 1 });

export const CurriculumPlan = mongoose.model<ICurriculumPlan>('CurriculumPlan', curriculumPlanSchema);

// ─── PacingUpdate ─────────────────────────────────────────────────────────────

export interface ITopicUpdate {
  topicId: Types.ObjectId;
  status: string;
  completedDate: Date | null;
  percentComplete: number;
  notes: string;
}

const topicUpdateSchema = new Schema<ITopicUpdate>(
  {
    topicId: { type: Schema.Types.ObjectId, required: true },
    status: { type: String, required: true },
    completedDate: { type: Date, default: null },
    percentComplete: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: String, default: '' },
  },
  { _id: false },
);

export interface IPacingUpdate extends Document {
  planId: Types.ObjectId;
  teacherId: Types.ObjectId;
  schoolId: Types.ObjectId;
  weekEnding: Date;
  topicUpdates: ITopicUpdate[];
  overallNotes: string;
  challengesFaced: string;
  plannedContentDelivered: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pacingUpdateSchema = new Schema<IPacingUpdate>(
  {
    planId: { type: Schema.Types.ObjectId, ref: 'CurriculumPlan', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    weekEnding: { type: Date, required: true },
    topicUpdates: { type: [topicUpdateSchema], default: [] },
    overallNotes: { type: String, default: '' },
    challengesFaced: { type: String, default: '' },
    plannedContentDelivered: { type: Number, default: 0, min: 0, max: 100 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

pacingUpdateSchema.index({ planId: 1, weekEnding: -1 });
pacingUpdateSchema.index({ teacherId: 1, weekEnding: -1 });

export const PacingUpdate = mongoose.model<IPacingUpdate>('PacingUpdate', pacingUpdateSchema);

// ─── NationalBenchmark ────────────────────────────────────────────────────────

export interface INationalBenchmark extends Document {
  schoolId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  year: number;
  targetPassRate: number;
  targetAverageScore: number;
  source: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const nationalBenchmarkSchema = new Schema<INationalBenchmark>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    year: { type: Number, required: true },
    targetPassRate: { type: Number, required: true, min: 0, max: 100 },
    targetAverageScore: { type: Number, min: 0, max: 100 },
    source: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

nationalBenchmarkSchema.index(
  { schoolId: 1, subjectId: 1, gradeId: 1, year: 1 },
  { unique: true },
);

export const NationalBenchmark = mongoose.model<INationalBenchmark>(
  'NationalBenchmark',
  nationalBenchmarkSchema,
);

// ─── CurriculumIntervention ───────────────────────────────────────────────────

export type InterventionStatus = 'active' | 'acknowledged' | 'resolved';

export interface ICurriculumIntervention extends Document {
  planId: Types.ObjectId;
  teacherId: Types.ObjectId;
  schoolId: Types.ObjectId;
  reason: string;
  weeksBehind: number;
  pacingPercent: number;
  expectedPercent: number;
  status: InterventionStatus;
  notes: string;
  resolvedAt: Date | null;
  resolvedBy: Types.ObjectId | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const curriculumInterventionSchema = new Schema<ICurriculumIntervention>(
  {
    planId: { type: Schema.Types.ObjectId, ref: 'CurriculumPlan', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    reason: { type: String, required: true },
    weeksBehind: { type: Number, required: true },
    pacingPercent: { type: Number, required: true },
    expectedPercent: { type: Number, required: true },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
    },
    notes: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

curriculumInterventionSchema.index({ schoolId: 1, status: 1 });
curriculumInterventionSchema.index({ teacherId: 1, status: 1 });

export const CurriculumIntervention = mongoose.model<ICurriculumIntervention>(
  'CurriculumIntervention',
  curriculumInterventionSchema,
);
