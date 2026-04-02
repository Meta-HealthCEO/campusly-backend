import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IParent extends Document {
  userId: Types.ObjectId;
  schoolId: Types.ObjectId;
  childrenIds: Types.ObjectId[];
  relationship: 'mother' | 'father' | 'guardian' | 'other';
  occupation?: string;
  employer?: string;
  workPhone?: string;
  alternativeEmail?: string;
  communicationPreference: 'email' | 'sms' | 'whatsapp' | 'push';
  isMainCaregiver: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const parentSchema = new Schema<IParent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    childrenIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Student',
      default: [],
      validate: [(v: unknown[]) => v.length <= 50, 'Maximum 50 children allowed'],
    },
    relationship: {
      type: String,
      enum: ['mother', 'father', 'guardian', 'other'],
      required: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    employer: {
      type: String,
      trim: true,
    },
    workPhone: {
      type: String,
      trim: true,
    },
    alternativeEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    communicationPreference: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'push'],
      default: 'email',
    },
    isMainCaregiver: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

parentSchema.index({ userId: 1 });
parentSchema.index({ schoolId: 1 });
parentSchema.index({ schoolId: 1, isDeleted: 1 });

export const Parent = mongoose.model<IParent>('Parent', parentSchema);
