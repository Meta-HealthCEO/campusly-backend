import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

export const textbookIdParamsSchema = z.object({
  id: objectIdSchema,
}).strict();

export const textbookChapterParamsSchema = z.object({
  id: objectIdSchema,
  chapterId: objectIdSchema,
}).strict();

export const textbookChapterResourceParamsSchema = z.object({
  id: objectIdSchema,
  chapterId: objectIdSchema,
  resourceId: objectIdSchema,
}).strict();

export const createTextbookSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().default(''),
  frameworkId: objectIdSchema,
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  coverImageUrl: z.string().default(''),
}).strict();

export type CreateTextbookInput = z.infer<typeof createTextbookSchema>;

export const updateTextbookSchema = z.object({
  title: z.string().min(1, 'Title is required').trim().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
}).strict();

export type UpdateTextbookInput = z.infer<typeof updateTextbookSchema>;

export const addChapterSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().default(''),
  curriculumNodeId: objectIdSchema.nullable().default(null),
  order: z.number().int().min(0),
}).strict();

export type AddChapterInput = z.infer<typeof addChapterSchema>;

export const updateChapterSchema = z.object({
  title: z.string().min(1, 'Title is required').trim().optional(),
  description: z.string().optional(),
  curriculumNodeId: objectIdSchema.nullable().optional(),
  order: z.number().int().min(0).optional(),
}).strict();

export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;

export const addResourceToChapterSchema = z.object({
  resourceId: objectIdSchema,
  order: z.number().int().min(0),
}).strict();

export type AddResourceToChapterInput = z.infer<typeof addResourceToChapterSchema>;

export const reorderChaptersSchema = z.object({
  chapterIds: z.array(objectIdSchema)
    .min(1, 'At least one chapter ID required')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'chapterIds must be unique',
    }),
}).strict();

export type ReorderChaptersInput = z.infer<typeof reorderChaptersSchema>;

export const textbookQuerySchema = z.object({
  frameworkId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
}).strict();

export type TextbookQueryInput = z.infer<typeof textbookQuerySchema>;
