import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Benchmark Target Shape ────────────────────────────────────────────────

export interface IBenchmarkTarget {
  district: number;
  national: number;
  schoolTarget: number;
}

export interface IBenchmarks {
  attendanceRate: IBenchmarkTarget;
  passRate: IBenchmarkTarget;
  feeCollectionRate: IBenchmarkTarget;
  teacherAttendanceRate: IBenchmarkTarget;
  homeworkCompletionRate: IBenchmarkTarget;
}

export interface ISchoolBenchmark extends Document {
  schoolId: Types.ObjectId;
  benchmarks: IBenchmarks;
  annualBudget: number;
  monthlyExpenseEstimate: number;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const benchmarkTargetSchema = {
  district: { type: Number, default: 0 },
  national: { type: Number, default: 0 },
  schoolTarget: { type: Number, default: 0 },
};

const schoolBenchmarkSchema = new Schema<ISchoolBenchmark>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    benchmarks: {
      attendanceRate: benchmarkTargetSchema,
      passRate: benchmarkTargetSchema,
      feeCollectionRate: benchmarkTargetSchema,
      teacherAttendanceRate: benchmarkTargetSchema,
      homeworkCompletionRate: benchmarkTargetSchema,
    },
    annualBudget: { type: Number, default: 0 },
    monthlyExpenseEstimate: { type: Number, default: 0 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

schoolBenchmarkSchema.index({ schoolId: 1 }, { unique: true });

export const SchoolBenchmark = mongoose.model<ISchoolBenchmark>(
  'SchoolBenchmark',
  schoolBenchmarkSchema,
);
