import mongoose, { Document, Schema, Types } from 'mongoose';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SourceSystem = 'd6_connect' | 'karri' | 'adam' | 'schooltool' | 'excel' | 'csv';
export type MigrationStatus = 'pending' | 'validating' | 'validated' | 'importing' | 'completed' | 'failed';
export type EntityType = 'student' | 'parent' | 'staff' | 'grade' | 'fee';

// ─── Validation Error ──────────────────────────────────────────────────────────

export interface IValidationError {
  row: number;
  field: string;
  message: string;
}

export interface IValidationResults {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  errors: IValidationError[];
}

export interface IImportResults {
  studentsCreated: number;
  parentsCreated: number;
  staffCreated: number;
  gradesCreated: number;
  skipped: number;
  errors: IValidationError[];
}

export interface IUploadedFile {
  originalName: string;
  fileUrl: string;
  fileSize: number;
}

// ─── Migration Job ─────────────────────────────────────────────────────────────

export interface IMigrationJob extends Document {
  schoolId: Types.ObjectId;
  status: MigrationStatus;
  sourceSystem: SourceSystem;
  uploadedFile: IUploadedFile;
  mapping: Record<string, string>;
  validationResults?: IValidationResults;
  importResults?: IImportResults;
  startedAt?: Date;
  completedAt?: Date;
  performedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const validationErrorSchema = new Schema<IValidationError>(
  {
    row: { type: Number, required: true },
    field: { type: String, required: true },
    message: { type: String, required: true },
  },
  { _id: false },
);

const validationResultsSchema = new Schema<IValidationResults>(
  {
    totalRows: { type: Number, required: true },
    validRows: { type: Number, required: true },
    invalidRows: { type: Number, required: true },
    duplicates: { type: Number, required: true },
    errors: { type: [validationErrorSchema], default: [] },
  },
  { _id: false },
);

const importResultsSchema = new Schema<IImportResults>(
  {
    studentsCreated: { type: Number, default: 0 },
    parentsCreated: { type: Number, default: 0 },
    staffCreated: { type: Number, default: 0 },
    gradesCreated: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    errors: { type: [validationErrorSchema], default: [] },
  },
  { _id: false },
);

const uploadedFileSchema = new Schema<IUploadedFile>(
  {
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
  },
  { _id: false },
);

const migrationJobSchema = new Schema<IMigrationJob>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    status: {
      type: String,
      enum: ['pending', 'validating', 'validated', 'importing', 'completed', 'failed'],
      default: 'pending',
    },
    sourceSystem: {
      type: String,
      enum: ['d6_connect', 'karri', 'adam', 'schooltool', 'excel', 'csv'],
      required: true,
    },
    uploadedFile: { type: uploadedFileSchema, required: true },
    mapping: { type: Schema.Types.Mixed, default: {} },
    validationResults: { type: validationResultsSchema },
    importResults: { type: importResultsSchema },
    startedAt: { type: Date },
    completedAt: { type: Date },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

migrationJobSchema.index({ schoolId: 1, createdAt: -1 });
migrationJobSchema.index({ status: 1 });

export const MigrationJob = mongoose.model<IMigrationJob>('MigrationJob', migrationJobSchema);

// ─── Migration Template ────────────────────────────────────────────────────────

export interface IFieldMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
}

export interface IMigrationTemplate extends Document {
  sourceSystem: SourceSystem;
  entityType: EntityType;
  fieldMappings: IFieldMapping[];
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fieldMappingSchema = new Schema<IFieldMapping>(
  {
    sourceField: { type: String, required: true },
    targetField: { type: String, required: true },
    transform: { type: String },
  },
  { _id: false },
);

const migrationTemplateSchema = new Schema<IMigrationTemplate>(
  {
    sourceSystem: {
      type: String,
      enum: ['d6_connect', 'karri', 'adam', 'schooltool', 'excel', 'csv'],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['student', 'parent', 'staff', 'grade', 'fee'],
      required: true,
    },
    fieldMappings: { type: [fieldMappingSchema], required: true },
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

migrationTemplateSchema.index({ sourceSystem: 1, entityType: 1 });

export const MigrationTemplate = mongoose.model<IMigrationTemplate>(
  'MigrationTemplate',
  migrationTemplateSchema,
);
