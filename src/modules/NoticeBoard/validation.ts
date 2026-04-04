import { z } from 'zod/v4';

const attachmentSchema = z.object({
  url: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
}).strict();

export const createPostSchema = z.object({
  scope: z.enum(['class', 'grade', 'school']),
  scopeId: z.string().min(1, 'Scope ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  content: z.string().min(1, 'Content is required').max(4000, 'Content must be 4000 characters or fewer'),
  pinned: z.boolean().optional(),
  attachments: z.array(attachmentSchema).max(10).optional(),
}).strict();

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(4000).optional(),
  pinned: z.boolean().optional(),
}).strict();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

// ─── Query Schemas ──────────────────────────────────────────────────────────

export const myFeedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const listPostsQuerySchema = z.object({
  scope: z.enum(['class', 'grade', 'school'], { message: 'scope must be class, grade, or school' }),
  scopeId: z.string().min(1, 'scopeId is required'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
