import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── MessageThread ─────────────────────────────────────────────────────────

export interface IThreadParticipant {
  userId: Types.ObjectId;
  role: 'teacher' | 'parent';
  name: string;
}

export interface IMessageThread extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  participants: IThreadParticipant[];
  subject: string;
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadCount: Map<string, number>;
  isClosed: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const threadParticipantSchema = new Schema<IThreadParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['teacher', 'parent'], required: true },
    name: { type: String, required: true },
  },
  { _id: false },
);

const messageThreadSchema = new Schema<IMessageThread>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    participants: { type: [threadParticipantSchema], required: true },
    subject: { type: String, trim: true, default: '' },
    lastMessageAt: { type: Date, default: () => new Date() },
    lastMessagePreview: { type: String, maxlength: 100, default: '' },
    unreadCount: { type: Map, of: Number, default: () => new Map() },
    isClosed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageThreadSchema.index({ schoolId: 1, 'participants.userId': 1 });
messageThreadSchema.index({ schoolId: 1, studentId: 1 });

export const MessageThread = mongoose.model<IMessageThread>(
  'MessageThread',
  messageThreadSchema,
);

// ─── Message ───────────────────────────────────────────────────────────────

export interface IMessageAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface IMessageReadReceipt {
  userId: Types.ObjectId;
  readAt: Date;
}

export interface IMessage extends Document {
  threadId: Types.ObjectId;
  schoolId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: 'teacher' | 'parent';
  senderName: string;
  content: string;
  attachments: IMessageAttachment[];
  readBy: IMessageReadReceipt[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageAttachmentSchema = new Schema<IMessageAttachment>(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false },
);

const messageReadReceiptSchema = new Schema<IMessageReadReceipt>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    readAt: { type: Date, required: true },
  },
  { _id: false },
);

const messageSchema = new Schema<IMessage>(
  {
    threadId: { type: Schema.Types.ObjectId, ref: 'MessageThread', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['teacher', 'parent'], required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true, maxlength: 4000 },
    attachments: { type: [messageAttachmentSchema], default: [] },
    readBy: { type: [messageReadReceiptSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ schoolId: 1, senderId: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
