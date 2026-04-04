import mongoose, { Schema } from 'mongoose';
import type { Document, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const VISITOR_PURPOSES = [
  'meeting', 'delivery', 'maintenance', 'parent_visit',
  'government', 'interview', 'contractor', 'other',
] as const;
export type VisitorPurpose = (typeof VISITOR_PURPOSES)[number];

export const VISITOR_STATUSES = ['checked_in', 'checked_out'] as const;
export type VisitorStatus = (typeof VISITOR_STATUSES)[number];

export const PRE_REG_STATUSES = ['expected', 'arrived', 'cancelled', 'no_show'] as const;
export type PreRegStatus = (typeof PRE_REG_STATUSES)[number];

export const LATE_REASONS = ['traffic', 'medical', 'transport', 'family', 'other'] as const;
export type LateReason = (typeof LATE_REASONS)[number];

export const EARLY_DEPARTURE_REASONS = [
  'medical', 'appointment', 'family_emergency', 'sport', 'other',
] as const;
export type EarlyDepartureReason = (typeof EARLY_DEPARTURE_REASONS)[number];

// ─── VisitorRecord ────────────────────────────────────────────────────────────

export interface IVisitorRecord extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  passNumber: string;
  firstName: string;
  lastName: string;
  idNumber: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  purpose: VisitorPurpose;
  purposeDetail: string | null;
  hostId: Types.ObjectId | null;
  hostName: string | null;
  vehicleRegistration: string | null;
  numberOfVisitors: number;
  photoUrl: string | null;
  checkInTime: Date;
  checkOutTime: Date | null;
  status: VisitorStatus;
  checkOutNotes: string | null;
  preRegistrationId: Types.ObjectId | null;
  registeredBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const visitorRecordSchema = new Schema<IVisitorRecord>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    passNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    idNumber: { type: String, default: null },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    company: { type: String, default: null },
    purpose: { type: String, enum: VISITOR_PURPOSES, required: true },
    purposeDetail: { type: String, default: null },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    hostName: { type: String, default: null },
    vehicleRegistration: { type: String, default: null },
    numberOfVisitors: { type: Number, default: 1 },
    photoUrl: { type: String, default: null },
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date, default: null },
    status: { type: String, enum: VISITOR_STATUSES, default: 'checked_in' },
    checkOutNotes: { type: String, default: null },
    preRegistrationId: { type: Schema.Types.ObjectId, ref: 'PreRegistration', default: null },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

visitorRecordSchema.index({ schoolId: 1, checkInTime: 1 });
visitorRecordSchema.index({ schoolId: 1, status: 1 });
visitorRecordSchema.index({ schoolId: 1, passNumber: 1 }, { unique: true });
visitorRecordSchema.index({ schoolId: 1, idNumber: 1 });

export const VisitorRecord = mongoose.model<IVisitorRecord>('VisitorRecord', visitorRecordSchema);

// ─── PreRegistration ──────────────────────────────────────────────────────────

export interface IPreRegistration extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  firstName: string;
  lastName: string;
  company: string | null;
  purpose: VisitorPurpose;
  purposeDetail: string | null;
  expectedDate: Date;
  expectedTime: string | null;
  hostId: Types.ObjectId | null;
  vehicleRegistration: string | null;
  notes: string | null;
  status: PreRegStatus;
  registeredBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const preRegistrationSchema = new Schema<IPreRegistration>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String, default: null },
    purpose: { type: String, enum: VISITOR_PURPOSES, required: true },
    purposeDetail: { type: String, default: null },
    expectedDate: { type: Date, required: true },
    expectedTime: { type: String, default: null },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    vehicleRegistration: { type: String, default: null },
    notes: { type: String, default: null },
    status: { type: String, enum: PRE_REG_STATUSES, default: 'expected' },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

preRegistrationSchema.index({ schoolId: 1, expectedDate: 1 });
preRegistrationSchema.index({ schoolId: 1, status: 1 });

export const PreRegistration = mongoose.model<IPreRegistration>(
  'PreRegistration',
  preRegistrationSchema,
);

// ─── LateArrival ──────────────────────────────────────────────────────────────

export interface ILateArrival extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  arrivalTime: Date;
  minutesLate: number;
  reason: LateReason;
  reasonDetail: string | null;
  parentNotified: boolean;
  accompaniedBy: string | null;
  registeredBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lateArrivalSchema = new Schema<ILateArrival>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    arrivalTime: { type: Date, required: true },
    minutesLate: { type: Number, required: true },
    reason: { type: String, enum: LATE_REASONS, required: true },
    reasonDetail: { type: String, default: null },
    parentNotified: { type: Boolean, default: true },
    accompaniedBy: { type: String, default: null },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

lateArrivalSchema.index({ schoolId: 1, arrivalTime: 1 });
lateArrivalSchema.index({ schoolId: 1, studentId: 1, arrivalTime: 1 });

export const LateArrival = mongoose.model<ILateArrival>('LateArrival', lateArrivalSchema);

// ─── EarlyDeparture ───────────────────────────────────────────────────────────

export interface IEarlyDeparture extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  departureTime: Date;
  reason: EarlyDepartureReason;
  reasonDetail: string | null;
  authorizedById: Types.ObjectId | null;
  collectedBy: string;
  collectedByIdNumber: string | null;
  collectedByRelation: string | null;
  parentNotified: boolean;
  guardianMismatchFlag: boolean;
  registeredBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const earlyDepartureSchema = new Schema<IEarlyDeparture>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    departureTime: { type: Date, required: true },
    reason: { type: String, enum: EARLY_DEPARTURE_REASONS, required: true },
    reasonDetail: { type: String, default: null },
    authorizedById: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    collectedBy: { type: String, required: true },
    collectedByIdNumber: { type: String, default: null },
    collectedByRelation: { type: String, default: null },
    parentNotified: { type: Boolean, default: true },
    guardianMismatchFlag: { type: Boolean, default: false },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

earlyDepartureSchema.index({ schoolId: 1, departureTime: 1 });
earlyDepartureSchema.index({ schoolId: 1, studentId: 1, departureTime: 1 });

export const EarlyDeparture = mongoose.model<IEarlyDeparture>(
  'EarlyDeparture',
  earlyDepartureSchema,
);
