import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Homework ────────────────────────────────────────────────────────────────

export type HomeworkStatus = 'assigned' | 'closed';
export type HomeworkType = 'quiz' | 'reading' | 'exercise';

export interface IHomework extends Document {
  title: string;
  type: HomeworkType;
  quizId?: Types.ObjectId | null;
  contentResourceId?: Types.ObjectId | null;
  pageRange?: string | null;
  exerciseQuestionIds: Types.ObjectId[];
  subjectId: Types.ObjectId;
  classId: Types.ObjectId;
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  dueDate: Date;
  totalMarks: number;
  status: HomeworkStatus;
  attachments: string[];
  peerReviewEnabled: boolean;
  groupAssignment: boolean;
  maxFileSize?: number;
  allowedFileTypes: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const homeworkSchema = new Schema<IHomework>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['quiz', 'reading', 'exercise'],
      required: true,
    },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', default: null },
    contentResourceId: { type: Schema.Types.ObjectId, ref: 'ContentResource', default: null },
    pageRange: { type: String, default: null, trim: true },
    exerciseQuestionIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Question',
      default: [],
    },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['assigned', 'closed'], default: 'assigned' },
    attachments: {
      type: [String],
      default: [],
      validate: [(v: string[]) => v.length <= 20, 'Maximum 20 attachments allowed'],
    },
    peerReviewEnabled: { type: Boolean, default: false },
    groupAssignment: { type: Boolean, default: false },
    maxFileSize: { type: Number },
    allowedFileTypes: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

homeworkSchema.index({ classId: 1, subjectId: 1 });
homeworkSchema.index({ schoolId: 1, dueDate: -1 });
homeworkSchema.index({ schoolId: 1, isDeleted: 1, createdAt: -1 });
homeworkSchema.index({ type: 1, schoolId: 1 });

export const Homework = mongoose.model<IHomework>('Homework', homeworkSchema);

// ─── Homework Submission ─────────────────────────────────────────────────────

export interface IHomeworkSubmission extends Document {
  homeworkId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  files: string[];
  submittedAt: Date;
  isLate: boolean;
  mark?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const homeworkSubmissionSchema = new Schema<IHomeworkSubmission>(
  {
    homeworkId: {
      type: Schema.Types.ObjectId,
      ref: 'Homework',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    files: {
      type: [String],
      default: [],
    },
    submittedAt: {
      type: Date,
      required: true,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    mark: {
      type: Number,
    },
    feedback: {
      type: String,
      trim: true,
    },
    gradedAt: {
      type: Date,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

homeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });
homeworkSubmissionSchema.index({ studentId: 1 });

export const HomeworkSubmission = mongoose.model<IHomeworkSubmission>(
  'HomeworkSubmission',
  homeworkSubmissionSchema,
);
