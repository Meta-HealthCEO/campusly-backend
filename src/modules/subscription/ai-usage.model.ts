import mongoose, { Schema, model, type Document } from 'mongoose';

/** One AI action a standalone teacher spent from their monthly allowance. */
export interface IAIUsage extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  meta: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AIUsageSchema = new Schema<IAIUsage>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

AIUsageSchema.index({ schoolId: 1, createdAt: -1 });

export const AIUsage = model<IAIUsage>('AIUsage', AIUsageSchema);
