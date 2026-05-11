import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Block Types ────────────────────────────────────────────────────────────

const blockTypeEnum = z.enum([
  'text', 'image', 'video', 'quiz', 'drag_drop', 'fill_blank',
  'match_columns', 'ordering', 'hotspot', 'step_reveal', 'code',
]);

const resourceTypeEnum = z.enum([
  'lesson', 'study_notes', 'worksheet', 'worked_example', 'activity',
]);

const resourceFormatEnum = z.enum(['static', 'interactive']);

const resourceSourceEnum = z.enum(['oer', 'ai_generated', 'teacher', 'system', 'imported']);

// ─── Cognitive Level ────────────────────────────────────────────────────────

const cognitiveLevelSchema = z.object({
  caps: z.string().nullable().default(null),
  blooms: z.string().nullable().default(null),
}).strict();

// ─── Content Block ──────────────────────────────────────────────────────────

const contentBlockSchema = z.object({
  blockId: z.string().min(1),
  type: blockTypeEnum,
  order: z.number().int().min(0).default(0),
  content: z.string().default(''),
  curriculumNodeId: objectIdSchema.nullable().default(null),
  cognitiveLevel: cognitiveLevelSchema.nullable().default(null),
  points: z.number().min(0).default(0),
  hints: z.array(z.string()).default([]),
  explanation: z.string().default(''),
  metadata: z.record(z.string(), z.unknown()).default({}),
}).strict();

// ─── Create Resource ────────────────────────────────────────────────────────

export const createResourceSchema = z.object({
  curriculumNodeId: objectIdSchema,
  lessonPlanId: objectIdSchema.nullable().optional(),
  type: resourceTypeEnum,
  format: resourceFormatEnum.default('static'),
  title: z.string().min(1, 'Title is required').trim(),
  blocks: z.array(contentBlockSchema).default([]),
  source: resourceSourceEnum.default('teacher'),
  sourceAttribution: z.string().default(''),
  gradeId: objectIdSchema,
  subjectId: objectIdSchema,
  term: z.number().int().min(1).max(4),
  tags: z.array(z.string()).default([]),
  difficulty: z.number().int().min(1).max(5).default(3),
  estimatedMinutes: z.number().int().min(0).default(0),
  prerequisites: z.array(objectIdSchema).default([]),
  sourceImport: z.object({
    jobId: z.string(),
    storagePath: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    pageRange: z.object({ start: z.number().int().min(1), end: z.number().int().min(1) }),
  }).optional(),
  needsReview: z.boolean().default(false),
}).strict();

// ─── Update Resource ────────────────────────────────────────────────────────

export const updateResourceSchema = z.object({
  title: z.string().min(1).trim().optional(),
  blocks: z.array(contentBlockSchema).optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  estimatedMinutes: z.number().int().min(0).optional(),
  format: resourceFormatEnum.optional(),
  prerequisites: z.array(objectIdSchema).optional(),
}).strict();

// ─── Review Resource ────────────────────────────────────────────────────────

export const reviewResourceSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().default(''),
}).strict();

// ─── Generate Content ───────────────────────────────────────────────────────

export const generateContentSchema = z.object({
  curriculumNodeId: objectIdSchema,
  lessonPlanId: objectIdSchema.optional(),
  type: resourceTypeEnum,
  gradeId: objectIdSchema,
  subjectId: objectIdSchema,
  term: z.number().int().min(1).max(4),
  blockTypes: z.array(blockTypeEnum).min(1),
  difficulty: z.number().int().min(1).max(5).default(3),
  instructions: z.string().default(''),
}).strict();

// ─── Query ──────────────────────────────────────────────────────────────────

export const resourceQuerySchema = z.object({
  curriculumNodeId: objectIdSchema.optional(),
  lessonPlanId: objectIdSchema.optional(),
  type: resourceTypeEnum.optional(),
  format: resourceFormatEnum.optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected']).optional(),
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  term: z.coerce.number().int().min(1).max(4).optional(),
  search: z.string().optional(),
  source: resourceSourceEnum.optional(),
  mine: z.preprocess((val) => val === 'true', z.boolean()).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

// ─── Refine Resource ───────────────────────────────────────────────────────

export const refineResourceSchema = z.object({
  instruction: z.string().min(1).max(1000),
}).strict();

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ReviewResourceInput = z.infer<typeof reviewResourceSchema>;
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
export type RefineResourceInput = z.infer<typeof refineResourceSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
