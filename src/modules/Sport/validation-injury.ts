import { z } from 'zod/v4';
import {
  INJURY_BODY_PARTS,
  INJURY_TYPES,
  INJURY_SEVERITIES,
  INJURY_STATUSES,
  CLEARANCE_LEVELS,
} from './model-injury.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');

export const createInjurySchema = z.object({
  studentId: objectId,
  teamId: objectId.optional(),
  injuryDate: z.iso.datetime(),
  bodyPart: z.enum(INJURY_BODY_PARTS),
  type: z.enum(INJURY_TYPES),
  severity: z.enum(INJURY_SEVERITIES),
  mechanism: z.string().optional(),
  description: z.string().optional(),
  expectedReturnDate: z.iso.datetime().optional(),
});

export const updateInjurySchema = z.object({
  injuryDate: z.iso.datetime().optional(),
  bodyPart: z.enum(INJURY_BODY_PARTS).optional(),
  type: z.enum(INJURY_TYPES).optional(),
  severity: z.enum(INJURY_SEVERITIES).optional(),
  mechanism: z.string().optional(),
  description: z.string().optional(),
  expectedReturnDate: z.iso.datetime().optional(),
  actualReturnDate: z.iso.datetime().optional(),
  status: z.enum(INJURY_STATUSES).optional(),
  clearanceLevel: z.enum(CLEARANCE_LEVELS).optional(),
});

export const createRecoveryLogSchema = z.object({
  date: z.iso.datetime(),
  painLevel: z.number().int().min(0).max(10).optional(),
  mobilityScore: z.number().int().min(0).max(10).optional(),
  activitiesPerformed: z.array(z.string()).default([]),
  notes: z.string().optional(),
  nextMilestone: z.string().optional(),
});

export type CreateInjuryInput = z.infer<typeof createInjurySchema>;
export type UpdateInjuryInput = z.infer<typeof updateInjurySchema>;
export type CreateRecoveryLogInput = z.infer<typeof createRecoveryLogSchema>;
