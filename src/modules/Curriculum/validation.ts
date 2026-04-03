import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Topic ────────────────────────────────────────────────────────────────────

export const topicSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().default(''),
  weekNumber: z.number().int().min(1),
  expectedStartDate: z.string().min(1, 'Expected start date is required'),
  expectedEndDate: z.string().min(1, 'Expected end date is required'),
  capsReference: z.string().default(''),
  status: z.enum(['not_started', 'in_progress', 'completed', 'skipped']).default('not_started'),
  completedDate: z.string().nullable().optional(),
  percentComplete: z.number().min(0).max(100).default(0),
});

export type TopicInput = z.infer<typeof topicSchema>;

// ─── CurriculumPlan ──────────────────────────────────────────────────────────

export const createPlanSchema = z.object({
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  term: z.number().int().min(1).max(4),
  year: z.number().int().min(2020),
  topics: z.array(topicSchema).default([]),
}).strict();

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = z.object({
  topics: z.array(topicSchema),
}).strict();

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

export const planQuerySchema = z.object({
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  term: z.coerce.number().int().min(1).max(4).optional(),
  year: z.coerce.number().int().min(2020).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

// ─── PacingUpdate / Progress ─────────────────────────────────────────────────

const topicUpdateSchema = z.object({
  topicId: objectIdSchema,
  status: z.enum(['not_started', 'in_progress', 'completed', 'skipped']),
  completedDate: z.string().nullable().optional(),
  percentComplete: z.number().min(0).max(100).default(0),
  notes: z.string().default(''),
});

export const submitProgressSchema = z.object({
  weekEnding: z.string().min(1, 'Week ending date is required'),
  topicUpdates: z.array(topicUpdateSchema).default([]),
  overallNotes: z.string().default(''),
  challengesFaced: z.string().default(''),
  plannedContentDelivered: z.number().min(0).max(100).default(0),
}).strict();

export type SubmitProgressInput = z.infer<typeof submitProgressSchema>;

export const progressQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

// ─── NationalBenchmark ────────────────────────────────────────────────────────

export const saveBenchmarkSchema = z.object({
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  year: z.number().int().min(2020),
  targetPassRate: z.number().min(0).max(100),
  targetAverageScore: z.number().min(0).max(100).optional(),
  source: z.string().default(''),
}).strict();

export type SaveBenchmarkInput = z.infer<typeof saveBenchmarkSchema>;

export const benchmarkQuerySchema = z.object({
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  year: z.coerce.number().int().min(2020).optional(),
}).strict();

// ─── Pacing Overview ─────────────────────────────────────────────────────────

export const overviewQuerySchema = z.object({
  term: z.coerce.number().int().min(1).max(4).optional(),
  year: z.coerce.number().int().min(2020).optional(),
  departmentId: objectIdSchema.optional(),
}).strict();

// ─── Intervention ─────────────────────────────────────────────────────────────

export const updateInterventionSchema = z.object({
  status: z.enum(['active', 'acknowledged', 'resolved']).optional(),
  notes: z.string().optional(),
}).strict();

export type UpdateInterventionInput = z.infer<typeof updateInterventionSchema>;

export const interventionQuerySchema = z.object({
  status: z.enum(['active', 'acknowledged', 'resolved']).optional(),
  teacherId: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
