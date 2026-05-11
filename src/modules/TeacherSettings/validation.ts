import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

export const updateTeachingScopeSchema = z.object({
  grades: z.array(objectIdSchema),
  subjectsByGrade: z.array(z.object({
    gradeId: objectIdSchema,
    subjectIds: z.array(objectIdSchema),
  })),
});

export type UpdateTeachingScopeInput = z.infer<typeof updateTeachingScopeSchema>;
