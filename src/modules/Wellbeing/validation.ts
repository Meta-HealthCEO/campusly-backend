import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const questionTypes = ['scale', 'multiple_choice', 'text', 'yes_no'] as const;

// ─── Survey ────────────────────────────────────────────────────────────────

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required').max(500),
  type: z.enum(questionTypes),
  scaleMin: z.number().optional(),
  scaleMax: z.number().optional(),
  scaleLabels: z.record(z.string(), z.string()).optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
}).strict();

export const createSurveySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  isAnonymous: z.boolean().optional(),
  targetGrades: z.array(z.number()).min(1, 'At least one grade required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  questions: z.array(questionSchema).min(1, 'At least one question required'),
}).strict();

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;

export const updateSurveySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  isAnonymous: z.boolean().optional(),
  targetGrades: z.array(z.number()).optional(),
  status: z.enum(['draft', 'active', 'closed']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  questions: z.array(questionSchema).optional(),
}).strict();

export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>;

// ─── Survey Response ───────────────────────────────────────────────────────

export const submitResponseSchema = z.object({
  answers: z.array(z.object({
    questionIndex: z.number().min(0),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }).strict()).min(1, 'At least one answer required'),
}).strict();

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;

// ─── Dashboard Query ───────────────────────────────────────────────────────

export const moodDashboardQuerySchema = z.object({
  period: z.enum(['week', 'month', 'term']).optional(),
  gradeFilter: z.coerce.number().optional(),
}).strict();

export type MoodDashboardQuery = z.infer<typeof moodDashboardQuerySchema>;
