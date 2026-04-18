import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFitnessTestResult extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  teamId?: Types.ObjectId;
  sportCode?: string;
  testType: string;
  value: number;
  unit: string;
  date: Date;
  notes?: string;
  testedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fitnessTestSchema = new Schema<IFitnessTestResult>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'SportTeam' },
    sportCode: { type: String, trim: true },
    testType: { type: String, required: true, trim: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String, trim: true },
    testedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

fitnessTestSchema.index({ schoolId: 1, studentId: 1, testType: 1, date: -1 });
fitnessTestSchema.index({ schoolId: 1, teamId: 1, date: -1 });

export const FitnessTestResult = mongoose.model<IFitnessTestResult>(
  'FitnessTestResult',
  fitnessTestSchema,
);

export interface IBiometricMeasurement extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  date: Date;
  weightKg?: number;
  heightCm?: number;
  bodyFatPct?: number;
  restingHrBpm?: number;
  notes?: string;
  recordedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const biometricSchema = new Schema<IBiometricMeasurement>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, required: true },
    weightKg: { type: Number, min: 0 },
    heightCm: { type: Number, min: 0 },
    bodyFatPct: { type: Number, min: 0, max: 100 },
    restingHrBpm: { type: Number, min: 0 },
    notes: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

biometricSchema.index({ schoolId: 1, studentId: 1, date: -1 });

export const BiometricMeasurement = mongoose.model<IBiometricMeasurement>(
  'BiometricMeasurement',
  biometricSchema,
);
