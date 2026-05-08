import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const QUESTION_TYPES = [
  'mcq', 'true_false', 'short_answer', 'structured', 'essay',
  'match', 'fill_blank', 'calculation', 'diagram_label', 'case_study',
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const CAPS_LEVELS = [
  'knowledge', 'routine', 'complex', 'problem_solving',
] as const;

export type CapsLevel = (typeof CAPS_LEVELS)[number];

export const BLOOMS_LEVELS = [
  'remember', 'understand', 'apply', 'analyse', 'evaluate', 'create',
] as const;

export type BloomsLevel = (typeof BLOOMS_LEVELS)[number];

export const QUESTION_SOURCES = ['system', 'ai_generated', 'teacher'] as const;
export type QuestionSource = (typeof QUESTION_SOURCES)[number];

export const QUESTION_STATUSES = [
  'draft', 'pending_review', 'approved', 'rejected',
] as const;

export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export const MEDIA_TYPES = ['image', 'diagram', 'table'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const DIAGRAM_RENDER_STATUSES = ['pending', 'rendered', 'failed'] as const;
export type DiagramRenderStatus = (typeof DIAGRAM_RENDER_STATUSES)[number];

// ─── Question Interfaces ───────────────────────────────────────────────────

export interface IQuestionMedia {
  mediaType: MediaType;
  url: string;
}

export interface IDiagram {
  tikz: string;
  data: Record<string, unknown>;
  alt: string;
  svgUrl: string | null;
  pdfUrl: string | null;
  hash: string;
  renderStatus: DiagramRenderStatus;
  renderError: string | null;
}

export interface IQuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestionCognitiveLevel {
  caps: CapsLevel;
  blooms: BloomsLevel;
}

export interface IQuestion extends Document {
  curriculumNodeId: Types.ObjectId;
  schoolId: Types.ObjectId | null;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  type: QuestionType;
  stem: string;
  media: IQuestionMedia[];
  diagram: IDiagram | null;
  options: IQuestionOption[];
  answer: string;
  markingRubric: string;
  marks: number;
  cognitiveLevel: IQuestionCognitiveLevel;
  difficulty: number;
  tags: string[];
  source: QuestionSource;
  status: QuestionStatus;
  reviewedBy: Types.ObjectId | null;
  reviewedAt: Date | null;
  createdBy: Types.ObjectId;
  usageCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Question Schema ───────────────────────────────────────────────────────

const questionMediaSchema = new Schema<IQuestionMedia>(
  {
    mediaType: { type: String, enum: MEDIA_TYPES, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const diagramSchema = new Schema<IDiagram>(
  {
    tikz: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    alt: { type: String, required: true },
    svgUrl: { type: String, default: null },
    pdfUrl: { type: String, default: null },
    hash: { type: String, required: true },
    renderStatus: { type: String, enum: DIAGRAM_RENDER_STATUSES, default: 'pending' },
    renderError: { type: String, default: null },
  },
  { _id: false },
);

const questionOptionSchema = new Schema<IQuestionOption>(
  {
    label: { type: String, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false },
);

const questionCognitiveLevelSchema = new Schema<IQuestionCognitiveLevel>(
  {
    caps: { type: String, enum: CAPS_LEVELS, required: true },
    blooms: { type: String, enum: BLOOMS_LEVELS, required: true },
  },
  { _id: false },
);

const questionSchema = new Schema<IQuestion>(
  {
    curriculumNodeId: {
      type: Schema.Types.ObjectId,
      ref: 'CurriculumNode',
      required: true,
    },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    type: { type: String, enum: QUESTION_TYPES, required: true },
    stem: { type: String, required: true, trim: true },
    media: { type: [questionMediaSchema], default: [] },
    diagram: { type: diagramSchema, default: null },
    options: { type: [questionOptionSchema], default: [] },
    answer: { type: String, default: '' },
    markingRubric: { type: String, default: '' },
    marks: { type: Number, required: true, min: 1 },
    cognitiveLevel: { type: questionCognitiveLevelSchema, required: true },
    difficulty: { type: Number, min: 1, max: 5, default: 3 },
    tags: { type: [String], default: [] },
    source: { type: String, enum: QUESTION_SOURCES, default: 'teacher' },
    status: { type: String, enum: QUESTION_STATUSES, default: 'draft' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    usageCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

questionSchema.index({ schoolId: 1, status: 1, isDeleted: 1 });
questionSchema.index({ curriculumNodeId: 1, isDeleted: 1 });
questionSchema.index({ subjectId: 1, gradeId: 1, isDeleted: 1 });
questionSchema.index({ 'cognitiveLevel.caps': 1, isDeleted: 1 });
questionSchema.index({ createdBy: 1, status: 1, isDeleted: 1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);

// ─── Paper Re-exports ──────────────────────────────────────────────────────
// Paper-related interfaces, schemas, and the AssessmentPaper model live in
// model-papers.ts. They are re-exported here so existing import paths
// (`from './model.js'`) continue to work without churn.

export {
  PAPER_TYPES,
  PAPER_STATUSES,
  PAPER_DIFFICULTIES,
  AssessmentPaper,
} from './model-papers.js';

export type {
  PaperType,
  PaperStatus,
  PaperDifficulty,
  IPaperQuestionDiagram,
  IPaperQuestion,
  IPaperSection,
  ITopicCoverage,
  ICognitiveDistribution,
  IDifficultySpread,
  ICapsComplianceReport,
  IAssessmentPaper,
} from './model-papers.js';
