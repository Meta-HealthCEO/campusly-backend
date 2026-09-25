// src/modules/Evidence/model-taxonomy.ts
//
// The misconception taxonomy (global: curriculum knowledge, no learner data),
// the per-school diagnosis cache, and the ledger of every AI call Phase E makes.
import mongoose, { Schema, Document, Types } from 'mongoose';

export const TYPE_KINDS = ['misconception', 'procedural', 'generic'] as const;
export type TypeKind = (typeof TYPE_KINDS)[number];
export const TYPE_STATUSES = ['seeded', 'proposed', 'approved', 'merged', 'retired'] as const;
export type TypeStatus = (typeof TYPE_STATUSES)[number];
/** Usable in a diagnosis. */
export const ACTIVE_TYPE_STATUSES: readonly TypeStatus[] = ['seeded', 'proposed', 'approved'];
export const TYPE_ORIGINS = ['system', 'ai_seed', 'ai_proposed', 'reviewer'] as const;

export interface IMisconceptionType extends Document {
  code: string;
  kind: TypeKind;
  subjectNodeId: Types.ObjectId | null;
  topicNodeId: Types.ObjectId | null;
  /** Set only for a school's own custom topic node. */
  schoolId: Types.ObjectId | null;
  label: string;
  learnerLabel: string;
  description: string;
  status: TypeStatus;
  origin: (typeof TYPE_ORIGINS)[number];
  learnerVisible: boolean;
  mergedInto: Types.ObjectId | null;
  suggestedMergeInto: Types.ObjectId | null;
  suggestedMergeConfidence: number | null;
  useCount: number;
  lastUsedAt: Date | null;
  reviewedBy: Types.ObjectId | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ref = (to: string) => ({ type: Schema.Types.ObjectId, ref: to, default: null });

const misconceptionTypeSchema = new Schema<IMisconceptionType>(
  {
    code: { type: String, required: true, trim: true },
    kind: { type: String, enum: TYPE_KINDS, required: true },
    subjectNodeId: ref('CurriculumNode'),
    topicNodeId: ref('CurriculumNode'),
    schoolId: ref('School'),
    label: { type: String, required: true, maxlength: 60 },
    learnerLabel: { type: String, required: true, maxlength: 60 },
    description: { type: String, default: '', maxlength: 300 },
    status: { type: String, enum: TYPE_STATUSES, required: true },
    origin: { type: String, enum: TYPE_ORIGINS, required: true },
    learnerVisible: { type: Boolean, default: true },
    mergedInto: ref('MisconceptionType'),
    suggestedMergeInto: ref('MisconceptionType'),
    suggestedMergeConfidence: { type: Number, default: null },
    useCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: null },
    reviewedBy: ref('User'),
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
misconceptionTypeSchema.index({ code: 1 }, { unique: true });
misconceptionTypeSchema.index({ topicNodeId: 1, status: 1 });
misconceptionTypeSchema.index({ status: 1, createdAt: -1 });

export const MisconceptionType = mongoose.model<IMisconceptionType>('MisconceptionType', misconceptionTypeSchema);

export interface IDiagnosisCache extends Document {
  schoolId: Types.ObjectId;
  cacheKey: string;
  typeId: Types.ObjectId;
  explanation: string;
  confidence: number;
  requestId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const diagnosisCacheSchema = new Schema<IDiagnosisCache>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    cacheKey: { type: String, required: true },
    typeId: { type: Schema.Types.ObjectId, ref: 'MisconceptionType', required: true },
    explanation: { type: String, default: '', maxlength: 240 },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    requestId: ref('DiagnosisRequest'),
  },
  { timestamps: true },
);
diagnosisCacheSchema.index({ cacheKey: 1 }, { unique: true });
diagnosisCacheSchema.index({ schoolId: 1, typeId: 1 });

export const DiagnosisCache = mongoose.model<IDiagnosisCache>('DiagnosisCache', diagnosisCacheSchema);

export const REQUEST_KINDS = ['diagnosis', 'seed', 'tagging', 'tidy'] as const;
export type RequestKind = (typeof REQUEST_KINDS)[number];
export const REQUEST_MODES = ['batch', 'direct', 'fixture'] as const;
export type RequestMode = (typeof REQUEST_MODES)[number];

/** A plain interface, not a Document: its `model` field would clash with `Document.model()`. */
export interface IDiagnosisRequest {
  kind: RequestKind;
  /** Null for platform work (pre-seeding, the weekly tidy). */
  schoolId: Types.ObjectId | null;
  topicNodeId: Types.ObjectId | null;
  paperId: Types.ObjectId | null;
  mode: RequestMode;
  batchId: string | null;
  state: 'submitted' | 'done' | 'failed';
  items: Array<{ ref: string; cacheKey: string }>;
  model: string;
  usage: { input: number; output: number };
  error: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const requestItemSchema = new Schema<{ ref: string; cacheKey: string }>(
  { ref: { type: String, required: true }, cacheKey: { type: String, required: true } },
  { _id: false },
);

const diagnosisRequestSchema = new Schema<IDiagnosisRequest>(
  {
    kind: { type: String, enum: REQUEST_KINDS, required: true },
    schoolId: ref('School'),
    topicNodeId: ref('CurriculumNode'),
    paperId: ref('AssessmentPaper'),
    mode: { type: String, enum: REQUEST_MODES, required: true },
    batchId: { type: String, default: null },
    state: { type: String, enum: ['submitted', 'done', 'failed'], required: true },
    items: { type: [requestItemSchema], default: [] },
    model: { type: String, required: true },
    usage: { input: { type: Number, default: 0 }, output: { type: Number, default: 0 } },
    error: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
diagnosisRequestSchema.index({ schoolId: 1, kind: 1, createdAt: -1 });
diagnosisRequestSchema.index({ state: 1, kind: 1, batchId: 1 });
diagnosisRequestSchema.index({ 'items.cacheKey': 1, state: 1 });

export const DiagnosisRequest = mongoose.model<IDiagnosisRequest>('DiagnosisRequest', diagnosisRequestSchema);
