import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const BLOCK_TYPES = [
  'text',
  'heading',
  'image',
  'video',
  'audio',
  'equation',
  'code',
  'table',
  'multiple_choice',
  'short_answer',
  'matching',
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const RESOURCE_TYPES = [
  'lesson',
  'study_notes',
  'worksheet',
  'worked_example',
  'activity',
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_FORMATS = ['static', 'interactive'] as const;
export type ResourceFormat = (typeof RESOURCE_FORMATS)[number];

export const RESOURCE_SOURCES = ['oer', 'ai_generated', 'teacher', 'system'] as const;
export type ResourceSource = (typeof RESOURCE_SOURCES)[number];

export const RESOURCE_STATUSES = ['draft', 'pending_review', 'approved', 'rejected'] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

// ─── Content Block ──────────────────────────────────────────────────────────

export interface ICognitiveLevel {
  caps: string | null;
  blooms: string | null;
}

export interface IContentBlock {
  blockId: string;
  type: BlockType;
  order: number;
  content: string;
  curriculumNodeId: Types.ObjectId | null;
  cognitiveLevel: ICognitiveLevel | null;
  points: number;
  hints: string[];
  explanation: string;
  metadata: Record<string, unknown>;
}

// ─── Content Resource ───────────────────────────────────────────────────────

export interface IContentResource extends Document {
  curriculumNodeId: Types.ObjectId;
  schoolId: Types.ObjectId | null;
  type: ResourceType;
  format: ResourceFormat;
  title: string;
  blocks: IContentBlock[];
  source: ResourceSource;
  sourceAttribution: string;
  gradeId: Types.ObjectId;
  subjectId: Types.ObjectId;
  term: number;
  tags: string[];
  status: ResourceStatus;
  reviewedBy: Types.ObjectId | null;
  reviewedAt: Date | null;
  reviewNotes: string;
  createdBy: Types.ObjectId;
  aiModel: string;
  aiPrompt: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  difficulty: number;
  estimatedMinutes: number;
  prerequisites: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schemas ────────────────────────────────────────────────────────────────

const cognitiveLevelSchema = new Schema<ICognitiveLevel>(
  {
    caps: { type: String, default: null },
    blooms: { type: String, default: null },
  },
  { _id: false },
);

const contentBlockSchema = new Schema<IContentBlock>(
  {
    blockId: { type: String, required: true },
    type: { type: String, enum: BLOCK_TYPES, required: true },
    order: { type: Number, required: true, default: 0 },
    content: { type: String, default: '' },
    curriculumNodeId: {
      type: Schema.Types.ObjectId,
      ref: 'CurriculumNode',
      default: null,
    },
    cognitiveLevel: { type: cognitiveLevelSchema, default: null },
    points: { type: Number, default: 0 },
    hints: { type: [String], default: [] },
    explanation: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const contentResourceSchema = new Schema<IContentResource>(
  {
    curriculumNodeId: {
      type: Schema.Types.ObjectId,
      ref: 'CurriculumNode',
      required: true,
    },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null },
    type: { type: String, enum: RESOURCE_TYPES, required: true },
    format: { type: String, enum: RESOURCE_FORMATS, default: 'static' },
    title: { type: String, required: true, trim: true },
    blocks: { type: [contentBlockSchema], default: [] },
    source: { type: String, enum: RESOURCE_SOURCES, default: 'teacher' },
    sourceAttribution: { type: String, default: '' },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    term: { type: Number, min: 1, max: 4, required: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: RESOURCE_STATUSES, default: 'draft' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNotes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    aiModel: { type: String, default: '' },
    aiPrompt: { type: String, default: '' },
    downloads: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    difficulty: { type: Number, min: 1, max: 5, default: 3 },
    estimatedMinutes: { type: Number, default: 0 },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'CurriculumNode' }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ─── Indexes ────────────────────────────────────────────────────────────────

contentResourceSchema.index({ schoolId: 1, status: 1, isDeleted: 1 });
contentResourceSchema.index({ curriculumNodeId: 1, isDeleted: 1 });
contentResourceSchema.index({ createdBy: 1, status: 1, isDeleted: 1 });
contentResourceSchema.index({ subjectId: 1, gradeId: 1, term: 1, isDeleted: 1 });
contentResourceSchema.index({ tags: 1 });

export const ContentResource = mongoose.model<IContentResource>(
  'ContentResource',
  contentResourceSchema,
);
