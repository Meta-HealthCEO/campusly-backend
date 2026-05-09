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
  comprehensionQuestionIds?: Types.ObjectId[];
  subjectId: Types.ObjectId;
  classId: Types.ObjectId;
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  dueDate: Date;
  totalMarks: number;
  status: HomeworkStatus;
  attachments: string[];
  latePolicy: 'block' | 'penalty' | 'accept';
  latePenaltyPercent?: number;
  gradebookAutoPublish: boolean;
  assessmentId?: Types.ObjectId | null;
  version: number;
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
    comprehensionQuestionIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Question',
      default: undefined,
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
    latePolicy: {
      type: String,
      enum: ['block', 'penalty', 'accept'],
      default: 'block',
      required: true,
    },
    latePenaltyPercent: { type: Number, min: 0, max: 100, default: undefined },
    gradebookAutoPublish: { type: Boolean, default: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', default: null },
    version: { type: Number, default: 1, min: 1 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

homeworkSchema.index({ classId: 1, subjectId: 1 });
homeworkSchema.index({ schoolId: 1, dueDate: -1 });
homeworkSchema.index({ schoolId: 1, isDeleted: 1, createdAt: -1 });
homeworkSchema.index({ type: 1, schoolId: 1 });

export const Homework = mongoose.model<IHomework>('Homework', homeworkSchema);

// ─── HomeworkSubmission base + variants (discriminated by type) ──────────

export type HomeworkSubmissionType = 'quiz' | 'reading' | 'exercise';
export type GradingStatus = 'pending' | 'graded' | 'failed';
export type GradingMethod = 'deterministic' | 'ai' | 'teacher' | 'pending';

export interface IGradedAnswer {
  studentAnswer: string;
  questionSnapshot: string;
  awarded?: number;
  maxMarks: number;
  rationale?: string;
  gradingMethod: GradingMethod;
}

export interface IQuizAnswer extends IGradedAnswer {
  questionIndex: number;
}

export interface IExerciseAnswer extends IGradedAnswer {
  questionId: Types.ObjectId;
}

export interface IReadingAnswer extends IGradedAnswer {
  questionId: Types.ObjectId;
}

export interface ILateMarkAdjustment {
  rawMark: number;
  penaltyPercent: number;
  finalMark: number;
}

export interface IHomeworkSubmissionBase extends Document {
  homeworkId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  type: HomeworkSubmissionType;
  homeworkVersion: number;
  submittedAt: Date;
  isLate: boolean;
  gradingStatus: GradingStatus;
  gradingGeneration: number;
  mark?: number;
  maxMarks: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: Types.ObjectId | null;
  errorMessage?: string;
  lateMarkAdjustment?: ILateMarkAdjustment;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizSubmission extends IHomeworkSubmissionBase {
  type: 'quiz';
  answers: IQuizAnswer[];
}

export interface IExerciseSubmission extends IHomeworkSubmissionBase {
  type: 'exercise';
  answers: IExerciseAnswer[];
}

export interface IReadingSubmission extends IHomeworkSubmissionBase {
  type: 'reading';
  markedReadAt: Date;
  comprehensionAnswers: IReadingAnswer[];
}

export type IHomeworkSubmission =
  | IQuizSubmission
  | IExerciseSubmission
  | IReadingSubmission;

const lateMarkAdjustmentSchema = new Schema<ILateMarkAdjustment>(
  {
    rawMark: { type: Number, required: true },
    penaltyPercent: { type: Number, required: true },
    finalMark: { type: Number, required: true },
  },
  { _id: false },
);

const baseAnswerFields = {
  studentAnswer: { type: String, required: true, default: '' },
  questionSnapshot: { type: String, required: true, default: '' },
  awarded: { type: Number, default: undefined },
  maxMarks: { type: Number, required: true, min: 0 },
  rationale: { type: String, default: undefined },
  gradingMethod: {
    type: String,
    enum: ['deterministic', 'ai', 'teacher', 'pending'],
    required: true,
    default: 'pending' as GradingMethod,
  },
};

const quizAnswerSchema = new Schema<IQuizAnswer>(
  { ...baseAnswerFields, questionIndex: { type: Number, required: true, min: 0 } },
  { _id: false },
);

const exerciseAnswerSchema = new Schema<IExerciseAnswer>(
  { ...baseAnswerFields, questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true } },
  { _id: false },
);

const readingAnswerSchema = new Schema<IReadingAnswer>(
  { ...baseAnswerFields, questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true } },
  { _id: false },
);

const homeworkSubmissionBaseSchema = new Schema<IHomeworkSubmissionBase>(
  {
    homeworkId: { type: Schema.Types.ObjectId, ref: 'Homework', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    homeworkVersion: { type: Number, required: true, min: 1 },
    submittedAt: { type: Date, required: true },
    isLate: { type: Boolean, default: false },
    gradingStatus: {
      type: String,
      enum: ['pending', 'graded', 'failed'],
      required: true,
      default: 'pending',
    },
    gradingGeneration: { type: Number, required: true, default: 1, min: 1 },
    mark: { type: Number, default: undefined },
    maxMarks: { type: Number, required: true, min: 0 },
    feedback: { type: String, trim: true },
    gradedAt: { type: Date },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    errorMessage: { type: String, default: undefined },
    lateMarkAdjustment: { type: lateMarkAdjustmentSchema, default: undefined },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, discriminatorKey: 'type' },
);

homeworkSubmissionBaseSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });
homeworkSubmissionBaseSchema.index({ studentId: 1 });
homeworkSubmissionBaseSchema.index({ schoolId: 1, gradingStatus: 1 });
homeworkSubmissionBaseSchema.index({ homeworkId: 1, gradingStatus: 1 });

export const HomeworkSubmission = mongoose.model<IHomeworkSubmissionBase>(
  'HomeworkSubmission',
  homeworkSubmissionBaseSchema,
);

export const QuizSubmissionModel = HomeworkSubmission.discriminator<IQuizSubmission>(
  'quiz',
  new Schema({ answers: { type: [quizAnswerSchema], default: [] } }, { _id: false }),
);

export const ExerciseSubmissionModel = HomeworkSubmission.discriminator<IExerciseSubmission>(
  'exercise',
  new Schema({ answers: { type: [exerciseAnswerSchema], default: [] } }, { _id: false }),
);

export const ReadingSubmissionModel = HomeworkSubmission.discriminator<IReadingSubmission>(
  'reading',
  new Schema(
    {
      markedReadAt: { type: Date, required: true },
      comprehensionAnswers: { type: [readingAnswerSchema], default: [] },
    },
    { _id: false },
  ),
);
