import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const principalQuerySchema = z.object({
  schoolId: objectIdSchema.optional(),
  term: z.coerce.number().int().min(1).max(4).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  subjectId: objectIdSchema.optional(),
  metrics: z.string().optional(),
}).strict();

const benchmarkTargetSchema = z.object({
  district: z.number().min(0).max(100),
  national: z.number().min(0).max(100),
  schoolTarget: z.number().min(0).max(100),
}).strict();

export const benchmarkUpdateSchema = z.object({
  schoolId: objectIdSchema.optional(),
  benchmarks: z.object({
    attendanceRate: benchmarkTargetSchema.optional(),
    passRate: benchmarkTargetSchema.optional(),
    feeCollectionRate: benchmarkTargetSchema.optional(),
    teacherAttendanceRate: benchmarkTargetSchema.optional(),
    homeworkCompletionRate: benchmarkTargetSchema.optional(),
  }).optional(),
  annualBudget: z.number().min(0).optional(),
  monthlyExpenseEstimate: z.number().min(0).optional(),
}).strict();

export type PrincipalQueryInput = z.infer<typeof principalQuerySchema>;
export type BenchmarkUpdateInput = z.infer<typeof benchmarkUpdateSchema>;
