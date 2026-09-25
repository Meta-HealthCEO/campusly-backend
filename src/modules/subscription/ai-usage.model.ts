import mongoose, { Schema, model, type Document } from 'mongoose';

/** One AI action: a standalone teacher's (allowance) or their learner's (tutor pool). */
export interface IAIUsage extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  /** Whose budget it draws on. Rows written before 2026-09 have none and are teacher rows. */
  scope: 'teacher' | 'learner';
  meta: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AIUsageSchema = new Schema<IAIUsage>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    scope: { type: String, enum: ['teacher', 'learner'], default: 'teacher' },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

AIUsageSchema.index({ schoolId: 1, createdAt: -1 });
AIUsageSchema.index({ schoolId: 1, scope: 1, userId: 1, createdAt: -1 });

export const AIUsage = model<IAIUsage>('AIUsage', AIUsageSchema);
