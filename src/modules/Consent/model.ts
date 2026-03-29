import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Consent Form ─────────────────────────────────────────────────────────────

export type ConsentFormType = 'trip' | 'medical' | 'general' | 'photo' | 'data';

export interface IConsentForm extends Document {
  schoolId: Types.ObjectId;
  title: string;
  description?: string;
  type: ConsentFormType;
  targetStudents: Types.ObjectId[];
  requiresBothParents: boolean;
  expiryDate?: Date;
  attachmentUrl?: string;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const consentFormSchema = new Schema<IConsentForm>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ['trip', 'medical', 'general', 'photo', 'data'],
      required: true,
    },
    targetStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    requiresBothParents: {
      type: Boolean,
      default: false,
    },
    expiryDate: {
      type: Date,
    },
    attachmentUrl: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

consentFormSchema.index({ schoolId: 1, type: 1 });
consentFormSchema.index({ schoolId: 1, createdAt: -1 });

export const ConsentForm = mongoose.model<IConsentForm>('ConsentForm', consentFormSchema);

// ─── Consent Response ─────────────────────────────────────────────────────────

export type ConsentResponseStatus = 'granted' | 'denied';

export interface IConsentResponse extends Document {
  formId: Types.ObjectId;
  studentId: Types.ObjectId;
  parentId: Types.ObjectId;
  response: ConsentResponseStatus;
  signedAt: Date;
  ipAddress?: string;
  signature?: string;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const consentResponseSchema = new Schema<IConsentResponse>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'ConsentForm',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
    },
    response: {
      type: String,
      enum: ['granted', 'denied'],
      required: true,
    },
    signedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    signature: {
      type: String,
    },
    notes: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

consentResponseSchema.index({ formId: 1, studentId: 1, parentId: 1 }, { unique: true });
consentResponseSchema.index({ formId: 1 });

export const ConsentResponse = mongoose.model<IConsentResponse>('ConsentResponse', consentResponseSchema);
