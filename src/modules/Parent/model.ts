import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IParent extends Document {
  userId: Types.ObjectId;
  schoolId: Types.ObjectId;
  childrenIds: Types.ObjectId[];
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

export const Parent = mongoose.model<IParent>('Parent', parentSchema);
