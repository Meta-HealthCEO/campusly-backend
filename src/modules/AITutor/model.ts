import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Tutor Mode ──────────────────────────────────────────────────────────────

export type TutorMode = 'chat' | 'homework_help' | 'practice' | 'exam_prep' | 'parent';

// ─── Tutor Message (embedded) ────────────────────────────────────────────────

export interface ITutorMessage {
  role: 'student' | 'assistant';
  content: string;
  timestamp: Date;
  tokensUsed: { input: number; output: number };
}

const tutorMessageSchema = new Schema<ITutorMessage>(
  {
    role: { type: String, enum: ['student', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date() },
    tokensUsed: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
    },
  },
  { _id: false },
);

// ─── Tutor Conversation ──────────────────────────────────────────────────────

export interface ITutorConversation extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  subjectId: Types.ObjectId;
  subjectName: string;
  grade: number;
  mode: TutorMode;
  title: string;
  messages: ITutorMessage[];
  totalTokens: { input: number; output: number };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tutorConversationSchema = new Schema<ITutorConversation>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    subjectName: { type: String, required: true, trim: true },
    grade: { type: Number, required: true },
    mode: {
      type: String,
      enum: ['chat', 'homework_help', 'practice', 'exam_prep', 'parent'],
      default: 'chat',
    },
    title: { type: String, default: 'New conversation', trim: true },
    messages: [tutorMessageSchema],
    totalTokens: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

tutorConversationSchema.index({ schoolId: 1, studentId: 1, subjectId: 1 });
tutorConversationSchema.index({ schoolId: 1, studentId: 1, createdAt: -1 });

export const TutorConversation = mongoose.model<ITutorConversation>(
  'TutorConversation',
  tutorConversationSchema,
);

// ─── Practice Question (embedded) ────────────────────────────────────────────

export interface IPracticeQuestion {
  questionText: string;
  questionType: 'mcq' | 'short_answer' | 'true_false';
  options?: string[];
  correctAnswer: string;
  studentAnswer?: string;
  isCorrect?: boolean;
  explanation: string;
  marks: number;
}

const practiceQuestionSchema = new Schema<IPracticeQuestion>(
  {
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: ['mcq', 'short_answer', 'true_false'],
      required: true,
    },
    options: { type: [String] },
    correctAnswer: { type: String, required: true },
    studentAnswer: { type: String },
    isCorrect: { type: Boolean },
    explanation: { type: String, required: true },
    marks: { type: Number, default: 1 },
  },
  { _id: false },
);

// ─── Practice Attempt ────────────────────────────────────────────────────────

export interface IPracticeAttempt extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  subjectId: Types.ObjectId;
  topic: string;
  grade: number;
  questions: IPracticeQuestion[];
  score: number;
  totalMarks: number;
  completedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const practiceAttemptSchema = new Schema<IPracticeAttempt>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic: { type: String, required: true, trim: true },
    grade: { type: Number, required: true },
    questions: [practiceQuestionSchema],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, required: true },
    completedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

practiceAttemptSchema.index({ schoolId: 1, studentId: 1, subjectId: 1 });

export const PracticeAttempt = mongoose.model<IPracticeAttempt>(
  'PracticeAttempt',
  practiceAttemptSchema,
);
