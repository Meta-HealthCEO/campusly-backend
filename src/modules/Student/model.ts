import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IMedicalAidInfo {
  provider: string;
  memberNumber: string;
  mainMember: string;
}

export interface IMedicalProfile {
  allergies: string[];
  conditions: string[];
  bloodType?: string;
  emergencyContacts: IEmergencyContact[];
  medicalAidInfo?: IMedicalAidInfo;
}

export type EnrollmentStatus =
  | 'active'
  | 'transferred'
  | 'graduated'
  | 'expelled'
  | 'withdrawn';

export interface IStudent extends Document {
  userId: Types.ObjectId;
  schoolId: Types.ObjectId;
  gradeId: Types.ObjectId;
  classId: Types.ObjectId;
  admissionNumber: string;
  guardianIds: Types.ObjectId[];
  enrollmentDate: Date;
  enrollmentStatus: EnrollmentStatus;
  medicalProfile: IMedicalProfile;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  previousSchool?: string;
  homeLanguage?: string;
  additionalLanguages: string[];
  transportRequired: boolean;
  afterCareRequired: boolean;
  saIdNumber?: string;
  luritsNumber?: string;
  photoUrl?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

const medicalAidInfoSchema = new Schema<IMedicalAidInfo>(
  {
    provider: { type: String, required: true },
    memberNumber: { type: String, required: true },
    mainMember: { type: String, required: true },
  },
  { _id: false },
);

const medicalProfileSchema = new Schema<IMedicalProfile>(
  {
    allergies: { type: [String], default: [] },
    conditions: { type: [String], default: [] },
    bloodType: { type: String },
    emergencyContacts: { type: [emergencyContactSchema], default: [] },
    medicalAidInfo: { type: medicalAidInfoSchema },
  },
  { _id: false },
);

const studentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    admissionNumber: {
      type: String,
      required: true,
      trim: true,
    },
    guardianIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Parent',
      default: [],
    },
    enrollmentDate: {
      type: Date,
      default: () => new Date(),
    },
    enrollmentStatus: {
      type: String,
      enum: ['active', 'transferred', 'graduated', 'expelled', 'withdrawn'],
      default: 'active',
    },
    medicalProfile: {
      type: medicalProfileSchema,
      default: () => ({
        allergies: [],
        conditions: [],
        emergencyContacts: [],
      }),
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    previousSchool: {
      type: String,
      trim: true,
    },
    homeLanguage: {
      type: String,
      trim: true,
    },
    additionalLanguages: {
      type: [String],
      default: [],
    },
    transportRequired: {
      type: Boolean,
      default: false,
    },
    afterCareRequired: {
      type: Boolean,
      default: false,
    },
    saIdNumber: {
      type: String,
      trim: true,
    },
    luritsNumber: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });
studentSchema.index({ userId: 1 });
studentSchema.index({ gradeId: 1, classId: 1 });
studentSchema.index({ schoolId: 1, isDeleted: 1, createdAt: -1 });

export const Student = mongoose.model<IStudent>('Student', studentSchema);
