import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Wellbeing Survey ──────────────────────────────────────────────────────

export const SURVEY_STATUSES = ['draft', 'active', 'closed'] as const;
export type SurveyStatus = (typeof SURVEY_STATUSES)[number];

export const QUESTION_TYPES = ['scale', 'multiple_choice', 'text', 'yes_no'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface ISurveyQuestion {
  text: string;
  type: QuestionType;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: Map<string, string>;
  options?: string[];
  required: boolean;
}

export interface IWellbeingSurvey extends Document {
  schoolId: Types.ObjectId;
  title: string;
  description?: string;
  isAnonymous: boolean;
  targetGrades: number[];
  status: SurveyStatus;
  startDate: Date;
  endDate: Date;
  questions: ISurveyQuestion[];
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const surveyQuestionSchema = new Schema<ISurveyQuestion>(
  {
    text: { type: String, required: true },
    type: { type: String, enum: QUESTION_TYPES, required: true },
    scaleMin: { type: Number },
    scaleMax: { type: Number },
    scaleLabels: { type: Map, of: String },
    options: [{ type: String }],
    required: { type: Boolean, default: true },
  },
  { _id: false },
);

const wellbeingSurveySchema = new Schema<IWellbeingSurvey>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isAnonymous: { type: Boolean, default: true },
    targetGrades: { type: [Number], required: true },
    status: { type: String, enum: SURVEY_STATUSES, default: 'draft' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    questions: { type: [surveyQuestionSchema], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

wellbeingSurveySchema.index({ schoolId: 1, status: 1, startDate: -1 });

export const WellbeingSurvey = mongoose.model<IWellbeingSurvey>(
  'WellbeingSurvey',
  wellbeingSurveySchema,
);

// ─── Survey Response ───────────────────────────────────────────────────────

export interface ISurveyAnswer {
  questionIndex: number;
  value: unknown; // number, string, or boolean
}

export interface ISurveyResponse extends Document {
  schoolId: Types.ObjectId;
  surveyId: Types.ObjectId;
  studentId?: Types.ObjectId | null;
  answers: ISurveyAnswer[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const surveyResponseSchema = new Schema<ISurveyResponse>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    surveyId: { type: Schema.Types.ObjectId, ref: 'WellbeingSurvey', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', default: null },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        value: { type: Schema.Types.Mixed, required: true },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

surveyResponseSchema.index(
  { surveyId: 1, studentId: 1 },
  { unique: true, sparse: true },
);
surveyResponseSchema.index({ schoolId: 1, surveyId: 1 });

export const SurveyResponse = mongoose.model<ISurveyResponse>(
  'SurveyResponse',
  surveyResponseSchema,
);
