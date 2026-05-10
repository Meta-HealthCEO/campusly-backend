import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Enums ───────────────────────────────────────────────────────────────────

export type NodeType =
  | 'phase'
  | 'grade'
  | 'subject'
  | 'term'
  | 'topic'
  | 'subtopic'
  | 'outcome';

// ─── CurriculumNode ──────────────────────────────────────────────────────────

export interface ICognitiveWeighting {
  knowledge: number;
  routine: number;
  complex: number;
  problemSolving: number;
}

export interface INodeMetadata {
  weekNumbers: number[];
  capsReference: string;
  assessmentStandards: string[];
  notionalHours: number;
  cognitiveWeighting: ICognitiveWeighting | null;
}

export interface ICurriculumNode extends Document {
  frameworkId: Types.ObjectId;
  type: NodeType;
  parentId: Types.ObjectId | null;
  title: string;
  code: string;
  description: string;
  metadata: INodeMetadata;
  order: number;
  schoolId: Types.ObjectId | null;
  // Denormalized hierarchy refs — populated by pre-save hook (or backfill
  // migration). Self-ref convention: a subject node has subjectId === _id, a
  // grade node has gradeId === _id, a phase node has phaseId === _id. This
  // makes `find({ subjectId: X })` return the subject AND every descendant,
  // which is the semantics every consumer wants.
  phaseId: Types.ObjectId | null;
  gradeId: Types.ObjectId | null;
  subjectId: Types.ObjectId | null;
  // Parsed from the term ancestor's title ("Term 1" .. "Term 4"). Null when
  // the node is above term level or the title is unparseable.
  termNumber: number | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cognitiveWeightingSchema = new Schema<ICognitiveWeighting>(
  {
    knowledge: { type: Number, required: true, min: 0, max: 100 },
    routine: { type: Number, required: true, min: 0, max: 100 },
    complex: { type: Number, required: true, min: 0, max: 100 },
    problemSolving: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
);

const nodeMetadataSchema = new Schema<INodeMetadata>(
  {
    weekNumbers: { type: [Number], default: [] },
    capsReference: { type: String, default: '' },
    assessmentStandards: { type: [String], default: [] },
    notionalHours: { type: Number, default: 0 },
    cognitiveWeighting: { type: cognitiveWeightingSchema, default: null },
  },
  { _id: false },
);

const curriculumNodeSchema = new Schema<ICurriculumNode>(
  {
    frameworkId: { type: Schema.Types.ObjectId, ref: 'CurriculumFramework', required: true },
    type: {
      type: String,
      enum: ['phase', 'grade', 'subject', 'term', 'topic', 'subtopic', 'outcome'],
      required: true,
    },
    parentId: { type: Schema.Types.ObjectId, ref: 'CurriculumNode', default: null },
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    metadata: { type: nodeMetadataSchema, default: () => ({}) },
    order: { type: Number, required: true, default: 0 },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null },
    // Denormalized hierarchy refs — see ICurriculumNode for self-ref convention.
    phaseId: { type: Schema.Types.ObjectId, ref: 'CurriculumNode', default: null },
    gradeId: { type: Schema.Types.ObjectId, ref: 'CurriculumNode', default: null },
    subjectId: { type: Schema.Types.ObjectId, ref: 'CurriculumNode', default: null },
    termNumber: { type: Number, min: 1, max: 4, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

curriculumNodeSchema.index({ frameworkId: 1, parentId: 1, isDeleted: 1 });
curriculumNodeSchema.index({ frameworkId: 1, type: 1, isDeleted: 1 });
curriculumNodeSchema.index({ code: 1 }, { unique: true });
curriculumNodeSchema.index({ schoolId: 1, isDeleted: 1 });
// Fast scoped queries that filter by the denormalized hierarchy.
curriculumNodeSchema.index({ frameworkId: 1, subjectId: 1, gradeId: 1, isDeleted: 1 });

// ─── Pre-save hook: populate denormalized hierarchy refs ─────────────────────
// Walks parentId UP to root, setting phaseId/gradeId/subjectId/termNumber.
// Self-counts: a subject node sets subjectId = its own _id (and similarly for
// grade/phase). The walk is bounded to 10 hops as a safety guard — actual CAPS
// depth is 6 (phase → grade → subject → term → topic → subtopic).
//
// Fires on Model.create() / doc.save() but NOT on Model.insertMany(). Bulk
// imports rely on the backfill migration to populate these fields, and the
// migration is idempotent so it picks them up on the next boot.

const TERM_NUMBER_RE = /Term\s+(\d)/i;

function parseTermNumber(title: string): number | null {
  const match = title.match(TERM_NUMBER_RE);
  if (!match) return null;
  const n = Number(match[1]);
  if (Number.isNaN(n) || n < 1 || n > 4) return null;
  return n;
}

curriculumNodeSchema.pre('save', async function () {
  if (!this.isNew && !this.isModified('parentId') && !this.isModified('type') && !this.isModified('title')) {
    return;
  }

  let phaseId: Types.ObjectId | null = null;
  let gradeId: Types.ObjectId | null = null;
  let subjectId: Types.ObjectId | null = null;
  let termNumber: number | null = null;

  // Self-counts.
  if (this.type === 'phase') phaseId = this._id as Types.ObjectId;
  if (this.type === 'grade') gradeId = this._id as Types.ObjectId;
  if (this.type === 'subject') subjectId = this._id as Types.ObjectId;
  if (this.type === 'term') termNumber = parseTermNumber(this.title);

  let cursorParentId: Types.ObjectId | null = this.parentId ?? null;
  let hops = 0;
  const MAX_HOPS = 10;

  while (cursorParentId && hops < MAX_HOPS) {
    hops += 1;
    const parent = await mongoose
      .model<ICurriculumNode>('CurriculumNode')
      .findById(cursorParentId)
      .select('_id parentId type title')
      .lean<{ _id: Types.ObjectId; parentId: Types.ObjectId | null; type: NodeType; title: string } | null>();
    if (!parent) break;

    if (parent.type === 'phase' && !phaseId) phaseId = parent._id;
    if (parent.type === 'grade' && !gradeId) gradeId = parent._id;
    if (parent.type === 'subject' && !subjectId) subjectId = parent._id;
    if (parent.type === 'term' && termNumber === null) {
      termNumber = parseTermNumber(parent.title);
    }

    cursorParentId = parent.parentId;
  }

  this.phaseId = phaseId;
  this.gradeId = gradeId;
  this.subjectId = subjectId;
  this.termNumber = termNumber;
});

export const CurriculumNode = mongoose.model<ICurriculumNode>(
  'CurriculumNode',
  curriculumNodeSchema,
);
