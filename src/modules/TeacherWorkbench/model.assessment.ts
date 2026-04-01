import mongoose, { Schema, Document, Types } from 'mongoose';
import type {
  QuestionType,
  Difficulty,
  CognitiveLevel,
  QuestionSource,
  MemoStatus,
  ModerationStatus,
  AssessmentType,
  PlanStatus,
} from './model.js';

// ─── Question ─────────────────────────────────────────────────────────────────

export interface IQuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  frameworkId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeLevel: number;
  topicId: Types.ObjectId | null;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  difficulty: Difficulty;
  cognitiveLevel: CognitiveLevel;
  modelAnswer: string;
  markingNotes: string;
  images: string[];
  options: IQuestionOption[];
  tags: string[];
  source: QuestionSource;
  usageCount: number;
  lastUsedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const questionOptionSchema = new Schema<IQuestionOption>(
  {
    label: { type: String, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false },
);

const questionSchema = new Schema<IQuestion>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    frameworkId: { type: Schema.Types.ObjectId, ref: 'CurriculumFramework', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeLevel: { type: Number, required: true, min: 1, max: 12 },
    topicId: { type: Schema.Types.ObjectId, ref: 'CurriculumTopic', default: null },
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: ['mcq', 'structured', 'essay', 'true_false', 'matching', 'short_answer', 'fill_in_blank'],
      required: true,
    },
    marks: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    cognitiveLevel: {
      type: String,
      enum: ['knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'],
      required: true,
    },
    modelAnswer: { type: String, default: '' },
    markingNotes: { type: String, default: '' },
    images: { type: [String], default: [] },
    options: { type: [questionOptionSchema], default: [] },
    tags: { type: [String], default: [] },
    source: {
      type: String,
      enum: ['manual', 'ai_generated', 'imported'],
      default: 'manual',
    },
    usageCount: { type: Number, default: 0 },
    lastUsedDate: { type: Date, default: null },
  },
  { timestamps: true },
);

questionSchema.index({ schoolId: 1, subjectId: 1, gradeLevel: 1 });
questionSchema.index({ schoolId: 1, teacherId: 1 });
questionSchema.index({ schoolId: 1, topicId: 1 });
questionSchema.index({ tags: 1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);

// ─── PaperMemo ────────────────────────────────────────────────────────────────

export interface IMarkAllocation {
  criterion: string;
  marks: number;
}

export interface IMemoAnswer {
  questionNumber: string;
  expectedAnswer: string;
  markAllocation: IMarkAllocation[];
  commonMistakes: string[];
  acceptableAlternatives: string[];
}

export interface IMemoSection {
  sectionTitle: string;
  answers: IMemoAnswer[];
}

export interface IPaperMemo extends Document {
  paperId: Types.ObjectId;
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  sections: IMemoSection[];
  totalMarks: number;
  status: MemoStatus;
  createdAt: Date;
  updatedAt: Date;
}

const markAllocationSchema = new Schema<IMarkAllocation>(
  {
    criterion: { type: String, required: true },
    marks: { type: Number, required: true },
  },
  { _id: false },
);

const memoAnswerSchema = new Schema<IMemoAnswer>(
  {
    questionNumber: { type: String, required: true },
    expectedAnswer: { type: String, required: true },
    markAllocation: { type: [markAllocationSchema], default: [] },
    commonMistakes: { type: [String], default: [] },
    acceptableAlternatives: { type: [String], default: [] },
  },
  { _id: false },
);

const memoSectionSchema = new Schema<IMemoSection>(
  {
    sectionTitle: { type: String, required: true },
    answers: { type: [memoAnswerSchema], default: [] },
  },
  { _id: false },
);

const paperMemoSchema = new Schema<IPaperMemo>(
  {
    paperId: { type: Schema.Types.ObjectId, required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sections: { type: [memoSectionSchema], default: [] },
    totalMarks: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'final'], default: 'draft' },
  },
  { timestamps: true },
);

paperMemoSchema.index({ paperId: 1 }, { unique: true });
paperMemoSchema.index({ schoolId: 1, teacherId: 1 });

export const PaperMemo = mongoose.model<IPaperMemo>('PaperMemo', paperMemoSchema);

// ─── PaperModeration ──────────────────────────────────────────────────────────

export interface IModerationHistoryEntry {
  moderatorId: Types.ObjectId;
  action: string;
  comment: string;
  timestamp: Date;
}

export interface IPaperModeration extends Document {
  paperId: Types.ObjectId;
  schoolId: Types.ObjectId;
  submittedBy: Types.ObjectId;
  submittedAt: Date;
  moderatorId: Types.ObjectId | null;
  moderatedAt: Date | null;
  status: ModerationStatus;
  comments: string;
  moderationHistory: IModerationHistoryEntry[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const moderationHistoryEntrySchema = new Schema<IModerationHistoryEntry>(
  {
    moderatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    comment: { type: String, default: '' },
    timestamp: { type: Date, required: true },
  },
  { _id: false },
);

const paperModerationSchema = new Schema<IPaperModeration>(
  {
    paperId: { type: Schema.Types.ObjectId, required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date, required: true },
    moderatorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    moderatedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'approved', 'changes_requested'],
      default: 'pending',
    },
    comments: { type: String, default: '' },
    moderationHistory: { type: [moderationHistoryEntrySchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

paperModerationSchema.index({ schoolId: 1, status: 1 });
paperModerationSchema.index({ paperId: 1 }, { unique: true });
paperModerationSchema.index({ moderatorId: 1, status: 1 });

export const PaperModeration = mongoose.model<IPaperModeration>(
  'PaperModeration',
  paperModerationSchema,
);

// ─── AssessmentPlan ───────────────────────────────────────────────────────────

export interface IPlannedAssessment {
  title: string;
  assessmentType: AssessmentType;
  plannedDate: Date;
  totalMarks: number;
  status: PlanStatus;
  linkedPaperId: Types.ObjectId | null;
}

export interface IAssessmentPlan extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  subjectId: Types.ObjectId;
  classId: Types.ObjectId;
  term: number;
  year: number;
  plannedAssessments: IPlannedAssessment[];
  createdAt: Date;
  updatedAt: Date;
}

const plannedAssessmentSchema = new Schema<IPlannedAssessment>(
  {
    title: { type: String, required: true, trim: true },
    assessmentType: {
      type: String,
      enum: ['test', 'exam', 'assignment', 'practical', 'project'],
      required: true,
    },
    plannedDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    status: {
      type: String,
      enum: ['planned', 'created', 'completed'],
      default: 'planned',
    },
    linkedPaperId: { type: Schema.Types.ObjectId, default: null },
  },
  { _id: false },
);

const assessmentPlanSchema = new Schema<IAssessmentPlan>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    term: { type: Number, required: true, min: 1, max: 4 },
    year: { type: Number, required: true },
    plannedAssessments: { type: [plannedAssessmentSchema], default: [] },
  },
  { timestamps: true },
);

assessmentPlanSchema.index({ schoolId: 1, classId: 1, term: 1, year: 1 });
assessmentPlanSchema.index({ teacherId: 1 });

export const AssessmentPlan = mongoose.model<IAssessmentPlan>(
  'AssessmentPlan',
  assessmentPlanSchema,
);
