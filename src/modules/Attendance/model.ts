import mongoose, { Schema, Document, Types } from 'mongoose';
import { AttendanceStatus } from '../../common/enums.js';

export type { AttendanceStatus };

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
      enum: Object.values(AttendanceStatus),
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

attendanceSchema.index({ studentId: 1, schoolId: 1, date: 1, period: 1 }, { unique: true });
attendanceSchema.index({ classId: 1, date: 1 });
attendanceSchema.index({ schoolId: 1, date: 1 });
attendanceSchema.index({ schoolId: 1, isDeleted: 1, createdAt: -1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);

// ─── Discipline / Incident ──────────────────────────────────────────────────

export type IncidentType = 'misconduct' | 'bullying' | 'vandalism' | 'truancy' | 'dress_code' | 'late' | 'other';
export type IncidentSeverity = 'minor' | 'moderate' | 'serious' | 'critical';
export type IncidentOutcome = 'warning' | 'detention' | 'suspension' | 'expulsion' | 'counselling' | 'community_service';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'escalated';

export interface IDiscipline extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  reportedBy: Types.ObjectId;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  witnesses: string[];
  actionTaken?: string;
  parentNotified: boolean;
  parentNotifiedDate?: Date;
  meetingScheduled: boolean;
  meetingDate?: Date;
  outcome?: IncidentOutcome;
  detentionDate?: Date;
  detentionServed: boolean;
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
  status: IncidentStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const disciplineSchema = new Schema<IDiscipline>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['misconduct', 'bullying', 'vandalism', 'truancy', 'dress_code', 'late', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'serious', 'critical'],
      required: true,
    },
    description: { type: String, required: true },
    witnesses: {
      type: [String],
      default: [],
      validate: [(v: string[]) => v.length <= 10, 'Maximum 10 witnesses allowed'],
    },
    actionTaken: { type: String },
    parentNotified: { type: Boolean, default: false },
    parentNotifiedDate: { type: Date },
    meetingScheduled: { type: Boolean, default: false },
    meetingDate: { type: Date },
    outcome: {
      type: String,
      enum: ['warning', 'detention', 'suspension', 'expulsion', 'counselling', 'community_service'],
    },
    detentionDate: { type: Date },
    detentionServed: { type: Boolean, default: false },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    followUpNotes: { type: String },
    status: {
      type: String,
      enum: ['reported', 'investigating', 'resolved', 'escalated'],
      default: 'reported',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

disciplineSchema.index({ studentId: 1, schoolId: 1 });
disciplineSchema.index({ schoolId: 1, status: 1 });
disciplineSchema.index({ schoolId: 1, type: 1 });

export const Discipline = mongoose.model<IDiscipline>('Discipline', disciplineSchema);

// ─── Merit / Demerit ────────────────────────────────────────────────────────

export type MeritType = 'merit' | 'demerit';
export type MeritCategory = 'academic' | 'behaviour' | 'sport' | 'service' | 'leadership';

export interface IMerit extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  awardedBy: Types.ObjectId;
  type: MeritType;
  points: number;
  category: MeritCategory;
  reason: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const meritSchema = new Schema<IMerit>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    awardedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['merit', 'demerit'], required: true },
    points: { type: Number, required: true },
    category: {
      type: String,
      enum: ['academic', 'behaviour', 'sport', 'service', 'leadership'],
      required: true,
    },
    reason: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

meritSchema.index({ studentId: 1, schoolId: 1 });
meritSchema.index({ schoolId: 1, type: 1 });

export const Merit = mongoose.model<IMerit>('Merit', meritSchema);

// ─── Substitute Teacher ─────────────────────────────────────────────────────

export type SubstituteStatus = 'pending' | 'approved' | 'declined' | 'cancelled';
export type SubstituteReasonCategory = 'sick' | 'training' | 'personal' | 'family' | 'emergency' | 'other';

export interface ISubstituteTeacher extends Document {
  originalTeacherId: Types.ObjectId;
  substituteTeacherId: Types.ObjectId;
  schoolId: Types.ObjectId;
  date: Date;
  periods: number[];
  reason?: string;
  reasonCategory: SubstituteReasonCategory;
  classIds: Types.ObjectId[];
  approvedBy?: Types.ObjectId;
  status: SubstituteStatus;
  approvedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
  leaveRequestId?: Types.ObjectId;
  isFullDay: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const substituteTeacherSchema = new Schema<ISubstituteTeacher>(
  {
    originalTeacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    substituteTeacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    date: { type: Date, required: true },
    periods: { type: [Number], required: true },
    reason: { type: String, trim: true },
    reasonCategory: {
      type: String,
      enum: ['sick', 'training', 'personal', 'family', 'emergency', 'other'],
      required: true,
      default: 'other',
    },
    classIds: { type: [Schema.Types.ObjectId], ref: 'Class', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', 'cancelled'],
      default: 'pending',
      required: true,
    },
    approvedAt: { type: Date },
    declinedAt: { type: Date },
    declineReason: { type: String, trim: true },
    leaveRequestId: { type: Schema.Types.ObjectId, ref: 'LeaveRequest' },
    isFullDay: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

substituteTeacherSchema.index({ schoolId: 1, date: 1 });
substituteTeacherSchema.index({ originalTeacherId: 1, date: 1 });
substituteTeacherSchema.index({ schoolId: 1, status: 1, date: 1 });
substituteTeacherSchema.index({ schoolId: 1, leaveRequestId: 1 });

export const SubstituteTeacher = mongoose.model<ISubstituteTeacher>('SubstituteTeacher', substituteTeacherSchema);
