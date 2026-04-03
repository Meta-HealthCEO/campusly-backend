import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Create Textbook ───────────────────────────────────────────────────────

export const createTextbookSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().default(''),
  frameworkId: objectIdSchema,
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  coverImageUrl: z.string().default(''),
}).strict();

export type CreateTextbookInput = z.infer<typeof createTextbookSchema>;

// ─── Update Textbook ───────────────────────────────────────────────────────

export const updateTextbookSchema = z.object({
  title: z.string().min(1, 'Title is required').trim().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
}).strict();

export type UpdateTextbookInput = z.infer<typeof updateTextbookSchema>;

// ─── Add Chapter ───────────────────────────────────────────────────────────

export const addChapterSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().default(''),
  curriculumNodeId: objectIdSchema.nullable().default(null),
  order: z.number().int().min(0),
}).strict();

export type AddChapterInput = z.infer<typeof addChapterSchema>;

// ─── Update Chapter ────────────────────────────────────────────────────────

export const updateChapterSchema = z.object({
  title: z.string().min(1, 'Title is required').trim().optional(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
}).strict();

export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;

// ─── Add Resource to Chapter ───────────────────────────────────────────────

export const addResourceToChapterSchema = z.object({
  resourceId: objectIdSchema,
  order: z.number().int().min(0),
}).strict();

export type AddResourceToChapterInput = z.infer<typeof addResourceToChapterSchema>;

// ─── Reorder Chapters ──────────────────────────────────────────────────────

export const reorderChaptersSchema = z.object({
  chapterIds: z.array(objectIdSchema).min(1, 'At least one chapter ID required'),
}).strict();

export type ReorderChaptersInput = z.infer<typeof reorderChaptersSchema>;

// ─── Query ─────────────────────────────────────────────────────────────────

export const textbookQuerySchema = z.object({
  frameworkId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type TextbookQueryInput = z.infer<typeof textbookQuerySchema>;
