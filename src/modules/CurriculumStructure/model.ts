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
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

curriculumNodeSchema.index({ frameworkId: 1, parentId: 1, isDeleted: 1 });
curriculumNodeSchema.index({ frameworkId: 1, type: 1, isDeleted: 1 });
curriculumNodeSchema.index({ code: 1 }, { unique: true });
curriculumNodeSchema.index({ schoolId: 1, isDeleted: 1 });

export const CurriculumNode = mongoose.model<ICurriculumNode>(
  'CurriculumNode',
  curriculumNodeSchema,
);
