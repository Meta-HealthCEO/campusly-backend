import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISessionChatMessage extends Document {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userRole: string;
  message: string;
  timestamp: Date;
}

const sessionChatMessageSchema = new Schema<ISessionChatMessage>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'VirtualSession', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

sessionChatMessageSchema.index({ sessionId: 1, timestamp: 1 });

export const SessionChatMessage = mongoose.model<ISessionChatMessage>(
  'SessionChatMessage',
  sessionChatMessageSchema,
);
