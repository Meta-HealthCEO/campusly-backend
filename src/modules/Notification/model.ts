import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Notification ───────────────────────────────────────────────────────────

export type NotificationType = 'email' | 'sms' | 'push' | 'in_app';

export interface INotificationData {
  entityId?: string;
  entityType?: string;
  message?: string;
  url?: string;
  [key: string]: unknown;
}

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  schoolId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: INotificationData;
  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: new Schema({
        entityId: { type: String },
        entityType: { type: String },
        message: { type: String },
        url: { type: String },
      }, { _id: false, strict: false }), // strict: false allows extra fields
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ schoolId: 1 });
notificationSchema.index({ schoolId: 1, type: 1 });
notificationSchema.index({ schoolId: 1, isDeleted: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);

// ─── Notification Preference ────────────────────────────────────────────────

export interface INotificationPreference extends Document {
  userId: Types.ObjectId;
  schoolId?: Types.ObjectId;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    homework: boolean;
    grades: boolean;
    attendance: boolean;
    billing: boolean;
    announcements: boolean;
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // schoolId is required by mobile multi-tenancy but loosened to optional
    // until the backfill migration in Task 5 populates it for existing docs.
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: false,
    },
    email: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    inApp: {
      type: Boolean,
      default: true,
    },
    categories: {
      homework: { type: Boolean, default: true },
      grades: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      billing: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

notificationPreferenceSchema.index({ userId: 1 }, { unique: true });

export const NotificationPreference = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema,
);
