import mongoose, { Schema, type Document, type Types } from 'mongoose';

// ─── Message Template ───────────────────────────────────────────────────────

export type TemplateType = 'fee_reminder' | 'absence' | 'general' | 'event' | 'emergency';
export type TemplateCategory = 'attendance' | 'fees' | 'academic' | 'events' | 'general' | 'emergency';
export type ChannelType = 'email' | 'sms' | 'whatsapp' | 'push' | 'all';

export interface IMessageTemplate extends Document {
  schoolId: Types.ObjectId;
  name: string;
  description?: string;
  type: TemplateType;
  channel: ChannelType;
  category: TemplateCategory;
  subject: string;
  body: string;
  htmlBody?: string;
  variables: string[];
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  createdBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageTemplateSchema = new Schema<IMessageTemplate>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    type: {
      type: String,
      enum: ['fee_reminder', 'absence', 'general', 'event', 'emergency'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'push', 'all'],
      default: 'all',
    },
    category: {
      type: String,
      enum: ['attendance', 'fees', 'academic', 'events', 'general', 'emergency'],
      default: 'general',
    },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    htmlBody: { type: String },
    variables: { type: [String], default: [] },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageTemplateSchema.index({ schoolId: 1, isDeleted: 1 });
messageTemplateSchema.index({ schoolId: 1, type: 1 });
messageTemplateSchema.index({ schoolId: 1, channel: 1, category: 1 });
messageTemplateSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const MessageTemplate = mongoose.model<IMessageTemplate>('MessageTemplate', messageTemplateSchema);

// ─── Bulk Message ───────────────────────────────────────────────────────────

export type RecipientTargetType = 'school' | 'grade' | 'class' | 'custom';
export type BulkMessageStatus = 'draft' | 'scheduled' | 'queued' | 'sending' | 'sent' | 'partial' | 'failed' | 'cancelled';

export interface IBulkMessageRecipients {
  type: RecipientTargetType;
  targetIds: Types.ObjectId[];
}

export interface IReadReceipt {
  userId: Types.ObjectId;
  readAt: Date;
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
  scheduledFor?: Date;
  sentAt?: Date;
  readBy: IReadReceipt[];
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
      enum: ['email', 'sms', 'whatsapp', 'push', 'all'],
      default: 'all',
    },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipients: { type: bulkMessageRecipientsSchema, required: true },
    totalRecipients: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'queued', 'sending', 'sent', 'partial', 'failed', 'cancelled'],
      default: 'draft',
    },
    scheduledFor: { type: Date },
    sentAt: { type: Date },
    readBy: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          readAt: { type: Date, required: true },
        },
      ],
      default: [],
      _id: false,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bulkMessageSchema.index({ schoolId: 1, isDeleted: 1 });
bulkMessageSchema.index({ schoolId: 1, status: 1 });
bulkMessageSchema.index({ schoolId: 1, createdAt: -1 });

export const BulkMessage = mongoose.model<IBulkMessage>('BulkMessage', bulkMessageSchema);

// ─── Message Log ────────────────────────────────────────────────────────────

export type MessageLogStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'read' | 'retrying';

export interface IMessageLog extends Document {
  bulkMessageId: Types.ObjectId;
  recipientId: Types.ObjectId;
  channel: string;
  status: MessageLogStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  error?: string;
  retryCount: number;
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
      enum: ['queued', 'sent', 'delivered', 'failed', 'read', 'retrying'],
      default: 'queued',
    },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageLogSchema.index({ bulkMessageId: 1 });
messageLogSchema.index({ recipientId: 1, createdAt: -1 });

export const MessageLog = mongoose.model<IMessageLog>('MessageLog', messageLogSchema);
