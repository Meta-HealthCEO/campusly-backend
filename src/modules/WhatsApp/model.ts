import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── WhatsApp Provider ──────────────────────────────────────────────────────

export type WhatsAppProvider = 'twilio' | '360dialog' | 'wati';

export type WhatsAppTemplateType =
  | 'fee_reminder'
  | 'absence_alert'
  | 'homework_due'
  | 'results_available'
  | 'event_reminder'
  | 'general_announcement'
  | 'transport_alert'
  | 'emergency';

export type WhatsAppMessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

export type WhatsAppLanguage = 'en' | 'af' | 'zu' | 'xh';

// ─── WhatsApp Config ────────────────────────────────────────────────────────

export interface IWhatsAppCredentials {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface IWhatsAppConfig extends Document {
  schoolId: Types.ObjectId;
  provider: WhatsAppProvider;
  credentials: IWhatsAppCredentials;
  templateIds: Map<string, string>;
  enabled: boolean;
  lastVerifiedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const whatsAppConfigSchema = new Schema<IWhatsAppConfig>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ['twilio', '360dialog', 'wati'],
      default: 'twilio',
    },
    credentials: {
      accountSid: { type: String, required: true },
      authToken: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    templateIds: {
      type: Map,
      of: String,
      default: new Map(),
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    lastVerifiedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

whatsAppConfigSchema.index({ schoolId: 1 }, { unique: true });

export const WhatsAppConfig = mongoose.model<IWhatsAppConfig>(
  'WhatsAppConfig',
  whatsAppConfigSchema,
);

// ─── WhatsApp Message ───────────────────────────────────────────────────────

export interface IWhatsAppMessage extends Document {
  schoolId: Types.ObjectId;
  recipientPhone: string;
  recipientName?: string;
  parentId?: Types.ObjectId;
  templateType: WhatsAppTemplateType;
  templateParams: Record<string, unknown>;
  status: WhatsAppMessageStatus;
  externalId?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const whatsAppMessageSchema = new Schema<IWhatsAppMessage>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    recipientPhone: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    templateType: {
      type: String,
      enum: [
        'fee_reminder', 'absence_alert', 'homework_due', 'results_available',
        'event_reminder', 'general_announcement', 'transport_alert', 'emergency',
      ],
      required: true,
    },
    templateParams: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
      default: 'queued',
    },
    externalId: {
      type: String,
    },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    failureReason: { type: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

whatsAppMessageSchema.index({ schoolId: 1, status: 1 });
whatsAppMessageSchema.index({ schoolId: 1, recipientPhone: 1 });
whatsAppMessageSchema.index({ externalId: 1 });

export const WhatsAppMessage = mongoose.model<IWhatsAppMessage>(
  'WhatsAppMessage',
  whatsAppMessageSchema,
);

// ─── WhatsApp Opt-In (POPIA Compliance) ─────────────────────────────────────

export interface IWhatsAppOptIn extends Document {
  parentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  phoneNumber: string;
  optedIn: boolean;
  optInDate?: Date;
  optOutDate?: Date;
  preferredLanguage: WhatsAppLanguage;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const whatsAppOptInSchema = new Schema<IWhatsAppOptIn>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    optedIn: {
      type: Boolean,
      default: false,
    },
    optInDate: { type: Date },
    optOutDate: { type: Date },
    preferredLanguage: {
      type: String,
      enum: ['en', 'af', 'zu', 'xh'],
      default: 'en',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

whatsAppOptInSchema.index({ parentId: 1, schoolId: 1 }, { unique: true });

export const WhatsAppOptIn = mongoose.model<IWhatsAppOptIn>(
  'WhatsAppOptIn',
  whatsAppOptInSchema,
);
