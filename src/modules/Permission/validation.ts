import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// ─── List Permissions ──────────────────────────────────────────────────────

export const listPermissionsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  role: z.string().optional(),
  flag: z.enum([
    'isSchoolPrincipal',
    'isHOD',
    'isBursar',
    'isReceptionist',
    'isCounselor',
  ]).optional(),
  search: z.string().optional(),
}).strict();

// ─── Update Permissions ────────────────────────────────────────────────────

export const updatePermissionsSchema = z.object({
  isSchoolPrincipal: z.boolean().optional(),
  isHOD: z.boolean().optional(),
  departmentId: z.string().regex(objectIdRegex, 'Invalid department ID').nullable().optional(),
  isBursar: z.boolean().optional(),
  isReceptionist: z.boolean().optional(),
  isCounselor: z.boolean().optional(),
}).strict();

// ─── Audit Query ───────────────────────────────────────────────────────────

export const permissionAuditQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  userId: z.string().regex(objectIdRegex, 'Invalid user ID').optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
}).strict();

// ─── Inferred Types ────────────────────────────────────────────────────────

export type ListPermissionsInput = z.infer<typeof listPermissionsSchema>;
export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>;
export type PermissionAuditQueryInput = z.infer<typeof permissionAuditQuerySchema>;
