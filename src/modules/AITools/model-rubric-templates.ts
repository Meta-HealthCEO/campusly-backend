import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRubricTemplateCriterion {
  criterion: string;
  maxScore: number;
  description: string;
}

export interface IRubricTemplate extends Document {
  name: string;
  description?: string;
  criteria: IRubricTemplateCriterion[];
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  isShared: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const criterionSchema = new Schema<IRubricTemplateCriterion>(
  {
    criterion: { type: String, required: true, trim: true },
    maxScore: { type: Number, required: true, min: 1 },
    description: { type: String, default: '' },
  },
  { _id: false },
);

const rubricTemplateSchema = new Schema<IRubricTemplate>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    criteria: {
      type: [criterionSchema],
      validate: {
        validator: (arr: IRubricTemplateCriterion[]) => arr.length >= 1,
        message: 'At least one criterion required',
      },
    },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isShared: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

rubricTemplateSchema.index({ schoolId: 1, teacherId: 1 });

export const RubricTemplate = mongoose.model<IRubricTemplate>('RubricTemplate', rubricTemplateSchema);
