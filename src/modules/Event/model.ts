import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Event ──────────────────────────────────────────────────────────────────

export type EventType = 'sports_day' | 'concert' | 'parents_evening' | 'fundraiser' | 'excursion' | 'other';

export interface IEvent extends Document {
  title: string;
  description?: string;
  schoolId: Types.ObjectId;
  organizerId: Types.ObjectId;
  eventType: EventType;
  date: Date;
  startTime: string;
  endTime: string;
  venue?: string;
  capacity?: number;
  rsvpRequired: boolean;
  rsvpDeadline?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventType: {
      type: String,
      enum: ['sports_day', 'concert', 'parents_evening', 'fundraiser', 'excursion', 'other'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
    },
    capacity: {
      type: Number,
    },
    rsvpRequired: {
      type: Boolean,
      default: false,
    },
    rsvpDeadline: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

eventSchema.index({ schoolId: 1, date: -1 });
eventSchema.index({ schoolId: 1, eventType: 1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);

// ─── Event RSVP ─────────────────────────────────────────────────────────────

export type RsvpStatus = 'attending' | 'not_attending' | 'maybe';

export interface IEventRsvp extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  status: RsvpStatus;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventRsvpSchema = new Schema<IEventRsvp>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['attending', 'not_attending', 'maybe'],
      required: true,
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

eventRsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });
eventRsvpSchema.index({ eventId: 1, status: 1 });

export const EventRsvp = mongoose.model<IEventRsvp>('EventRsvp', eventRsvpSchema);
