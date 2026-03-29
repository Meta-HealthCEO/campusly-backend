import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createParentSchema = z.object({
  userId: objectIdSchema,
  schoolId: objectIdSchema,
  childrenIds: z.array(objectIdSchema).optional(),
});

export const updateParentSchema = createParentSchema.partial();

export const linkChildSchema = z.object({
  childId: objectIdSchema,
});
