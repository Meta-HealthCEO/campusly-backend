import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const reportQuerySchema = z.object({
  schoolId: objectIdSchema,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  term: z.int().min(1).max(4).optional(),
  academicYear: z.int().min(2000).max(2100).optional(),
  gradeId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
});

// ─── Inferred Types ────────────────────────────────────────────────────────────

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
