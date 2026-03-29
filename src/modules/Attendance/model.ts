import mongoose, { Schema, Document, Types } from 'mongoose';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface IAttendance extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  date: Date;
  period: number;
  status: AttendanceStatus;
  recordedBy: Types.ObjectId;
  notes?: string;
  earlyDeparture: boolean;
  reason?: string;
  verifiedByParent: boolean;
  arrivalTime?: string;
  departureTime?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
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
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
    },
    earlyDeparture: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
    },
    verifiedByParent: {
      type: Boolean,
      default: false,
    },
    arrivalTime: {
      type: String,
    },
    departureTime: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

attendanceSchema.index({ studentId: 1, date: 1, period: 1 }, { unique: true });
attendanceSchema.index({ classId: 1, date: 1 });
attendanceSchema.index({ schoolId: 1, date: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
