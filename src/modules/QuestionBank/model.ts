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

export const PAPER_TYPES = [
  'class_test', 'assignment', 'mid_year', 'trial', 'final', 'custom',
] as const;

export type PaperType = (typeof PAPER_TYPES)[number];

export const PAPER_STATUSES = ['draft', 'finalised', 'archived'] as const;
export type PaperStatus = (typeof PAPER_STATUSES)[number];

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

// ─── Paper Interfaces ──────────────────────────────────────────────────────

export interface IPaperQuestion {
  questionId: Types.ObjectId;
  questionNumber: string;
  marks: number;
  order: number;
}

export interface IPaperSection {
  title: string;
  instructions: string;
  order: number;
  questions: IPaperQuestion[];
}

export interface ITopicCoverage {
  nodeId: string;
  title: string;
  marks: number;
  percent: number;
}

export interface ICognitiveDistribution {
  knowledge: number;
  routine: number;
  complex: number;
  problemSolving: number;
}

export interface IDifficultySpread {
  easy: number;
  medium: number;
  hard: number;
}

export interface ICapsComplianceReport {
  topicCoverage: ITopicCoverage[];
  cognitiveDistribution: ICognitiveDistribution;
  targetDistribution: ICognitiveDistribution;
  compliant: boolean;
  violations: string[];
  difficultySpread: IDifficultySpread;
}

export interface IAssessmentPaper extends Document {
  schoolId: Types.ObjectId;
  title: string;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  term: number;
  year: number;
  paperType: PaperType;
  totalMarks: number;
  duration: number;
  sections: IPaperSection[];
  instructions: string;
  capsCompliance: ICapsComplianceReport | null;
  status: PaperStatus;
  createdBy: Types.ObjectId;
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

// ─── Paper Schema ──────────────────────────────────────────────────────────

const paperQuestionSchema = new Schema<IPaperQuestion>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    questionNumber: { type: String, required: true },
    marks: { type: Number, required: true },
    order: { type: Number, required: true },
  },
  { _id: false },
);

const paperSectionSchema = new Schema<IPaperSection>(
  {
    title: { type: String, required: true },
    instructions: { type: String, default: '' },
    order: { type: Number, required: true },
    questions: { type: [paperQuestionSchema], default: [] },
  },
  { _id: false },
);

const cogDistSchema = new Schema<ICognitiveDistribution>(
  {
    knowledge: { type: Number, default: 0 },
    routine: { type: Number, default: 0 },
    complex: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
  },
  { _id: false },
);

const topicCoverageSchema = new Schema<ITopicCoverage>(
  {
    nodeId: { type: String, required: true },
    title: { type: String, required: true },
    marks: { type: Number, required: true },
    percent: { type: Number, required: true },
  },
  { _id: false },
);

const difficultySpreadSchema = new Schema<IDifficultySpread>(
  {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
  },
  { _id: false },
);

const capsComplianceSchema = new Schema<ICapsComplianceReport>(
  {
    topicCoverage: { type: [topicCoverageSchema], default: [] },
    cognitiveDistribution: { type: cogDistSchema, required: true },
    targetDistribution: { type: cogDistSchema, required: true },
    compliant: { type: Boolean, default: false },
    violations: { type: [String], default: [] },
    difficultySpread: { type: difficultySpreadSchema, required: true },
  },
  { _id: false },
);

const assessmentPaperSchema = new Schema<IAssessmentPaper>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    term: { type: Number, min: 1, max: 4, required: true },
    year: { type: Number, required: true },
    paperType: { type: String, enum: PAPER_TYPES, required: true },
    totalMarks: { type: Number, default: 0 },
    duration: { type: Number, required: true },
    sections: { type: [paperSectionSchema], default: [] },
    instructions: { type: String, default: '' },
    capsCompliance: { type: capsComplianceSchema, default: null },
    status: { type: String, enum: PAPER_STATUSES, default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assessmentPaperSchema.index({ schoolId: 1, createdBy: 1, isDeleted: 1 });
assessmentPaperSchema.index({ schoolId: 1, status: 1, isDeleted: 1 });

export const AssessmentPaper = mongoose.model<IAssessmentPaper>(
  'AssessmentPaper',
  assessmentPaperSchema,
);
