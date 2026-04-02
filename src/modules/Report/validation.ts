import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const reportQuerySchema = z.object({
  schoolId: objectIdSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  term: z.coerce.number().int().min(1).max(4).optional(),
  academicYear: z.coerce.number().int().min(2000).max(2100).optional(),
  gradeId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  period: z.enum(['daily', 'weekly', 'monthly']).optional(),
}).strict();

// ─── Inferred Types ────────────────────────────────────────────────────────────

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
