import mongoose, { Schema, Document, Types } from 'mongoose';

export type EnrollmentStatus =
  | 'active'
  | 'transferred'
  | 'graduated'
  | 'expelled'
  | 'withdrawn';

export interface IStudent extends Document {
  userId?: Types.ObjectId;
  schoolId: Types.ObjectId;
  gradeId: Types.ObjectId;
  classId: Types.ObjectId;
  admissionNumber: string;
  guardianIds: Types.ObjectId[];
  subjectClassIds: Types.ObjectId[];
  enrollmentDate: Date;
  enrollmentStatus: EnrollmentStatus;
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

const studentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
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
    subjectClassIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Class',
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
studentSchema.index({ subjectClassIds: 1, schoolId: 1 });
studentSchema.index({ schoolId: 1, isDeleted: 1, createdAt: -1 });

export const Student = mongoose.model<IStudent>('Student', studentSchema);
