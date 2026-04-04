import mongoose, { Schema } from 'mongoose';
import type { Document, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const EVENT_STATUSES = [
  'draft',
  'published',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const SLOT_STATUSES = ['available', 'booked', 'blocked'] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export const BOOKING_STATUSES = ['confirmed', 'cancelled', 'completed', 'no_show'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const WAITLIST_STATUSES = ['waiting', 'offered', 'expired'] as const;
export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];

// ─── ConferenceEvent ──────────────────────────────────────────────────────────

export interface IConferenceEvent extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  title: string;
  description: string | null;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string | null;
  slotDurationMinutes: number;
  breakBetweenMinutes: number;
  maxSlotsPerTeacher: number | null;
  maxBookingsPerParent: number | null;
  allowWaitlist: boolean;
  bookingOpensAt: Date | null;
  bookingClosesAt: Date | null;
  participatingTeacherIds: Types.ObjectId[];
  status: EventStatus;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conferenceEventSchema = new Schema<IConferenceEvent>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, minlength: 3, maxlength: 200 },
    description: { type: String, default: null, maxlength: 1000 },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: String, default: null, maxlength: 200 },
    slotDurationMinutes: { type: Number, default: 15, min: 5, max: 60 },
    breakBetweenMinutes: { type: Number, default: 5, min: 0, max: 30 },
    maxSlotsPerTeacher: { type: Number, default: null },
    maxBookingsPerParent: { type: Number, default: null },
    allowWaitlist: { type: Boolean, default: true },
    bookingOpensAt: { type: Date, default: null },
    bookingClosesAt: { type: Date, default: null },
    participatingTeacherIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: EVENT_STATUSES, default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

conferenceEventSchema.index({ schoolId: 1, date: 1 });
conferenceEventSchema.index({ schoolId: 1, status: 1 });

export const ConferenceEvent = mongoose.model<IConferenceEvent>(
  'ConferenceEvent',
  conferenceEventSchema,
);

// ─── TeacherAvailability ──────────────────────────────────────────────────────

export interface IAvailabilityWindow {
  startTime: string;
  endTime: string;
  location: string | null;
}

export interface ITimeSlot {
  slotId: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  location: string | null;
}

export interface ITeacherAvailability extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teacherId: Types.ObjectId;
  schoolId: Types.ObjectId;
  windows: IAvailabilityWindow[];
  generatedSlots: ITimeSlot[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const availabilityWindowSchema = new Schema<IAvailabilityWindow>(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, default: null },
  },
  { _id: false },
);

const timeSlotSchema = new Schema<ITimeSlot>(
  {
    slotId: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: SLOT_STATUSES, default: 'available' },
    location: { type: String, default: null },
  },
  { _id: false },
);

const teacherAvailabilitySchema = new Schema<ITeacherAvailability>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'ConferenceEvent', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    windows: { type: [availabilityWindowSchema], required: true },
    generatedSlots: { type: [timeSlotSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

teacherAvailabilitySchema.index({ eventId: 1, teacherId: 1 }, { unique: true });
teacherAvailabilitySchema.index({ schoolId: 1, eventId: 1 });

export const ConferenceTeacherAvailability = mongoose.model<ITeacherAvailability>(
  'ConferenceTeacherAvailability',
  teacherAvailabilitySchema,
);

// ─── ConferenceBooking ────────────────────────────────────────────────────────

export interface IConferenceBooking extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teacherId: Types.ObjectId;
  parentId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  slotId: string;
  slotStartTime: string;
  slotEndTime: string;
  location: string | null;
  notes: string | null;
  status: BookingStatus;
  cancelledAt: Date | null;
  cancelReason: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conferenceBookingSchema = new Schema<IConferenceBooking>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'ConferenceEvent', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    slotId: { type: String, required: true },
    slotStartTime: { type: String, required: true },
    slotEndTime: { type: String, required: true },
    location: { type: String, default: null },
    notes: { type: String, default: null, maxlength: 500 },
    status: { type: String, enum: BOOKING_STATUSES, default: 'confirmed' },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

conferenceBookingSchema.index({ eventId: 1, teacherId: 1, slotId: 1 }, { unique: true });
conferenceBookingSchema.index({ eventId: 1, parentId: 1 });
conferenceBookingSchema.index({ schoolId: 1, eventId: 1 });

export const ConferenceBooking = mongoose.model<IConferenceBooking>(
  'ConferenceBooking',
  conferenceBookingSchema,
);

// ─── ConferenceWaitlist ───────────────────────────────────────────────────────

export interface IConferenceWaitlist extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  teacherId: Types.ObjectId;
  parentId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  position: number;
  preferredTimes: string[];
  status: WaitlistStatus;
  offeredSlotId: string | null;
  offeredAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conferenceWaitlistSchema = new Schema<IConferenceWaitlist>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'ConferenceEvent', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    position: { type: Number, required: true },
    preferredTimes: [{ type: String }],
    status: { type: String, enum: WAITLIST_STATUSES, default: 'waiting' },
    offeredSlotId: { type: String, default: null },
    offeredAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

conferenceWaitlistSchema.index({ eventId: 1, teacherId: 1, position: 1 });
conferenceWaitlistSchema.index({ eventId: 1, parentId: 1 });

export const ConferenceWaitlist = mongoose.model<IConferenceWaitlist>(
  'ConferenceWaitlist',
  conferenceWaitlistSchema,
);
