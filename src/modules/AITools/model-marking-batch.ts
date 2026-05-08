import mongoose, { Schema, Document, Types } from 'mongoose';

export type MarkingBatchStatus = 'extracting' | 'reviewing' | 'marking' | 'complete' | 'failed';
export type MarkingBatchPaperType = 'generated' | 'assessment';

export interface MarkingBatchAmbiguousMatch {
  imageFilenames: string[];
  extractedName: string | null;
  extractedAdmissionNumber: string | null;
  suggestedStudentIds: Types.ObjectId[];
  confidence: number;
}

export interface MarkingBatchPageExtract {
  filename: string;
  pageNumber: number;
  extractedName: string | null;
  extractedAdmissionNumber: string | null;
  extractedSectionLabel: string | null;
  confidence: number;
  matchedStudentId: Types.ObjectId | null;
}

export interface IMarkingBatch extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  paperId: Types.ObjectId;
  paperType: MarkingBatchPaperType;
  classId: Types.ObjectId;
  imageCount: number;
  status: MarkingBatchStatus;
  pageExtracts: MarkingBatchPageExtract[];
  matchedCount: number;
  unmatchedCount: number;
  ambiguousMatches: MarkingBatchAmbiguousMatch[];
  errorMessage: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ambiguousMatchSchema = new Schema<MarkingBatchAmbiguousMatch>(
  {
    imageFilenames: { type: [String], default: [] },
    extractedName: { type: String, default: null },
    extractedAdmissionNumber: { type: String, default: null },
    suggestedStudentIds: { type: [Schema.Types.ObjectId], ref: 'Student', default: [] },
    confidence: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

const pageExtractSchema = new Schema<MarkingBatchPageExtract>(
  {
    filename: { type: String, required: true },
    pageNumber: { type: Number, required: true, min: 1 },
    extractedName: { type: String, default: null },
    extractedAdmissionNumber: { type: String, default: null },
    extractedSectionLabel: { type: String, default: null },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    matchedStudentId: { type: Schema.Types.ObjectId, ref: 'Student', default: null },
  },
  { _id: false },
);

const markingBatchSchema = new Schema<IMarkingBatch>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paperId: { type: Schema.Types.ObjectId, required: true },
    paperType: { type: String, enum: ['generated', 'assessment'], required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    imageCount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['extracting', 'reviewing', 'marking', 'complete', 'failed'],
      default: 'extracting',
    },
    pageExtracts: { type: [pageExtractSchema], default: [] },
    matchedCount: { type: Number, default: 0, min: 0 },
    unmatchedCount: { type: Number, default: 0, min: 0 },
    ambiguousMatches: { type: [ambiguousMatchSchema], default: [] },
    errorMessage: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

markingBatchSchema.index({ schoolId: 1, teacherId: 1, createdAt: -1 });
markingBatchSchema.index({ paperId: 1, classId: 1 });
markingBatchSchema.index({ status: 1, isDeleted: 1 });

export const MarkingBatch = mongoose.model<IMarkingBatch>('MarkingBatch', markingBatchSchema);
