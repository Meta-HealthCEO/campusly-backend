import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Homework Template ──────────────────────────────────────────────────────

export interface ITemplateAttachment {
  url: string;
  name: string;
}

export interface IHomeworkTemplate extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  title: string;
  description?: string;
  subjectId: Types.ObjectId;
  totalMarks: number;
  rubric?: string;
  attachments: ITemplateAttachment[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const templateAttachmentSchema = new Schema<ITemplateAttachment>(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false },
);

const homeworkTemplateSchema = new Schema<IHomeworkTemplate>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    rubric: {
      type: String,
    },
    attachments: {
      type: [templateAttachmentSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

homeworkTemplateSchema.index({ schoolId: 1, teacherId: 1, subjectId: 1 });

export const HomeworkTemplate = mongoose.model<IHomeworkTemplate>(
  'HomeworkTemplate',
  homeworkTemplateSchema,
);
