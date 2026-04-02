import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Digest Preference ─────────────────────────────────────────────────────

export type DigestChannel = 'whatsapp' | 'email' | 'both';

export interface IDigestPreference extends Document {
  parentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  digestChannel: DigestChannel;
  morningBriefTime: string;
  eveningBriefTime: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const digestPreferenceSchema = new Schema<IDigestPreference>(
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
    dailyDigest: {
      type: Boolean,
      default: true,
    },
    weeklyDigest: {
      type: Boolean,
      default: true,
    },
    digestChannel: {
      type: String,
      enum: ['whatsapp', 'email', 'both'],
      default: 'email',
    },
    morningBriefTime: {
      type: String,
      default: '07:00',
    },
    eveningBriefTime: {
      type: String,
      default: '16:00',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

digestPreferenceSchema.index({ parentId: 1, schoolId: 1 }, { unique: true });

export const DigestPreference = mongoose.model<IDigestPreference>('DigestPreference', digestPreferenceSchema);
