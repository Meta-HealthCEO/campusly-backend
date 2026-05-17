import mongoose, { Schema, Document, Types } from 'mongoose';
import type { HomeworkType } from './model.js';

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
  type?: HomeworkType;
  quizId?: Types.ObjectId | null;
  contentResourceId?: Types.ObjectId | null;
  pageRange?: string | null;
  exerciseQuestionIds?: Types.ObjectId[];
  comprehensionQuestionIds?: Types.ObjectId[];
  subjectId: Types.ObjectId;
  totalMarks: number;
  rubric?: string;
  attachments: ITemplateAttachment[];
  latePolicy?: 'block' | 'penalty' | 'accept';
  latePenaltyPercent?: number;
  gradebookAutoPublish?: boolean;
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
    type: {
      type: String,
      enum: ['quiz', 'reading', 'exercise'],
      default: undefined,
    },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', default: null },
    contentResourceId: { type: Schema.Types.ObjectId, ref: 'ContentResource', default: null },
    pageRange: { type: String, default: null, trim: true },
    exerciseQuestionIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Question',
      default: [],
    },
    comprehensionQuestionIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Question',
      default: [],
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
    latePolicy: {
      type: String,
      enum: ['block', 'penalty', 'accept'],
      default: 'block',
    },
    latePenaltyPercent: { type: Number, min: 0, max: 100, default: undefined },
    gradebookAutoPublish: { type: Boolean, default: true },
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
