import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMarkingQuestion {
  questionNumber: string;
  studentAnswer: string;
  correctAnswer: string;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
  rationale?: string;
}

export interface PaperMarkingImage {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  pageNumber: number;
}

export interface IPaperMarking extends Document {
  paperId: Types.ObjectId;
  paperType: 'generated' | 'assessment';
  studentId?: Types.ObjectId;
  studentName: string;
  teacherId: Types.ObjectId;
  schoolId: Types.ObjectId;
  imageCount: number;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  questions: IMarkingQuestion[];
  status: 'processing' | 'completed' | 'needs_review' | 'failed' | 'published';
  gradebookEntryId?: Types.ObjectId;
  errorMessage?: string;
  isDeleted: boolean;
  extractedHeader: string | null;
  paperMismatch: boolean;
  mismatchReason: string | null;
  aiRawResult: Record<string, unknown> | null;
  images: PaperMarkingImage[];
  paperVersion: number;
  classId?: Types.ObjectId | null;
  batchId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const paperMarkingImageSchema = new Schema<PaperMarkingImage>(
  {
    filename: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    sizeBytes: { type: Number, required: true, min: 0 },
    pageNumber: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const markingQuestionSchema = new Schema<IMarkingQuestion>(
  {
    questionNumber: { type: String, required: true },
    studentAnswer: { type: String, default: '' },
    correctAnswer: { type: String, default: '' },
    marksAwarded: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, min: 0 },
    feedback: { type: String, default: '' },
    rationale: { type: String },
  },
  { _id: false },
);

const paperMarkingSchema = new Schema<IPaperMarking>(
  {
    paperId: { type: Schema.Types.ObjectId, required: true },
    paperType: { type: String, enum: ['generated', 'assessment'], required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    studentName: { type: String, required: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    imageCount: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    questions: [markingQuestionSchema],
    status: {
      type: String,
      enum: ['processing', 'completed', 'needs_review', 'failed', 'published'],
      default: 'processing',
    },
    gradebookEntryId: { type: Schema.Types.ObjectId, ref: 'Mark' },
    errorMessage: { type: String },
    isDeleted: { type: Boolean, default: false, index: true },
    extractedHeader: { type: String, default: null },
    paperMismatch: { type: Boolean, default: false },
    mismatchReason: { type: String, default: null },
    aiRawResult: { type: Schema.Types.Mixed, default: null },
    images: { type: [paperMarkingImageSchema], default: [] },
    paperVersion: { type: Number, required: true, default: 1, min: 1 },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', default: null },
    batchId: { type: Schema.Types.ObjectId, ref: 'MarkingBatch', default: null },
  },
  { timestamps: true },
);

paperMarkingSchema.index({ paperId: 1, schoolId: 1 });
paperMarkingSchema.index({ teacherId: 1, schoolId: 1 });
paperMarkingSchema.index({ studentId: 1, paperId: 1 });
paperMarkingSchema.index({ batchId: 1 });

export const PaperMarking = mongoose.model<IPaperMarking>('PaperMarking', paperMarkingSchema);
