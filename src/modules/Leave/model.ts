import mongoose, { Schema } from 'mongoose';
import type { Document, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const LEAVE_TYPES = [
  'annual',
  'sick',
  'family_responsibility',
  'maternity',
  'paternity',
  'unpaid',
  'study',
] as const;

export type LeaveType = (typeof LEAVE_TYPES)[number];

export const LEAVE_STATUSES = ['pending', 'approved', 'declined', 'cancelled'] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

export const HALF_DAY_PERIODS = ['morning', 'afternoon'] as const;
export type HalfDayPeriod = (typeof HALF_DAY_PERIODS)[number];

// ─── LeavePolicy ──────────────────────────────────────────────────────────────

export interface ILeaveTypeConfig {
  type: LeaveType;
  label: string;
  defaultEntitlement: number;
  unit: string;
  cycleLength: number;
  requiresDocument: boolean;
  requiresDocumentAfterDays: number | null;
  isPaid: boolean;
  isActive: boolean;
}

export interface ILeavePolicy extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  leaveTypes: ILeaveTypeConfig[];
  createdAt: Date;
  updatedAt: Date;
}

const leaveTypeConfigSchema = new Schema<ILeaveTypeConfig>(
  {
    type: { type: String, enum: LEAVE_TYPES, required: true },
    label: { type: String, required: true },
    defaultEntitlement: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'days' },
    cycleLength: { type: Number, default: 1 },
    requiresDocument: { type: Boolean, default: false },
    requiresDocumentAfterDays: { type: Number, default: null },
    isPaid: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

const leavePolicySchema = new Schema<ILeavePolicy>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, unique: true },
    leaveTypes: { type: [leaveTypeConfigSchema], default: [] },
  },
  { timestamps: true },
);

export const LeavePolicy = mongoose.model<ILeavePolicy>('LeavePolicy', leavePolicySchema);

// ─── LeaveRequest ─────────────────────────────────────────────────────────────

export interface ILeaveRequest extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  staffId: Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  isHalfDay: boolean;
  halfDayPeriod: HalfDayPeriod | null;
  documentUrl: string | null;
  substituteTeacherId: Types.ObjectId | null;
  status: LeaveStatus;
  workingDays: number;
  reviewedBy: Types.ObjectId | null;
  reviewedAt: Date | null;
  reviewComment: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: { type: String, enum: LEAVE_TYPES, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    isHalfDay: { type: Boolean, default: false },
    halfDayPeriod: { type: String, enum: [...HALF_DAY_PERIODS, null], default: null },
    documentUrl: { type: String, default: null },
    substituteTeacherId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: LEAVE_STATUSES, default: 'pending' },
    workingDays: { type: Number, required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewComment: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

leaveRequestSchema.index({ schoolId: 1, isDeleted: 1, createdAt: -1 });
leaveRequestSchema.index({ schoolId: 1, staffId: 1, status: 1 });
leaveRequestSchema.index({ schoolId: 1, status: 1, startDate: 1 });

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);

// ─── LeaveBalance ─────────────────────────────────────────────────────────────

export interface ILeaveBalanceEntry {
  leaveType: LeaveType;
  entitlement: number;
  used: number;
  pending: number;
}

export interface ILeaveBalance extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  staffId: Types.ObjectId;
  year: number;
  balances: ILeaveBalanceEntry[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leaveBalanceEntrySchema = new Schema<ILeaveBalanceEntry>(
  {
    leaveType: { type: String, enum: LEAVE_TYPES, required: true },
    entitlement: { type: Number, required: true },
    used: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
  },
  { _id: false },
);

const leaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    year: { type: Number, required: true },
    balances: { type: [leaveBalanceEntrySchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

leaveBalanceSchema.index({ schoolId: 1, staffId: 1, year: 1 }, { unique: true });

export const LeaveBalance = mongoose.model<ILeaveBalance>('LeaveBalance', leaveBalanceSchema);
