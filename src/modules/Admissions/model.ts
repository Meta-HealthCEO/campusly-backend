import mongoose, { Schema, type Document, type Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type AdmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'interview_scheduled'
  | 'accepted'
  | 'waitlisted'
  | 'rejected';

export type ApplicationFeeStatus = 'not_required' | 'pending' | 'paid';
export type Gender = 'male' | 'female' | 'other';
export type ParentRelationship = 'mother' | 'father' | 'guardian' | 'other';
export type InterviewType = 'in_person' | 'virtual';

export const ADMISSION_STATUSES: AdmissionStatus[] = [
  'submitted', 'under_review', 'interview_scheduled', 'accepted', 'waitlisted', 'rejected',
];

// ─── Status History ───────────────────────────────────────────────────────────

export interface IStatusHistoryEntry {
  status: AdmissionStatus;
  date: Date;
  changedBy?: Types.ObjectId;
  notes?: string;
}

// ─── Document sub-schema ──────────────────────────────────────────────────────

export interface IDocumentEntry {
  url: string;
  uploadedAt: Date;
}

export interface IDocuments {
  birthCertificate?: IDocumentEntry;
  previousReportCard?: IDocumentEntry;
  proofOfResidence?: IDocumentEntry;
}

// ─── Address ──────────────────────────────────────────────────────────────────

export interface IAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

// ─── Application ──────────────────────────────────────────────────────────────

export interface IAdmissionApplication extends Document {
  schoolId: Types.ObjectId;
  applicationNumber: string;
  trackingToken: string;
  status: AdmissionStatus;
  applicantFirstName: string;
  applicantLastName: string;
  dateOfBirth: Date;
  gender: Gender;
  gradeApplyingFor: number;
  yearApplyingFor: number;
  previousSchool?: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  parentIdNumber?: string;
  parentRelationship: ParentRelationship;
  parentUserId?: Types.ObjectId;
  address: IAddress;
  specialNeeds?: string;
  documents: IDocuments;
  applicationFeeStatus: ApplicationFeeStatus;
  applicationFeeInvoiceId?: Types.ObjectId;
  interviewDate?: Date;
  interviewType?: InterviewType;
  interviewerName?: string;
  interviewVenue?: string;
  interviewNotes?: string;
  statusHistory: IStatusHistoryEntry[];
  internalNotes?: string;
  additionalNotes?: string;
  reviewedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, required: true, enum: ADMISSION_STATUSES },
    date: { type: Date, required: true, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { _id: false },
);

const documentEntrySchema = new Schema<IDocumentEntry>(
  {
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false },
);

const applicationSchema = new Schema<IAdmissionApplication>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    applicationNumber: { type: String, required: true, unique: true },
    trackingToken: { type: String, required: true, unique: true },
    status: { type: String, enum: ADMISSION_STATUSES, default: 'submitted' },
    applicantFirstName: { type: String, required: true, trim: true },
    applicantLastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    gradeApplyingFor: { type: Number, required: true, min: 0, max: 12 },
    yearApplyingFor: { type: Number, required: true },
    previousSchool: { type: String, trim: true },
    parentFirstName: { type: String, required: true, trim: true },
    parentLastName: { type: String, required: true, trim: true },
    parentEmail: { type: String, required: true, lowercase: true, trim: true },
    parentPhone: { type: String, required: true, trim: true },
    parentIdNumber: { type: String, trim: true },
    parentRelationship: { type: String, enum: ['mother', 'father', 'guardian', 'other'] },
    parentUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    address: { type: addressSchema, required: true },
    specialNeeds: { type: String },
    documents: {
      birthCertificate: documentEntrySchema,
      previousReportCard: documentEntrySchema,
      proofOfResidence: documentEntrySchema,
    },
    applicationFeeStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid'],
      default: 'not_required',
    },
    applicationFeeInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    interviewDate: { type: Date },
    interviewType: { type: String, enum: ['in_person', 'virtual'] },
    interviewerName: { type: String },
    interviewVenue: { type: String },
    interviewNotes: { type: String },
    statusHistory: [statusHistorySchema],
    internalNotes: { type: String },
    additionalNotes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

applicationSchema.index({ schoolId: 1, applicationNumber: 1 }, { unique: true });
applicationSchema.index({ trackingToken: 1 }, { unique: true });
applicationSchema.index({ schoolId: 1, status: 1, yearApplyingFor: 1 });
applicationSchema.index({ schoolId: 1, gradeApplyingFor: 1, yearApplyingFor: 1 });
applicationSchema.index({ parentEmail: 1, schoolId: 1 });

export const AdmissionApplication = mongoose.model<IAdmissionApplication>(
  'AdmissionApplication',
  applicationSchema,
);

// ─── GradeCapacity ────────────────────────────────────────────────────────────

export interface IGradeCapacity extends Document {
  schoolId: Types.ObjectId;
  grade: number;
  maxCapacity: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gradeCapacitySchema = new Schema<IGradeCapacity>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    grade: { type: Number, required: true, min: 0, max: 12 },
    maxCapacity: { type: Number, required: true, min: 1 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

gradeCapacitySchema.index({ schoolId: 1, grade: 1 }, { unique: true });

export const GradeCapacity = mongoose.model<IGradeCapacity>(
  'GradeCapacity',
  gradeCapacitySchema,
);
