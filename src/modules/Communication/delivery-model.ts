import mongoose, { Schema, type Document, type Types } from 'mongoose';

// ─── Channel Config ──────────────────────────────────────────────────────────

export interface IChannelConfig {
  enabled: boolean;
  provider: string;
  apiKey?: string;
  apiUsername?: string;
  fromName?: string;
  fromEmail?: string;
  replyToEmail?: string;
  senderId?: string;
  phoneNumber?: string;
  accountSid?: string;
  authToken?: string;
  serviceAccountKey?: string;
  dailyLimit: number;
  usedToday: number;
}

export interface ICommunicationConfig extends Document {
  schoolId: Types.ObjectId;
  channels: {
    email: IChannelConfig;
    sms: IChannelConfig;
    whatsapp: IChannelConfig;
    push: IChannelConfig;
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const channelConfigSchema = new Schema<IChannelConfig>(
  {
    enabled: { type: Boolean, default: false },
    provider: { type: String, default: '' },
    apiKey: { type: String },
    apiUsername: { type: String },
    fromName: { type: String },
    fromEmail: { type: String },
    replyToEmail: { type: String },
    senderId: { type: String },
    phoneNumber: { type: String },
    accountSid: { type: String },
    authToken: { type: String },
    serviceAccountKey: { type: String },
    dailyLimit: { type: Number, default: 500 },
    usedToday: { type: Number, default: 0 },
  },
  { _id: false },
);

const communicationConfigSchema = new Schema<ICommunicationConfig>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, unique: true },
    channels: {
      email: { type: channelConfigSchema, default: () => ({ enabled: false, provider: 'resend', dailyLimit: 500, usedToday: 0 }) },
      sms: { type: channelConfigSchema, default: () => ({ enabled: false, provider: 'twilio', dailyLimit: 200, usedToday: 0 }) },
      whatsapp: { type: channelConfigSchema, default: () => ({ enabled: false, provider: 'twilio', dailyLimit: 200, usedToday: 0 }) },
      push: { type: channelConfigSchema, default: () => ({ enabled: false, provider: 'fcm', dailyLimit: 1000, usedToday: 0 }) },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

communicationConfigSchema.index({ schoolId: 1 }, { unique: true });

export const CommunicationConfig = mongoose.model<ICommunicationConfig>(
  'CommunicationConfig',
  communicationConfigSchema,
);

// ─── Delivery Log ────────────────────────────────────────────────────────────

export type DeliveryStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened';

export interface IDeliveryLog extends Document {
  schoolId: Types.ObjectId;
  batchId: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  templateId?: Types.ObjectId;
  recipientUserId?: Types.ObjectId;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientDeviceToken?: string;
  subject?: string;
  bodyPreview?: string;
  status: DeliveryStatus;
  providerMessageId?: string;
  providerResponse?: string;
  errorMessage?: string;
  cost: number;
  retryCount: number;
  maxRetries: number;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  failedAt?: Date;
  scheduledAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryLogSchema = new Schema<IDeliveryLog>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    batchId: { type: String, required: true },
    channel: { type: String, enum: ['email', 'sms', 'whatsapp', 'push'], required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'MessageTemplate' },
    recipientUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientName: { type: String },
    recipientEmail: { type: String },
    recipientPhone: { type: String },
    recipientDeviceToken: { type: String },
    subject: { type: String },
    bodyPreview: { type: String },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed', 'bounced', 'opened'],
      default: 'queued',
    },
    providerMessageId: { type: String },
    providerResponse: { type: String },
    errorMessage: { type: String },
    cost: { type: Number, default: 0 },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    openedAt: { type: Date },
    failedAt: { type: Date },
    scheduledAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

deliveryLogSchema.index({ schoolId: 1, createdAt: -1 });
deliveryLogSchema.index({ batchId: 1 });
deliveryLogSchema.index({ schoolId: 1, channel: 1, status: 1 });
deliveryLogSchema.index({ providerMessageId: 1 }, { sparse: true });
deliveryLogSchema.index({ schoolId: 1, status: 1, scheduledAt: 1 });

export const DeliveryLog = mongoose.model<IDeliveryLog>('DeliveryLog', deliveryLogSchema);

// ─── Device Registration ─────────────────────────────────────────────────────

export type DevicePlatform = 'web' | 'android' | 'ios';

export interface IDeviceRegistration extends Document {
  userId: Types.ObjectId;
  schoolId: Types.ObjectId;
  deviceToken: string;
  platform: DevicePlatform;
  deviceName?: string;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deviceRegistrationSchema = new Schema<IDeviceRegistration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    deviceToken: { type: String, required: true },
    platform: { type: String, enum: ['web', 'android', 'ios'], required: true },
    deviceName: { type: String },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date },
  },
  { timestamps: true },
);

deviceRegistrationSchema.index({ userId: 1, deviceToken: 1 }, { unique: true });
deviceRegistrationSchema.index({ userId: 1, isActive: 1 });

export const DeviceRegistration = mongoose.model<IDeviceRegistration>(
  'DeviceRegistration',
  deviceRegistrationSchema,
);
