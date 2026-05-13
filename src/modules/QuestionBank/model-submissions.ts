// src/modules/QuestionBank/model-submissions.ts
//
// Student's answers to a paper that was assigned to their class (digital
// mode). One submission per (paper, student) — auto-saved while the student
// works, then finalised on submit and (optionally) fed into the existing
// AI-marking flow via the linked PaperMarking.

import mongoose, { Schema, Document, Types } from 'mongoose';

export const SUBMISSION_STATUSES = [
  'in_progress', // started, autosaves accepted
  'submitted',   // student clicked submit; marking may be in flight
  'graded',      // PaperMarking completed — teacher can review
  'published',   // teacher published the mark to the gradebook
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export interface ISubmissionAnswer {
  questionNumber: string;
  answer: string;
  selectedOption: string | null; // MCQ label e.g. "A"
}

export interface IPaperSubmission extends Document {
  paperId: Types.ObjectId;
  assignmentId: Types.ObjectId; // links to AssessmentPaper.assignments[].\_id
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  studentId: Types.ObjectId;
  studentName: string;          // snapshot — survives student rename
  paperVersion: number;
  answers: ISubmissionAnswer[];
  status: SubmissionStatus;
  startedAt: Date;
  lastSavedAt: Date | null;
  submittedAt: Date | null;
  markingId: Types.ObjectId | null; // → PaperMarking once auto-graded
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const submissionAnswerSchema = new Schema<ISubmissionAnswer>(
  {
    questionNumber: { type: String, required: true },
    answer: { type: String, default: '' },
    selectedOption: { type: String, default: null },
  },
  { _id: false },
);

const paperSubmissionSchema = new Schema<IPaperSubmission>(
  {
    paperId: { type: Schema.Types.ObjectId, ref: 'AssessmentPaper', required: true },
    assignmentId: { type: Schema.Types.ObjectId, required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true, trim: true },
    paperVersion: { type: Number, required: true, min: 1, default: 1 },
    answers: { type: [submissionAnswerSchema], default: [] },
    status: {
      type: String,
      enum: SUBMISSION_STATUSES,
      default: 'in_progress',
    },
    startedAt: { type: Date, default: () => new Date() },
    lastSavedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    markingId: { type: Schema.Types.ObjectId, ref: 'PaperMarking', default: null },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// One in-progress / submitted record per (paper, student). Unique partial
// index excludes soft-deleted rows so a student can re-take after a teacher
// soft-deletes a previous attempt (rare admin recovery path).
paperSubmissionSchema.index(
  { paperId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

// Teacher review: "all submissions for this paper".
paperSubmissionSchema.index({ schoolId: 1, paperId: 1, status: 1, isDeleted: 1 });
// Student dashboard: "all my submissions".
paperSubmissionSchema.index({ schoolId: 1, studentId: 1, status: 1, isDeleted: 1 });

export const PaperSubmission = mongoose.model<IPaperSubmission>(
  'PaperSubmission', paperSubmissionSchema,
);
