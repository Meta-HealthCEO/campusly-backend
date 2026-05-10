import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const TEXTBOOK_STATUSES = ['draft', 'published', 'archived'] as const;
export type TextbookStatus = (typeof TEXTBOOK_STATUSES)[number];

// ─── ChapterResource Subdoc ────────────────────────────────────────────────

export interface IChapterResource {
  resourceId: Types.ObjectId;
  order: number;
}

const chapterResourceSchema = new Schema<IChapterResource>(
  {
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'ContentResource',
      required: true,
    },
    order: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

// ─── Chapter Subdoc ────────────────────────────────────────────────────────

export interface IChapter {
  _id: Types.ObjectId;
  title: string;
  description: string;
  curriculumNodeId: Types.ObjectId | null;
  order: number;
  resources: IChapterResource[];
}

const chapterSchema = new Schema<IChapter>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    curriculumNodeId: {
      type: Schema.Types.ObjectId,
      ref: 'CurriculumNode',
      default: null,
    },
    order: { type: Number, required: true, default: 0 },
    resources: { type: [chapterResourceSchema], default: [] },
  },
  { _id: true },
);

// ─── Textbook ──────────────────────────────────────────────────────────────

export interface ITextbook extends Document {
  title: string;
  description: string;
  frameworkId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  // Denormalized CurriculumNode refs — mirror the pattern on CurriculumNode
  // so a topic node (which references CurriculumNode subject/grade NODES, not
  // academic Subject/Grade collections) can be resolved to its textbook.
  // Populated by the `textbook-denormalize-curriculum-refs` backfill migration.
  subjectNodeId?: Types.ObjectId | null;
  gradeNodeId?: Types.ObjectId | null;
  coverImageUrl: string;
  chapters: mongoose.Types.DocumentArray<IChapter>;
  status: TextbookStatus;
  schoolId: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const textbookSchema = new Schema<ITextbook>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    frameworkId: {
      type: Schema.Types.ObjectId,
      ref: 'CurriculumFramework',
      required: true,
    },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    // Denormalized CurriculumNode refs — see ITextbook for rationale.
    subjectNodeId: {
      type: Schema.Types.ObjectId,
      ref: 'CurriculumNode',
      default: null,
    },
    gradeNodeId: {
      type: Schema.Types.ObjectId,
      ref: 'CurriculumNode',
      default: null,
    },
    coverImageUrl: { type: String, default: '' },
    chapters: { type: [chapterSchema], default: [] },
    status: {
      type: String,
      enum: TEXTBOOK_STATUSES,
      default: 'draft',
    },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ─── Indexes ───────────────────────────────────────────────────────────────

textbookSchema.index({ schoolId: 1, status: 1, isDeleted: 1 });
textbookSchema.index({ subjectId: 1, gradeId: 1, isDeleted: 1 });
textbookSchema.index({ frameworkId: 1, isDeleted: 1 });
// Lookup path used by AI-generator textbook-context resolver: given a topic's
// denormalized subject/grade NODE refs, find the matching textbook(s).
textbookSchema.index({ subjectNodeId: 1, gradeNodeId: 1, isDeleted: 1 });

export const Textbook = mongoose.model<ITextbook>('Textbook', textbookSchema);
