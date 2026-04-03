import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Submit Attempt ─────────────────────────────────────────────────────────

export const submitAttemptSchema = z.object({
  blockId: z.string().min(1),
  curriculumNodeId: objectIdSchema,
  response: z.string().default(''),
  timeSpentSeconds: z.number().int().min(0).default(0),
  hintsUsed: z.number().int().min(0).default(0),
}).strict();

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;

// ─── Mastery Query ──────────────────────────────────────────────────────────

export const masteryQuerySchema = z.object({
  studentId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export type MasteryQueryInput = z.infer<typeof masteryQuerySchema>;

// ─── Student Resource Query ─────────────────────────────────────────────────

export const studentResourceQuerySchema = z.object({
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  term: z.coerce.number().int().min(1).max(4).optional(),
  type: z.enum(['lesson', 'study_notes', 'worksheet', 'worked_example', 'activity']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export type StudentResourceQueryInput = z.infer<typeof studentResourceQuerySchema>;
