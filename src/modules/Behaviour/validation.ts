import { z } from 'zod';
import { objectIdSchema } from '../../common/validation.js';
import { BEHAVIOUR_KINDS, SEVERITIES } from './behaviour-rules.js';
import { BEHAVIOUR_SOURCES } from './model.js';

export const logBehaviourSchema = z.object({
  studentId: objectIdSchema,
  kind: z.enum(BEHAVIOUR_KINDS),
  category: z.string().min(1).max(40),
  points: z.number().int().optional(),
  severity: z.enum(SEVERITIES).optional(),
  note: z.string().max(500).optional(),
  source: z.enum(BEHAVIOUR_SOURCES).optional(),
  requestKey: z.string().max(64).optional(),
}).strict();

export const classBehaviourQuerySchema = z.object({ classId: objectIdSchema });
