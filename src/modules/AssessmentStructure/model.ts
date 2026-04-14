import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Line Item ────────────────────────────────────────────────────────────────

export type LineItemStatus = 'pending' | 'capturing' | 'closed';

export interface ILineItem {
  _id: Types.ObjectId;
  name: string;
  totalMarks: number;
  weight?: number;
  date?: Date;
  assessmentId?: Types.ObjectId;
  status: LineItemStatus;
}

const lineItemSchema = new Schema<ILineItem>(
  {
    name: { type: String, required: true, trim: true },
    totalMarks: { type: Number, required: true, min: 0 },
    weight: { type: Number, min: 0 },
    date: { type: Date },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment' },
    status: {
      type: String,
      enum: ['pending', 'capturing', 'closed'],
      default: 'pending',
    },
  },
  { _id: true },
);

// ─── Category ─────────────────────────────────────────────────────────────────

export type CategoryType = 'test' | 'exam' | 'assignment' | 'practical' | 'project' | 'other';

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  type: CategoryType;
  weight: number;
  lineItems: ILineItem[];
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['test', 'exam', 'assignment', 'practical', 'project', 'other'],
      required: true,
    },
    weight: { type: Number, required: true, min: 0 },
    lineItems: { type: [lineItemSchema], default: [] },
  },
  { _id: true },
);

// ─── AssessmentStructure ──────────────────────────────────────────────────────

export type AssessmentStructureStatus = 'draft' | 'active' | 'locked';

export interface IAssessmentStructure extends Document {
  teacherId: Types.ObjectId;
  schoolId: Types.ObjectId | null;
  subjectId: Types.ObjectId | null;
  subjectName: string;
  classId: Types.ObjectId | null;
  gradeId: Types.ObjectId | null;
  term: 1 | 2 | 3 | 4;
  academicYear: number;
  name: string;
  studentIds: Types.ObjectId[];
  categories: ICategory[];
  status: AssessmentStructureStatus;
  lockedAt?: Date;
  unlockedBy?: Types.ObjectId;
  unlockReason?: string;
  unlockedAt?: Date;
  isTemplate: boolean;
  templateName?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentStructureSchema = new Schema<IAssessmentStructure>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', default: null },
    subjectName: { type: String, required: true, trim: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', default: null },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', default: null },
    term: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },
    academicYear: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    studentIds: { type: [Schema.Types.ObjectId], ref: 'Student', default: [] },
    categories: { type: [categorySchema], default: [] },
    status: {
      type: String,
      enum: ['draft', 'active', 'locked'],
      default: 'draft',
    },
    lockedAt: { type: Date },
    unlockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    unlockReason: { type: String, trim: true },
    unlockedAt: { type: Date },
    isTemplate: { type: Boolean, default: false },
    templateName: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Fast multi-tenant lookups
assessmentStructureSchema.index({ teacherId: 1, schoolId: 1, isDeleted: 1 });

// Unique structure per teacher/subject/class/term/year (non-template only)
assessmentStructureSchema.index(
  { teacherId: 1, subjectId: 1, classId: 1, term: 1, academicYear: 1 },
  {
    unique: true,
    partialFilterExpression: { isTemplate: false, isDeleted: false },
    name: 'unique_structure_per_context',
  },
);

// Template listing
assessmentStructureSchema.index({ teacherId: 1, isTemplate: 1, isDeleted: 1 });

export const AssessmentStructure = mongoose.model<IAssessmentStructure>(
  'AssessmentStructure',
  assessmentStructureSchema,
);
