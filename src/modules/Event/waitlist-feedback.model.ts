import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Event Waitlist ──────────────────────────────────────────────────────────

export type WaitlistStatus = 'waiting' | 'offered' | 'accepted' | 'expired';

export interface IEventWaitlist extends Document {
  schoolId: Types.ObjectId;
  eventId: Types.ObjectId;
  parentId: Types.ObjectId;
  studentId?: Types.ObjectId;
  position: number;
  status: WaitlistStatus;
  offeredAt?: Date;
  expiresAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventWaitlistSchema = new Schema<IEventWaitlist>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
    position: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'offered', 'accepted', 'expired'],
      default: 'waiting',
    },
    offeredAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

eventWaitlistSchema.index({ eventId: 1, position: 1 });
eventWaitlistSchema.index({ eventId: 1, parentId: 1 }, { unique: true });
eventWaitlistSchema.index({ schoolId: 1, isDeleted: 1 });

export const EventWaitlist = mongoose.model<IEventWaitlist>('EventWaitlist', eventWaitlistSchema);

// ─── Event Feedback ──────────────────────────────────────────────────────────

export interface IEventFeedback extends Document {
  schoolId: Types.ObjectId;
  eventId: Types.ObjectId;
  parentId: Types.ObjectId;
  rating: number;
  comment?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventFeedbackSchema = new Schema<IEventFeedback>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

eventFeedbackSchema.index({ eventId: 1, parentId: 1 }, { unique: true });
eventFeedbackSchema.index({ schoolId: 1, isDeleted: 1 });

export const EventFeedback = mongoose.model<IEventFeedback>('EventFeedback', eventFeedbackSchema);
