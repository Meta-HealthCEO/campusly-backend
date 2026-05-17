import { z } from 'zod/v4';
import {
  ASSIGNMENT_LATE_POLICIES,
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_SUBMISSION_FORMATS,
} from './model.js';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

// ─── Rubric ──────────────────────────────────────────────────────────────────

export const rubricCriterionInputSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  maxMarks: z.number().int().min(0).max(1000),
});

// ─── Create / Update ────────────────────────────────────────────────────────

const baseAssignmentFields = {
  title: z.string().min(1).max(200),
  brief: z.string().min(1).max(20_000),
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  topicIds: z.array(objectIdSchema).min(1).max(20),
  totalMarks: z.number().int().min(1).max(1000),
  rubric: z.array(rubricCriterionInputSchema).min(1).max(20),
  submissionFormat: z.enum(ASSIGNMENT_SUBMISSION_FORMATS).default('both'),
  latePolicy: z.enum(ASSIGNMENT_LATE_POLICIES).default('block'),
  latePenaltyPercent: z.number().int().min(0).max(100).optional(),
  gradebookAutoPublish: z.boolean().default(true),
};

export const createAssignmentSchema = z.object(baseAssignmentFields).strict().refine(
  (data) =>
    data.latePolicy !== 'penalty' ||
    (typeof data.latePenaltyPercent === 'number' && data.latePenaltyPercent > 0),
  {
    message: 'latePenaltyPercent must be > 0 when latePolicy is penalty',
    path: ['latePenaltyPercent'],
  },
).refine(
  (data) =>
    data.rubric.length === 0 ||
    data.rubric.reduce((sum, c) => sum + c.maxMarks, 0) === data.totalMarks,
  {
    message: 'Sum of rubric criterion maxMarks must equal totalMarks',
    path: ['rubric'],
  },
);

export const updateAssignmentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  brief: z.string().min(1).max(20_000).optional(),
  totalMarks: z.number().int().min(1).max(1000).optional(),
  rubric: z.array(rubricCriterionInputSchema).min(1).max(20).optional(),
  submissionFormat: z.enum(ASSIGNMENT_SUBMISSION_FORMATS).optional(),
  status: z.enum(ASSIGNMENT_STATUSES).optional(),
  latePolicy: z.enum(ASSIGNMENT_LATE_POLICIES).optional(),
  latePenaltyPercent: z.number().int().min(0).max(100).optional(),
  gradebookAutoPublish: z.boolean().optional(),
}).strict().refine(
  (data) =>
    data.latePolicy !== 'penalty' ||
    (typeof data.latePenaltyPercent === 'number' && data.latePenaltyPercent > 0),
  {
    message: 'latePenaltyPercent must be > 0 when latePolicy is penalty',
    path: ['latePenaltyPercent'],
  },
);

// ─── Class assignment (push to a class with release/due dates) ───────────────

export const createClassAssignmentSchema = z.object({
  classId: objectIdSchema,
  releaseAt: z.iso.datetime().nullable().optional(),
  dueAt: z.iso.datetime().nullable().optional(),
}).strict().refine(
  (data) => {
    if (!data.releaseAt || !data.dueAt) return true;
    return new Date(data.releaseAt) <= new Date(data.dueAt);
  },
  {
    message: 'releaseAt must be before dueAt',
    path: ['releaseAt'],
  },
);

// ─── Submit (student) ────────────────────────────────────────────────────────

export const submitFileSchema = z.object({
  filename: z.string().min(1).max(300),
  url: z.string()
    .min(1)
    .max(2000)
    .regex(
      /^\/uploads\/assignment-submissions\/[0-9a-f-]+\.[a-z0-9]+$/i,
      'Invalid assignment upload URL',
    ),
  sizeBytes: z.number().int().min(1).max(25 * 1024 * 1024),
  mimeType: z.string().min(1).max(200),
}).strict();

export const submitAssignmentSchema = z.object({
  files: z.array(submitFileSchema).max(10).default([]),
  textAnswer: z.string().max(100_000).optional(),
}).strict().refine(
  (data) => data.files.length > 0 || (data.textAnswer && data.textAnswer.trim().length > 0),
  { message: 'Submission must include at least one file or text answer' },
);

// ─── Marking (teacher) ──────────────────────────────────────────────────────

export const markRubricEntrySchema = z.object({
  criterionId: objectIdSchema,
  awarded: z.number().min(0),
  feedback: z.string().max(5000).optional(),
}).strict();

export const markSubmissionSchema = z.object({
  rubricMarks: z.array(markRubricEntrySchema).min(1).max(20),
  teacherFeedback: z.string().max(5000).optional(),
  publish: z.boolean().default(false),
}).strict();

// ─── AI brief + rubric generator ────────────────────────────────────────────
// Two-part input by design:
//   • Structured config — subject/grade/topic/marks/length give the model
//     the assessment shape it needs to draft sensibly.
//   • Free-text instructions — the teacher writes EXACTLY what they want
//     ("1500-word essay on causes of WW1, focus on Eastern Front, accept
//      video as alternate format"). The AI weaves this verbatim into the
//     brief and rubric criteria.

export const ASSIGNMENT_LENGTHS = ['short', 'medium', 'long', 'project'] as const;
export type AssignmentLengthHint = (typeof ASSIGNMENT_LENGTHS)[number];

export const generateAssignmentSchema = z.object({
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  topicIds: z.array(objectIdSchema).min(1).max(20),
  totalMarks: z.number().int().min(1).max(1000),
  // Length hint guides the AI: short=worksheet-scale, medium=essay/report,
  // long=long essay/case study, project=multi-week deliverable. Optional —
  // the AI can still draft from instructions alone if omitted.
  lengthHint: z.enum(ASSIGNMENT_LENGTHS).optional(),
  // Number of rubric criteria the AI should produce. Marks per criterion
  // are auto-distributed to sum to totalMarks. Default 4 — common scheme.
  criterionCount: z.number().int().min(2).max(10).default(4),
  // The "exactly what I want" field. Required — generic prompts produce
  // generic output. Force the teacher to articulate the deliverable.
  instructions: z.string().min(10, 'Tell the AI what you want — minimum 10 characters').max(4000),
}).strict();

// ─── Inferred types ─────────────────────────────────────────────────────────

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type CreateClassAssignmentInput = z.infer<typeof createClassAssignmentSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
export type MarkSubmissionInput = z.infer<typeof markSubmissionSchema>;
export type GenerateAssignmentInput = z.infer<typeof generateAssignmentSchema>;
