import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createParentSchema = z.object({
  userId: objectIdSchema,
  schoolId: objectIdSchema,
  childrenIds: z.array(objectIdSchema).optional(),
  relationship: z.enum(['mother', 'father', 'guardian', 'other']),
  occupation: z.string().trim().optional(),
  employer: z.string().trim().optional(),
  workPhone: z.string().trim().optional(),
  alternativeEmail: z.string().email().optional(),
  communicationPreference: z.enum(['email', 'sms', 'whatsapp', 'push']).optional(),
  isMainCaregiver: z.boolean().optional(),
});

export const updateParentSchema = createParentSchema.partial();

export const linkChildSchema = z.object({
  childId: objectIdSchema,
});
