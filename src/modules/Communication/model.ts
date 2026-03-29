import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Message Template ───────────────────────────────────────────────────────

export type TemplateType = 'fee_reminder' | 'absence' | 'general' | 'event' | 'emergency';
export type ChannelType = 'email' | 'sms' | 'whatsapp' | 'all';

export interface IMessageTemplate extends Document {
  schoolId: Types.ObjectId;
  name: string;
  type: TemplateType;
  subject: string;
  body: string;
  channel: ChannelType;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageTemplateSchema = new Schema<IMessageTemplate>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['fee_reminder', 'absence', 'general', 'event', 'emergency'],
      required: true,
    },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    channel: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'all'],
      default: 'all',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageTemplateSchema.index({ schoolId: 1, type: 1 });

export const MessageTemplate = mongoose.model<IMessageTemplate>('MessageTemplate', messageTemplateSchema);

// ─── Bulk Message ───────────────────────────────────────────────────────────

export type RecipientTargetType = 'school' | 'grade' | 'class' | 'custom';
export type BulkMessageStatus = 'draft' | 'queued' | 'sending' | 'sent' | 'failed';

export interface IBulkMessageRecipients {
  type: RecipientTargetType;
  targetIds: Types.ObjectId[];
}

export interface IBulkMessage extends Document {
  schoolId: Types.ObjectId;
  templateId?: Types.ObjectId;
  subject: string;
  body: string;
  channel: ChannelType;
  sentBy: Types.ObjectId;
  recipients: IBulkMessageRecipients;
  totalRecipients: number;
  delivered: number;
  failed: number;
  status: BulkMessageStatus;
  sentAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bulkMessageRecipientsSchema = new Schema<IBulkMessageRecipients>(
  {
    type: {
      type: String,
      enum: ['school', 'grade', 'class', 'custom'],
      required: true,
    },
    targetIds: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  { _id: false },
);

const bulkMessageSchema = new Schema<IBulkMessage>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'MessageTemplate' },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    channel: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'all'],
      default: 'all',
    },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipients: { type: bulkMessageRecipientsSchema, required: true },
    totalRecipients: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'queued', 'sending', 'sent', 'failed'],
      default: 'draft',
    },
    sentAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bulkMessageSchema.index({ schoolId: 1, status: 1 });
bulkMessageSchema.index({ schoolId: 1, createdAt: -1 });

export const BulkMessage = mongoose.model<IBulkMessage>('BulkMessage', bulkMessageSchema);

// ─── Message Log ────────────────────────────────────────────────────────────

export type MessageLogStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'read';

export interface IMessageLog extends Document {
  bulkMessageId: Types.ObjectId;
  recipientId: Types.ObjectId;
  channel: string;
  status: MessageLogStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  error?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageLogSchema = new Schema<IMessageLog>(
  {
    bulkMessageId: { type: Schema.Types.ObjectId, ref: 'BulkMessage', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: String, required: true },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed', 'read'],
      default: 'queued',
    },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    error: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageLogSchema.index({ bulkMessageId: 1 });
messageLogSchema.index({ recipientId: 1, createdAt: -1 });

export const MessageLog = mongoose.model<IMessageLog>('MessageLog', messageLogSchema);
