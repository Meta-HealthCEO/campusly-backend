import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMonthlyBreakdown {
  month: string;        // "2026-01"
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface IAttendanceStats extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  gradeId: Types.ObjectId;

  // Running totals for current academic year (Jan–Dec)
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;       // ((present + late) / totalDays) * 100

  // Monthly breakdown for trend charts
  monthly: IMonthlyBreakdown[];

  // Streak tracking (based on period-1 records)
  currentStreak: number;    // consecutive days present
  longestStreak: number;
  lastAttendanceDate: string;  // YYYY-MM-DD
  lastStatus: string;

  // Flags
  isChronicAbsentee: boolean;  // percentage < 80%

  updatedAt: Date;
  createdAt: Date;
}

const monthlyBreakdownSchema = new Schema<IMonthlyBreakdown>(
  {
    month: { type: String, required: true },
    totalDays: { type: Number, required: true, default: 0 },
    present: { type: Number, required: true, default: 0 },
    absent: { type: Number, required: true, default: 0 },
    late: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const attendanceStatsSchema = new Schema<IAttendanceStats>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
    },
    totalDays: { type: Number, required: true, default: 0 },
    present: { type: Number, required: true, default: 0 },
    absent: { type: Number, required: true, default: 0 },
    late: { type: Number, required: true, default: 0 },
    excused: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    monthly: { type: [monthlyBreakdownSchema], default: [] },
    currentStreak: { type: Number, required: true, default: 0 },
    longestStreak: { type: Number, required: true, default: 0 },
    lastAttendanceDate: { type: String, default: '' },
    lastStatus: { type: String, default: '' },
    isChronicAbsentee: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

// One stats doc per student
attendanceStatsSchema.index({ studentId: 1 }, { unique: true });
// School-wide queries
attendanceStatsSchema.index({ schoolId: 1 });
// Quick filter for chronic absentee reports
attendanceStatsSchema.index({ schoolId: 1, isChronicAbsentee: 1 });
// Class-level queries
attendanceStatsSchema.index({ classId: 1, schoolId: 1 });

export const AttendanceStats = mongoose.model<IAttendanceStats>(
  'AttendanceStats',
  attendanceStatsSchema,
);
