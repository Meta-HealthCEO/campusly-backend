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
  ticketPrice?: number;
  isTicketed: boolean;
  galleryEnabled: boolean;
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
    ticketPrice: {
      type: Number,
    },
    isTicketed: {
      type: Boolean,
      default: false,
    },
    galleryEnabled: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

eventSchema.index({ schoolId: 1, isDeleted: 1 });
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
  headcount: number;
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
    headcount: {
      type: Number,
      default: 1,
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

// ─── Event Ticket ──────────────────────────────────────────────────────────

export type TicketStatus = 'active' | 'used' | 'cancelled';

export interface IEventTicket extends Document {
  eventId: Types.ObjectId;
  schoolId: Types.ObjectId;
  userId: Types.ObjectId;
  ticketType: string;
  price: number;
  qrCode: string;
  status: TicketStatus;
  purchasedAt: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventTicketSchema = new Schema<IEventTicket>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketType: {
      type: String,
      required: true,
      default: 'standard',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'used', 'cancelled'],
      default: 'active',
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

eventTicketSchema.index({ eventId: 1, status: 1 });
eventTicketSchema.index({ qrCode: 1 }, { unique: true });
eventTicketSchema.index({ schoolId: 1, isDeleted: 1 });

export const EventTicket = mongoose.model<IEventTicket>('EventTicket', eventTicketSchema);

// ─── Event Seat ────────────────────────────────────────────────────────────

export type SeatStatus = 'available' | 'reserved' | 'sold';

export interface IEventSeat extends Document {
  eventId: Types.ObjectId;
  row: string;
  seatNumber: number;
  status: SeatStatus;
  ticketId?: Types.ObjectId;
  label?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSeatSchema = new Schema<IEventSeat>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    row: {
      type: String,
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'EventTicket',
    },
    label: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

eventSeatSchema.index({ eventId: 1, row: 1, seatNumber: 1 }, { unique: true });

export const EventSeat = mongoose.model<IEventSeat>('EventSeat', eventSeatSchema);

// ─── Event Check-In ────────────────────────────────────────────────────────

export interface IEventCheckIn extends Document {
  eventId: Types.ObjectId;
  ticketId: Types.ObjectId;
  checkedInAt: Date;
  checkedInBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventCheckInSchema = new Schema<IEventCheckIn>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'EventTicket',
      required: true,
    },
    checkedInAt: {
      type: Date,
      default: Date.now,
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

eventCheckInSchema.index({ eventId: 1, ticketId: 1 }, { unique: true });

export const EventCheckIn = mongoose.model<IEventCheckIn>('EventCheckIn', eventCheckInSchema);

// ─── Event Gallery ─────────────────────────────────────────────────────────

export interface IEventGallery extends Document {
  eventId: Types.ObjectId;
  schoolId: Types.ObjectId;
  imageUrl: string;
  caption?: string;
  uploadedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventGallerySchema = new Schema<IEventGallery>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

eventGallerySchema.index({ eventId: 1 });
eventGallerySchema.index({ schoolId: 1, isDeleted: 1 });

export const EventGallery = mongoose.model<IEventGallery>('EventGallery', eventGallerySchema);
