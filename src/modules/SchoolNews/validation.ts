import { z } from 'zod/v4';

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title must be 300 characters or fewer'),
  content: z.string().min(1, 'Content is required'),
  category: z.enum(['sports', 'academic', 'cultural', 'events', 'achievements', 'general']),
  excerpt: z.string().max(500).optional(),
  tags: z.array(z.string().min(1)).max(20).optional(),
  coverImage: z.string().url('Must be a valid URL').optional(),
  featured: z.boolean().optional(),
}).strict();

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(['sports', 'academic', 'cultural', 'events', 'achievements', 'general']).optional(),
  excerpt: z.string().max(500).optional(),
  tags: z.array(z.string().min(1)).max(20).optional(),
  coverImage: z.string().url('Must be a valid URL').optional(),
  featured: z.boolean().optional(),
}).strict();

export const generateArticleSchema = z.object({
  category: z.enum(['sports', 'academic', 'cultural', 'events', 'achievements', 'general']),
  sourceType: z.enum(['sports_result', 'achievement', 'event_recap', 'term_highlights']),
  sourceId: z.string().min(1).optional(),
  customPrompt: z.string().max(1000).optional(),
}).strict();

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type GenerateArticleInput = z.infer<typeof generateArticleSchema>;
