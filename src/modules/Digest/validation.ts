import { z } from 'zod/v4';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const updatePreferencesSchema = z.object({
  dailyDigest: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  digestChannel: z.enum(['whatsapp', 'email', 'both']).optional(),
  morningBriefTime: z.string().regex(timeRegex, 'Must be HH:mm format').optional(),
  eveningBriefTime: z.string().regex(timeRegex, 'Must be HH:mm format').optional(),
}).strict();

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
