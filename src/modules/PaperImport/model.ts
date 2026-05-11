import mongoose, { Schema, Document, Types } from 'mongoose';

export const JOB_STATUSES = ['pending', 'running', 'completed', 'failed', 'cancelled'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_STAGES = ['uploading', 'segmenting', 'transcribing', 'enhancing', 'finalising'] as const;
export type JobStage = (typeof JOB_STAGES)[number];

export const SOURCE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export type SourceMimeType = (typeof SOURCE_MIME_TYPES)[number];

export interface IPaperImportJob extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  status: JobStatus;
  progress: {
    stage: JobStage;
    pagesTotal: number;
    pagesDone: number;
    message: string;
  };
  curriculum: {
    subjectId: Types.ObjectId;
    gradeId: Types.ObjectId;
    term: number;
    curriculumNodeId: Types.ObjectId;
  };
  options: {
    generateAnswers: boolean;
    addHints: boolean;
    addWorkedExample: boolean;
    addExplanations: boolean;
    instructions?: string;
  };
  source: {
    filename: string;
    mimeType: SourceMimeType;
    sizeBytes: number;
    pageCount: number;
    storagePath: string;
  };
  resultResourceIds: Types.ObjectId[];
  error?: { code: string; message: string };
  isDeleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema(
  {
    stage: { type: String, enum: JOB_STAGES, default: 'uploading' },
    pagesTotal: { type: Number, default: 0 },
    pagesDone: { type: Number, default: 0 },
    message: { type: String, default: '' },
  },
  { _id: false },
);

const curriculumSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    term: { type: Number, required: true },
    curriculumNodeId: { type: Schema.Types.ObjectId, ref: 'CurriculumNode', required: true },
  },
  { _id: false },
);

const optionsSchema = new Schema(
  {
    generateAnswers: { type: Boolean, default: true },
    addHints: { type: Boolean, default: true },
    addWorkedExample: { type: Boolean, default: true },
    addExplanations: { type: Boolean, default: true },
    instructions: { type: String },
  },
  { _id: false },
);

const sourceSchema = new Schema(
  {
    filename: { type: String, required: true },
    mimeType: { type: String, enum: SOURCE_MIME_TYPES, required: true },
    sizeBytes: { type: Number, required: true },
    pageCount: { type: Number, default: 0 },
    storagePath: { type: String, required: true },
  },
  { _id: false },
);

const paperImportJobSchema = new Schema<IPaperImportJob>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: JOB_STATUSES, default: 'pending' },
    progress: { type: progressSchema, default: () => ({}) },
    curriculum: { type: curriculumSchema, required: true },
    options: { type: optionsSchema, default: () => ({}) },
    source: { type: sourceSchema, required: true },
    resultResourceIds: [{ type: Schema.Types.ObjectId, ref: 'ContentResource' }],
    error: {
      code: { type: String },
      message: { type: String },
    },
    isDeleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

paperImportJobSchema.index({ schoolId: 1, teacherId: 1, createdAt: -1 });
paperImportJobSchema.index({ status: 1, updatedAt: 1 });

export const PaperImportJob = mongoose.model<IPaperImportJob>(
  'PaperImportJob',
  paperImportJobSchema,
);
