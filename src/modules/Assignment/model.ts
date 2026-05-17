// Assignment module — long-form, rubric-marked deliverables (essays, projects,
// research tasks). Distinct from:
//   • Homework  — short, recurring, typically auto-gradable per question.
//   • AssessmentPaper — timed test/exam with memo-marked questions.
//
// An Assignment is composed once (brief + rubric + total marks) and then
// pushed to one or more classes via `assignedClasses[]`, mirroring the paper
// assignment pattern (see QuestionBank/model-papers.ts → IPaperAssignment).
// Each (assignment, student) pair gets a single AssignmentSubmission doc that
// the teacher marks against the rubric.

import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const ASSIGNMENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const ASSIGNMENT_SUBMISSION_FORMATS = ['file', 'text', 'both'] as const;
export type AssignmentSubmissionFormat = (typeof ASSIGNMENT_SUBMISSION_FORMATS)[number];

export const ASSIGNMENT_LATE_POLICIES = ['block', 'penalty', 'accept'] as const;
export type AssignmentLatePolicy = (typeof ASSIGNMENT_LATE_POLICIES)[number];

export const ASSIGNMENT_SUBMISSION_STATUSES = [
  'submitted', 'marking', 'marked', 'published',
] as const;
export type AssignmentSubmissionStatus = (typeof ASSIGNMENT_SUBMISSION_STATUSES)[number];

// ─── Rubric criterion (subdoc on Assignment) ─────────────────────────────────

export interface IAssignmentRubricCriterion {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  // Marks available for this criterion. Sum of all criteria's maxMarks
  // should equal Assignment.totalMarks (validated in service layer).
  maxMarks: number;
}

const rubricCriterionSchema = new Schema<IAssignmentRubricCriterion>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    maxMarks: { type: Number, required: true, min: 0, max: 1000 },
  },
  { _id: true },
);

// ─── Class assignment (subdoc on Assignment) ─────────────────────────────────
// Mirrors IPaperAssignment shape — the same delivery semantics apply.

export interface IAssignmentClassAssignment {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  releaseAt: Date | null;
  dueAt: Date | null;
  assignedBy: Types.ObjectId;
  assignedAt: Date;
}

export interface IAssignmentAssessmentLink {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  assessmentId: Types.ObjectId;
}

const classAssignmentSchema = new Schema<IAssignmentClassAssignment>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    releaseAt: { type: Date, default: null },
    dueAt: { type: Date, default: null },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: true },
);

const assessmentLinkSchema = new Schema<IAssignmentAssessmentLink>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
  },
  { _id: true },
);

// ─── Assignment ──────────────────────────────────────────────────────────────

export interface IAssignment extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  title: string;
  // The actual task description (markdown). Shown to students.
  brief: string;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  // One assignment can span several CAPS topics — same shape as papers.
  // Service-level validation verifies topic availability and, where academic
  // rows are bridged to CAPS nodes, subject/grade/term alignment.
  topicIds: Types.ObjectId[];
  totalMarks: number;
  rubric: IAssignmentRubricCriterion[];
  submissionFormat: AssignmentSubmissionFormat;
  status: AssignmentStatus;
  assignedClasses: IAssignmentClassAssignment[];
  latePolicy: AssignmentLatePolicy;
  latePenaltyPercent?: number;
  gradebookAutoPublish: boolean;
  // Cached link to the gradebook Assessment doc (lazily created on first
  // publish, mirrors Homework.assessmentId).
  assessmentId?: Types.ObjectId | null;
  assessmentLinks: IAssignmentAssessmentLink[];
  version: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    brief: { type: String, required: true, maxlength: 20000 },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    topicIds: {
      type: [Schema.Types.ObjectId],
      ref: 'CurriculumNode',
      default: [],
    },
    totalMarks: { type: Number, required: true, min: 1, max: 1000 },
    rubric: { type: [rubricCriterionSchema], default: [] },
    submissionFormat: {
      type: String,
      enum: ASSIGNMENT_SUBMISSION_FORMATS,
      required: true,
      default: 'both',
    },
    status: {
      type: String,
      enum: ASSIGNMENT_STATUSES,
      default: 'draft',
    },
    assignedClasses: { type: [classAssignmentSchema], default: [] },
    latePolicy: {
      type: String,
      enum: ASSIGNMENT_LATE_POLICIES,
      default: 'block',
      required: true,
    },
    latePenaltyPercent: { type: Number, min: 0, max: 100, default: undefined },
    gradebookAutoPublish: { type: Boolean, default: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', default: null },
    assessmentLinks: { type: [assessmentLinkSchema], default: [] },
    version: { type: Number, default: 1, min: 1 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assignmentSchema.index({ schoolId: 1, teacherId: 1, createdAt: -1 });
assignmentSchema.index({ schoolId: 1, status: 1, isDeleted: 1 });
assignmentSchema.index({ schoolId: 1, isDeleted: 1, createdAt: -1 });
assignmentSchema.index({ 'assignedClasses.classId': 1, schoolId: 1 });
assignmentSchema.index({ 'assessmentLinks.classId': 1, schoolId: 1 });

// Registered as 'TeacherAssignment' to avoid colliding with the Learning
// module's pre-existing 'AssignmentSubmission' model (and the same naming
// space for clarity). The TS export stays as `Assignment` — only the
// registered Mongoose name + collection differs.
export const Assignment = mongoose.model<IAssignment>('TeacherAssignment', assignmentSchema);

// ─── AssignmentSubmission ────────────────────────────────────────────────────

export interface IAssignmentSubmissionFile {
  filename: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface IAssignmentRubricMark {
  // References Assignment.rubric[]._id at the time of submission.
  criterionId: Types.ObjectId;
  awarded: number;
  feedback?: string;
}

export interface IAssignmentLateAdjustment {
  rawMark: number;
  penaltyPercent: number;
  finalMark: number;
}

export interface IAssignmentSubmission extends Document {
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  // Captured at submit time — which class assignment triggered this. Lets us
  // filter submissions per-class even if a student belongs to one of several
  // classes the assignment was pushed to.
  classId: Types.ObjectId;
  assignmentVersion: number;
  files: IAssignmentSubmissionFile[];
  textAnswer?: string;
  submittedAt: Date;
  isLate: boolean;
  status: AssignmentSubmissionStatus;
  rubricMarks: IAssignmentRubricMark[];
  totalMark?: number;
  teacherFeedback?: string;
  markedAt?: Date;
  markedBy?: Types.ObjectId | null;
  lateMarkAdjustment?: IAssignmentLateAdjustment;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const submissionFileSchema = new Schema<IAssignmentSubmissionFile>(
  {
    filename: { type: String, required: true, trim: true, maxlength: 300 },
    url: { type: String, required: true, trim: true, maxlength: 2000 },
    sizeBytes: { type: Number, required: true, min: 0 },
    mimeType: { type: String, required: true, trim: true, maxlength: 200 },
    uploadedAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false },
);

const rubricMarkSchema = new Schema<IAssignmentRubricMark>(
  {
    criterionId: { type: Schema.Types.ObjectId, required: true },
    awarded: { type: Number, required: true, min: 0 },
    feedback: { type: String, trim: true, maxlength: 5000 },
  },
  { _id: false },
);

const lateAdjustmentSchema = new Schema<IAssignmentLateAdjustment>(
  {
    rawMark: { type: Number, required: true },
    penaltyPercent: { type: Number, required: true },
    finalMark: { type: Number, required: true },
  },
  { _id: false },
);

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'TeacherAssignment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    assignmentVersion: { type: Number, required: true, min: 1 },
    files: { type: [submissionFileSchema], default: [] },
    textAnswer: { type: String, maxlength: 100_000 },
    submittedAt: { type: Date, required: true },
    isLate: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ASSIGNMENT_SUBMISSION_STATUSES,
      required: true,
      default: 'submitted',
    },
    rubricMarks: { type: [rubricMarkSchema], default: [] },
    totalMark: { type: Number, default: undefined },
    teacherFeedback: { type: String, trim: true, maxlength: 5000 },
    markedAt: { type: Date },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    lateMarkAdjustment: { type: lateAdjustmentSchema, default: undefined },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// One submission per (assignment, student). Resubmissions update the same doc.
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
assignmentSubmissionSchema.index({ studentId: 1 });
assignmentSubmissionSchema.index({ schoolId: 1, status: 1 });
assignmentSubmissionSchema.index({ assignmentId: 1, status: 1 });

export const AssignmentSubmission = mongoose.model<IAssignmentSubmission>(
  'TeacherAssignmentSubmission',
  assignmentSubmissionSchema,
);
