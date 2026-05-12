import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, 'invalid id');

export const studentLessonListQuerySchema = z.object({
  subjectId: objectId.optional(),
  status: z.enum(['planned', 'taught', 'all']).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export const studentLessonParamSchema = z.object({
  id: objectId,
});

export type StudentLessonListQuery = z.infer<typeof studentLessonListQuerySchema>;
export type StudentLessonParam = z.infer<typeof studentLessonParamSchema>;
