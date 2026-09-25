// src/modules/Readiness/validation.ts
import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

export const idParams = z.object({ id: objectIdSchema });
export const blueprintListQuery = z.object({
  status: z.enum(['draft', 'published', 'retired']).optional(), family: z.string().max(60).optional(),
  examYear: z.coerce.number().int().optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(25),
});
const flag = { verified: z.boolean().optional(), sourceRef: z.string().max(80).optional() };
export const verificationBody = z.object({
  papers: z.array(z.object({
    key: z.string().regex(/^P[1-9]$/), ...flag,
    examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(), sitting: z.enum(['morning', 'afternoon']).nullable().optional(),
  }).strict()).optional(),
  topics: z.array(z.object({ key: z.string().regex(/^P[1-9]\.[A-Z0-9]{2,12}$/), ...flag }).strict()).optional(),
  levels: z.array(z.object({ key: z.string().min(1).max(40), ...flag }).strict()).optional(),
}).strict();
export const publishBody = z.object({ acknowledgeWarnings: z.boolean() }).strict();
