import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Student Attempt ────────────────────────────────────────────────────────

export interface IStudentAttempt extends Document {
  studentId: Types.ObjectId;
  contentResourceId: Types.ObjectId;
  blockId: string;
  curriculumNodeId: Types.ObjectId;
  cognitiveLevel: { caps: string; blooms: string } | null;
  correct: boolean;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  hintsUsed: number;
  attemptNumber: number;
  response: string;
  schoolId: Types.ObjectId;
  createdAt: Date;
}

const studentAttemptSchema = new Schema<IStudentAttempt>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    contentResourceId: { type: Schema.Types.ObjectId, ref: 'ContentResource', required: true },
    blockId: { type: String, required: true },
    curriculumNodeId: { type: Schema.Types.ObjectId, ref: 'CurriculumNode', required: true },
    cognitiveLevel: {
      type: new Schema(
        {
          caps: { type: String, required: true },
          blooms: { type: String, required: true },
        },
        { _id: false },
      ),
      default: null,
    },
    correct: { type: Boolean, required: true },
    score: { type: Number, min: 0, required: true },
    maxScore: { type: Number, min: 0, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    attemptNumber: { type: Number, min: 1, required: true },
    response: { type: String, default: '' },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

studentAttemptSchema.index({ studentId: 1, contentResourceId: 1, blockId: 1 });
studentAttemptSchema.index({ studentId: 1, curriculumNodeId: 1 });
studentAttemptSchema.index({ schoolId: 1, createdAt: -1 });

export const StudentAttempt = mongoose.model<IStudentAttempt>(
  'StudentAttempt',
  studentAttemptSchema,
);

// ─── Student Mastery ────────────────────────────────────────────────────────

export interface ICognitiveBreakdown {
  knowledge: number;
  routine: number;
  complex: number;
  problemSolving: number;
}

export interface IStudentMastery extends Document {
  studentId: Types.ObjectId;
  curriculumNodeId: Types.ObjectId;
  schoolId: Types.ObjectId;
  masteryLevel: number;
  attemptCount: number;
  correctCount: number;
  lastAttemptAt: Date | null;
  cognitiveBreakdown: ICognitiveBreakdown;
  weakAreas: string[];
  updatedAt: Date;
}

const cognitiveBreakdownSchema = new Schema<ICognitiveBreakdown>(
  {
    knowledge: { type: Number, min: 0, max: 100, default: 0 },
    routine: { type: Number, min: 0, max: 100, default: 0 },
    complex: { type: Number, min: 0, max: 100, default: 0 },
    problemSolving: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
);

const studentMasterySchema = new Schema<IStudentMastery>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    curriculumNodeId: { type: Schema.Types.ObjectId, ref: 'CurriculumNode', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    masteryLevel: { type: Number, min: 0, max: 100, default: 0 },
    attemptCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: null },
    cognitiveBreakdown: {
      type: cognitiveBreakdownSchema,
      default: () => ({ knowledge: 0, routine: 0, complex: 0, problemSolving: 0 }),
    },
    weakAreas: { type: [String], default: [] },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

studentMasterySchema.index({ studentId: 1, curriculumNodeId: 1 }, { unique: true });
studentMasterySchema.index({ schoolId: 1, curriculumNodeId: 1 });

export const StudentMastery = mongoose.model<IStudentMastery>(
  'StudentMastery',
  studentMasterySchema,
);
