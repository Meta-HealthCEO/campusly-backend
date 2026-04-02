import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Generated Paper ──────────────────────────────────────────────────────────

export type PaperStatus = 'generating' | 'ready' | 'edited';

export interface IPaperQuestion {
  questionNumber: number;
  questionText: string;
  marks: number;
  modelAnswer: string;
  markingGuideline: string;
}

export interface IPaperSection {
  sectionLabel: string;
  questionType: string;
  questions: IPaperQuestion[];
}

export interface IGeneratedPaper extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  subject: string;
  grade: number;
  term: number;
  topic: string;
  difficulty: string;
  duration: number;
  totalMarks: number;
  sections: IPaperSection[];
  memorandum: string;
  status: PaperStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paperQuestionSchema = new Schema<IPaperQuestion>(
  {
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    marks: { type: Number, required: true },
    modelAnswer: { type: String, required: true },
    markingGuideline: { type: String, required: true },
  },
  { _id: false },
);

const paperSectionSchema = new Schema<IPaperSection>(
  {
    sectionLabel: { type: String, required: true },
    questionType: { type: String, required: true },
    questions: [paperQuestionSchema],
  },
  { _id: false },
);

const generatedPaperSchema = new Schema<IGeneratedPaper>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: Number, required: true },
    term: { type: Number, required: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], required: true },
    duration: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    sections: [paperSectionSchema],
    memorandum: { type: String, default: '' },
    status: {
      type: String,
      enum: ['generating', 'ready', 'edited'],
      default: 'generating',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

generatedPaperSchema.index({ schoolId: 1, teacherId: 1 });
generatedPaperSchema.index({ schoolId: 1, subject: 1, grade: 1 });
generatedPaperSchema.index({ status: 1 });

export const GeneratedPaper = mongoose.model<IGeneratedPaper>(
  'GeneratedPaper',
  generatedPaperSchema,
);

// ─── Grading Job ──────────────────────────────────────────────────────────────

export type GradingJobStatus = 'queued' | 'grading' | 'completed' | 'reviewed' | 'published';

export interface ICriteriaScore {
  criterion: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface IAIResult {
  totalMark: number;
  maxMark: number;
  percentage: number;
  criteriaScores: ICriteriaScore[];
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ITeacherOverride {
  finalMark: number;
  teacherNotes: string;
}

export interface IRubricCriterion {
  criterion: string;
  maxScore: number;
  description: string;
}

export interface IGradingJob extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  submissionText: string;
  rubric: IRubricCriterion[];
  aiResult?: IAIResult;
  teacherOverride?: ITeacherOverride;
  status: GradingJobStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const criteriaScoreSchema = new Schema<ICriteriaScore>(
  {
    criterion: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    feedback: { type: String, required: true },
  },
  { _id: false },
);

const aiResultSchema = new Schema<IAIResult>(
  {
    totalMark: { type: Number, required: true },
    maxMark: { type: Number, required: true },
    percentage: { type: Number, required: true },
    criteriaScores: [criteriaScoreSchema],
    overallFeedback: { type: String, required: true },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
  },
  { _id: false },
);

const teacherOverrideSchema = new Schema<ITeacherOverride>(
  {
    finalMark: { type: Number, required: true },
    teacherNotes: { type: String, default: '' },
  },
  { _id: false },
);

const rubricCriterionSchema = new Schema<IRubricCriterion>(
  {
    criterion: { type: String, required: true },
    maxScore: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

const gradingJobSchema = new Schema<IGradingJob>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Homework', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    submissionText: { type: String, required: true },
    rubric: [rubricCriterionSchema],
    aiResult: aiResultSchema,
    teacherOverride: teacherOverrideSchema,
    status: {
      type: String,
      enum: ['queued', 'grading', 'completed', 'reviewed', 'published'],
      default: 'queued',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

gradingJobSchema.index({ schoolId: 1, teacherId: 1 });
gradingJobSchema.index({ assignmentId: 1 });
gradingJobSchema.index({ studentId: 1 });
gradingJobSchema.index({ status: 1 });

export const GradingJob = mongoose.model<IGradingJob>('GradingJob', gradingJobSchema);

// ─── AI Usage Log ─────────────────────────────────────────────────────────────

export type AIUsageType = 'paper_generation' | 'question_regeneration' | 'grading' | 'memo_generation' | 'tutor_chat' | 'tutor_practice' | 'report_comments' | 'sports_analysis';

export interface IAIUsageLog extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  type: AIUsageType;
  tokensUsed: { input: number; output: number };
  aiModel: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiUsageLogSchema = new Schema<IAIUsageLog>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['paper_generation', 'question_regeneration', 'grading', 'memo_generation', 'tutor_chat', 'tutor_practice', 'report_comments', 'sports_analysis'],
      required: true,
    },
    tokensUsed: {
      input: { type: Number, required: true },
      output: { type: Number, required: true },
    },
    aiModel: { type: String, required: true },
  },
  { timestamps: true },
);

aiUsageLogSchema.index({ schoolId: 1, createdAt: -1 });
aiUsageLogSchema.index({ teacherId: 1, createdAt: -1 });

export const AIUsageLog = mongoose.model<IAIUsageLog>('AIUsageLog', aiUsageLogSchema);
