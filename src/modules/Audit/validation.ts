import { z } from 'zod/v4';

// ─── Audit Query ────────────────────────────────────────────────────────────

export const auditQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(),
  entity: z.string().optional(),
  action: z.enum(['create', 'update', 'delete', 'login', 'export']).optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
}).strict();

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type AuditQueryInput = z.infer<typeof auditQuerySchema>;
