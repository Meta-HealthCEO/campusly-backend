import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Enums / Type Unions ──────────────────────────────────────────────────────

export type CognitiveLevel =
  | 'knowledge'
  | 'comprehension'
  | 'application'
  | 'analysis'
  | 'synthesis'
  | 'evaluation';

export type CoverageStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export type QuestionType =
  | 'mcq'
  | 'structured'
  | 'essay'
  | 'true_false'
  | 'matching'
  | 'short_answer'
  | 'fill_in_blank';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionSource = 'manual' | 'ai_generated' | 'imported';

export type MemoStatus = 'draft' | 'final';

export type ModerationStatus = 'pending' | 'approved' | 'changes_requested';

export type AssessmentType = 'test' | 'exam' | 'assignment' | 'practical' | 'project';

export type PlanStatus = 'planned' | 'created' | 'completed';

// ─── CurriculumFramework ──────────────────────────────────────────────────────

export interface ICurriculumFramework extends Document {
  schoolId: Types.ObjectId | null;
  name: string;
  description: string;
  isDefault: boolean;
  createdBy: Types.ObjectId | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const curriculumFrameworkSchema = new Schema<ICurriculumFramework>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

curriculumFrameworkSchema.index({ schoolId: 1, isDeleted: 1 });

export const CurriculumFramework = mongoose.model<ICurriculumFramework>(
  'CurriculumFramework',
  curriculumFrameworkSchema,
);

// ─── CurriculumTopic ──────────────────────────────────────────────────────────

export interface ICurriculumTopic extends Document {
  schoolId: Types.ObjectId;
  frameworkId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeLevel: number;
  parentTopicId: Types.ObjectId | null;
  name: string;
  description: string;
  term: number;
  orderIndex: number;
  cognitiveLevel: CognitiveLevel;
  estimatedPeriods: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const curriculumTopicSchema = new Schema<ICurriculumTopic>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    frameworkId: { type: Schema.Types.ObjectId, ref: 'CurriculumFramework', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeLevel: { type: Number, required: true, min: 1, max: 12 },
    parentTopicId: { type: Schema.Types.ObjectId, ref: 'CurriculumTopic', default: null },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    term: { type: Number, required: true, min: 1, max: 4 },
    orderIndex: { type: Number, required: true, default: 0 },
    cognitiveLevel: {
      type: String,
      enum: ['knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'],
      required: true,
    },
    estimatedPeriods: { type: Number, required: true, default: 1 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

curriculumTopicSchema.index({ schoolId: 1, frameworkId: 1, subjectId: 1, gradeLevel: 1 });
curriculumTopicSchema.index({ parentTopicId: 1 });

export const CurriculumTopic = mongoose.model<ICurriculumTopic>(
  'CurriculumTopic',
  curriculumTopicSchema,
);

// ─── CurriculumCoverage ───────────────────────────────────────────────────────

export interface ICurriculumCoverage extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  topicId: Types.ObjectId;
  classId: Types.ObjectId;
  status: CoverageStatus;
  dateCovered: Date | null;
  notes: string;
  linkedLessonPlanId: Types.ObjectId | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const curriculumCoverageSchema = new Schema<ICurriculumCoverage>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'CurriculumTopic', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'skipped'],
      default: 'not_started',
    },
    dateCovered: { type: Date, default: null },
    notes: { type: String, default: '' },
    linkedLessonPlanId: { type: Schema.Types.ObjectId, ref: 'LessonPlan', default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

curriculumCoverageSchema.index({ teacherId: 1, classId: 1, topicId: 1 }, { unique: true });
curriculumCoverageSchema.index({ schoolId: 1, teacherId: 1 });

export const CurriculumCoverage = mongoose.model<ICurriculumCoverage>(
  'CurriculumCoverage',
  curriculumCoverageSchema,
);
