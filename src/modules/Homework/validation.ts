import { z } from 'zod/v4';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

// ─── Homework create payloads ───────────────────────────────────────────────

const baseHomeworkFields = {
  title: z.string().min(1).max(200),
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  schoolId: objectIdSchema.optional(),
  dueDate: z.iso.datetime(),
  totalMarks: z.number().int().min(0).max(1000),
  attachments: z.array(z.url()).max(20).optional(),
  latePolicy: z.enum(['block', 'penalty', 'accept']).default('block'),
  latePenaltyPercent: z.number().int().min(0).max(100).optional(),
  gradebookAutoPublish: z.boolean().default(true),
};

export const createQuizHomeworkSchema = z.object({
  type: z.literal('quiz'),
  quizId: objectIdSchema,
  ...baseHomeworkFields,
});

export const createReadingHomeworkSchema = z.object({
  type: z.literal('reading'),
  contentResourceId: objectIdSchema,
  pageRange: z.string().max(50).optional(),
  comprehensionQuestionIds: z.array(objectIdSchema).min(1).max(10).optional(),
  ...baseHomeworkFields,
});

export const createExerciseHomeworkSchema = z.object({
  type: z.literal('exercise'),
  exerciseQuestionIds: z.array(objectIdSchema).min(1).max(100),
  ...baseHomeworkFields,
});

export const createHomeworkSchema = z.discriminatedUnion('type', [
  createQuizHomeworkSchema,
  createReadingHomeworkSchema,
  createExerciseHomeworkSchema,
]).refine(
  (data) => data.latePolicy !== 'penalty' || (typeof data.latePenaltyPercent === 'number' && data.latePenaltyPercent > 0),
  { message: 'latePenaltyPercent must be > 0 when latePolicy is penalty', path: ['latePenaltyPercent'] },
);

export const updateHomeworkSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  dueDate: z.iso.datetime().optional(),
  totalMarks: z.number().int().min(0).max(1000).optional(),
  status: z.enum(['assigned', 'closed']).optional(),
  pageRange: z.string().max(50).optional(),
  latePolicy: z.enum(['block', 'penalty', 'accept']).optional(),
  latePenaltyPercent: z.number().int().min(0).max(100).optional(),
  gradebookAutoPublish: z.boolean().optional(),
}).strict().refine(
  (data) => data.latePolicy !== 'penalty' || (typeof data.latePenaltyPercent === 'number' && data.latePenaltyPercent > 0),
  { message: 'latePenaltyPercent must be > 0 when latePolicy is penalty', path: ['latePenaltyPercent'] },
);

// ─── Submission payloads ────────────────────────────────────────────────────

const submitAnswerBase = {
  studentAnswer: z.string().max(50_000),
};

export const submitQuizHomeworkSchema = z.object({
  type: z.literal('quiz'),
  answers: z.array(z.object({
    questionIndex: z.number().int().min(0),
    ...submitAnswerBase,
  })).min(1).max(200),
}).strict();

export const submitExerciseHomeworkSchema = z.object({
  type: z.literal('exercise'),
  answers: z.array(z.object({
    questionId: objectIdSchema,
    ...submitAnswerBase,
  })).min(1).max(100),
}).strict();

export const submitReadingHomeworkSchema = z.object({
  type: z.literal('reading'),
  markedReadAt: z.iso.datetime(),
  comprehensionAnswers: z.array(z.object({
    questionId: objectIdSchema,
    ...submitAnswerBase,
  })).max(10),
}).strict();

export const submitHomeworkSchema = z.discriminatedUnion('type', [
  submitQuizHomeworkSchema,
  submitExerciseHomeworkSchema,
  submitReadingHomeworkSchema,
]);

// ─── Comprehension Q generation ─────────────────────────────────────────────

export const generateComprehensionSchema = z.object({
  contentResourceId: objectIdSchema,
  count: z.number().int().min(2).max(8).default(4),
}).strict();

// ─── Grading override (existing PATCH /submissions/:id/grade) ───────────────

export const gradeSubmissionSchema = z.object({
  mark: z.number().min(0, 'Mark cannot be negative'),
  feedback: z.string().trim().optional(),
}).strict();

// ─── Inferred types ─────────────────────────────────────────────────────────

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>;
export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>;
export type SubmitHomeworkInput = z.infer<typeof submitHomeworkSchema>;
export type GenerateComprehensionInput = z.infer<typeof generateComprehensionSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
