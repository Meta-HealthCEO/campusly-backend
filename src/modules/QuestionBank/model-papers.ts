import mongoose, { Schema, Document, Types } from 'mongoose';
import { DIAGRAM_RENDER_STATUSES, type DiagramRenderStatus } from './model-shared.js';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const PAPER_TYPES = [
  'class_test', 'assignment', 'mid_year', 'trial', 'final', 'custom',
] as const;

export type PaperType = (typeof PAPER_TYPES)[number];

export const PAPER_STATUSES = ['draft', 'finalised', 'archived'] as const;
export type PaperStatus = (typeof PAPER_STATUSES)[number];

export type PaperDifficulty = 'easy' | 'medium' | 'hard';
export const PAPER_DIFFICULTIES: PaperDifficulty[] = ['easy', 'medium', 'hard'];

// ─── Paper Interfaces ──────────────────────────────────────────────────────

export interface IPaperQuestionDiagram {
  tikz: string | null;
  caption: string | null;
  svgUrl: string | null;
  renderStatus: DiagramRenderStatus;
}

export interface IPaperQuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface IPaperQuestion {
  questionId: Types.ObjectId | null;
  questionText: string | null;
  options: IPaperQuestionOption[];
  marks: number;
  position: number;
  modelAnswer: string | null;
  markingGuideline: string | null;
  diagram: IPaperQuestionDiagram | null;
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

export const PAPER_ASSIGNMENT_MODES = ['digital', 'paper'] as const;
export type PaperAssignmentMode = (typeof PAPER_ASSIGNMENT_MODES)[number];

export interface IPaperAssignment {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  mode: PaperAssignmentMode;
  releaseAt: Date | null;
  dueAt: Date | null;
  assignedBy: Types.ObjectId;
  assignedAt: Date;
}

export interface IAssessmentPaper extends Document {
  schoolId: Types.ObjectId;
  title: string;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  topicIds: Types.ObjectId[];
  term: number;
  year: number;
  paperType: PaperType;
  totalMarks: number;
  duration: number;
  sections: IPaperSection[];
  instructions: string;
  capsCompliance: ICapsComplianceReport | null;
  status: PaperStatus;
  aiGenerated: boolean;
  difficulty: PaperDifficulty;
  version: number;
  assessmentId?: Types.ObjectId | null;
  // Paper → class assignments. Each entry attaches the paper to a teaching
  // group with a delivery mode (digital test-take on device, or printed
  // copy). A paper can be assigned to multiple classes; the same class
  // can be assigned the same paper at most once.
  assignments: IPaperAssignment[];
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Paper Schemas ─────────────────────────────────────────────────────────

const paperQuestionDiagramSchema = new Schema<IPaperQuestionDiagram>(
  {
    tikz: { type: String, default: null },
    caption: { type: String, default: null },
    svgUrl: { type: String, default: null },
    renderStatus: {
      type: String,
      enum: DIAGRAM_RENDER_STATUSES,
      default: 'pending',
    },
  },
  { _id: false },
);

const paperQuestionOptionSchema = new Schema<IPaperQuestionOption>(
  {
    label: { type: String, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false },
);

const paperQuestionSchema = new Schema<IPaperQuestion>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      default: null,
    },
    questionText: { type: String, default: null },
    options: { type: [paperQuestionOptionSchema], default: [] },
    marks: { type: Number, required: true, min: 0 },
    position: { type: Number, required: true, min: 0 },
    modelAnswer: { type: String, default: null },
    markingGuideline: { type: String, default: null },
    diagram: {
      type: paperQuestionDiagramSchema,
      default: null,
    },
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

const paperAssignmentSchema = new Schema<IPaperAssignment>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    mode: { type: String, enum: PAPER_ASSIGNMENT_MODES, required: true },
    releaseAt: { type: Date, default: null },
    dueAt: { type: Date, default: null },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: () => new Date() },
  },
  { _id: true },
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
    topicIds: {
      type: [Schema.Types.ObjectId],
      ref: 'CurriculumNode',
      required: true,
      validate: {
        validator: (v: Types.ObjectId[]) => Array.isArray(v) && v.length >= 1,
        message: 'topicIds must contain at least one curriculum topic',
      },
    },
    term: { type: Number, min: 1, max: 4, required: true },
    year: { type: Number, required: true },
    paperType: { type: String, enum: PAPER_TYPES, required: true },
    totalMarks: { type: Number, default: 0 },
    duration: { type: Number, required: true },
    sections: { type: [paperSectionSchema], default: [] },
    instructions: { type: String, default: '' },
    capsCompliance: { type: capsComplianceSchema, default: null },
    status: { type: String, enum: PAPER_STATUSES, default: 'draft' },
    aiGenerated: { type: Boolean, default: false },
    difficulty: {
      type: String,
      enum: PAPER_DIFFICULTIES,
      default: 'medium',
    },
    version: { type: Number, required: true, default: 1, min: 1 },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      default: null,
    },
    assignments: { type: [paperAssignmentSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assessmentPaperSchema.index({ schoolId: 1, createdBy: 1, isDeleted: 1 });
assessmentPaperSchema.index({ schoolId: 1, status: 1, isDeleted: 1 });
// Fast lookup for "papers assigned to this class" — e.g. student dashboard
// later in phase 2 listing their available digital tests.
assessmentPaperSchema.index({ schoolId: 1, 'assignments.classId': 1, isDeleted: 1 });

export const AssessmentPaper = mongoose.model<IAssessmentPaper>(
  'AssessmentPaper',
  assessmentPaperSchema,
);
