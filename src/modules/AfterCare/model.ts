import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── After Care Registration ────────────────────────────────────────────────

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface IAfterCareRegistration extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  term: number;
  academicYear: number;
  daysPerWeek: WeekDay[];
  monthlyFee: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const afterCareRegistrationSchema = new Schema<IAfterCareRegistration>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    term: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: Number,
      required: true,
    },
    daysPerWeek: {
      type: [String],
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      default: [],
    },
    monthlyFee: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

afterCareRegistrationSchema.index({ schoolId: 1, studentId: 1, term: 1, academicYear: 1 });
afterCareRegistrationSchema.index({ schoolId: 1, isActive: 1 });

export const AfterCareRegistration = mongoose.model<IAfterCareRegistration>(
  'AfterCareRegistration',
  afterCareRegistrationSchema,
);

// ─── After Care Attendance ──────────────────────────────────────────────────

export interface IAfterCareAttendance extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  date: Date;
  checkInTime: string;
  checkOutTime?: string;
  checkedInBy: Types.ObjectId;
  checkedOutBy?: Types.ObjectId;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const afterCareAttendanceSchema = new Schema<IAfterCareAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: String,
      required: true,
    },
    checkOutTime: {
      type: String,
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkedOutBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

afterCareAttendanceSchema.index({ schoolId: 1, date: 1 });
afterCareAttendanceSchema.index({ studentId: 1, date: 1 });

export const AfterCareAttendance = mongoose.model<IAfterCareAttendance>(
  'AfterCareAttendance',
  afterCareAttendanceSchema,
);
