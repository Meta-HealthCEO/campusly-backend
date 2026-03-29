import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Notification ───────────────────────────────────────────────────────────

export type NotificationType = 'email' | 'sms' | 'push' | 'in_app';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  schoolId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: unknown;
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
      type: Schema.Types.Mixed,
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

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);

// ─── Notification Preference ────────────────────────────────────────────────

export interface INotificationPreference extends Document {
  userId: Types.ObjectId;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
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
