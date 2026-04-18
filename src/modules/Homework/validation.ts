import { z } from 'zod/v4';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

// ─── Homework (typed discriminator: quiz | reading | exercise) ──────────────

const baseHomeworkFields = {
  title: z.string().min(1).max(200),
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  schoolId: objectIdSchema,
  dueDate: z.iso.datetime(),
  totalMarks: z.number().int().min(0).max(1000),
  attachments: z.array(z.url()).max(20).optional(),
  peerReviewEnabled: z.boolean().optional(),
  groupAssignment: z.boolean().optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().int().positive().optional(),
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
]);

export const updateHomeworkSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  dueDate: z.iso.datetime().optional(),
  totalMarks: z.number().int().min(0).max(1000).optional(),
  status: z.enum(['assigned', 'closed']).optional(),
  pageRange: z.string().max(50).optional(),
}).strict();

// ─── Submission ──────────────────────────────────────────────────────────────

export const submitHomeworkSchema = z.object({
  files: z.array(z.string()).min(1, 'At least one file is required'),
}).strict();

// ─── Grading ─────────────────────────────────────────────────────────────────

export const gradeSubmissionSchema = z.object({
  mark: z.number().min(0, 'Mark cannot be negative'),
  feedback: z.string().trim().optional(),
}).strict();

// ─── Inferred types ──────────────────────────────────────────────────────────

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>;
export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>;
export type SubmitHomeworkInput = z.infer<typeof submitHomeworkSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
