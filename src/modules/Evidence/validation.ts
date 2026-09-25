// src/modules/Evidence/validation.ts
import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';
import { TYPE_STATUSES } from './model-taxonomy.js';

export const taxonomyListQuery = z.object({
  status: z.enum(TYPE_STATUSES).optional(),
  topicNodeId: objectIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
export const idParams = z.object({ id: objectIdSchema });
export const renameTypeBody = z.object({
  label: z.string().trim().min(2).max(60).optional(),
  learnerLabel: z.string().trim().min(2).max(60).optional(),
  description: z.string().trim().max(300).optional(),
}).strict().refine((b) => Object.keys(b).length > 0, { message: 'Change at least one field' });
export const mergeTypeBody = z.object({ intoId: objectIdSchema }).strict();
export const retireTypeBody = z.object({ replacementId: objectIdSchema.optional() }).strict();
export const reasonsQuery = z.object({ source: z.enum(['test', 'homework']), recordId: objectIdSchema });
export const classMisconceptionsQuery = z.object({ parent: z.enum(['paper', 'homework']), parentId: objectIdSchema, classId: objectIdSchema });
export const topicsQuery = z.object({ subjectId: objectIdSchema, from: z.coerce.date().optional(), to: z.coerce.date().optional() });
export const studentParams = z.object({ studentId: objectIdSchema });
export const classParams = z.object({ classId: objectIdSchema });
export const rowsQuery = z.object({
  subjectId: objectIdSchema.optional(), topicNodeId: objectIdSchema.optional(), cursor: objectIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
