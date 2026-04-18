import { z } from 'zod/v4';
import { COACH_ROLES } from './model-coach-assignment.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');

export const createCoachAssignmentSchema = z.object({
  userId: objectId,
  teamId: objectId,
  role: z.enum(COACH_ROLES).optional(),
  isActive: z.boolean().optional(),
});

export const updateCoachAssignmentSchema = z.object({
  role: z.enum(COACH_ROLES).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCoachAssignmentInput = z.infer<typeof createCoachAssignmentSchema>;
export type UpdateCoachAssignmentInput = z.infer<typeof updateCoachAssignmentSchema>;
