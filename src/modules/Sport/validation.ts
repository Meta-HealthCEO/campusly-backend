import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  schoolId: objectIdSchema,
  sport: z.string().min(1, 'Sport is required'),
  ageGroup: z.string().optional(),
  coachId: objectIdSchema.optional(),
  playerIds: z.array(objectIdSchema).optional(),
  isActive: z.boolean().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  sport: z.string().min(1, 'Sport is required').optional(),
  ageGroup: z.string().optional(),
  coachId: objectIdSchema.optional(),
  playerIds: z.array(objectIdSchema).optional(),
  isActive: z.boolean().optional(),
});

export const createFixtureSchema = z.object({
  teamId: objectIdSchema,
  schoolId: objectIdSchema,
  opponent: z.string().min(1, 'Opponent is required'),
  date: z.string().datetime(),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().min(1, 'Venue is required'),
  isHome: z.boolean().optional(),
  result: z.string().optional(),
  notes: z.string().optional(),
});

export const updateFixtureSchema = z.object({
  opponent: z.string().min(1, 'Opponent is required').optional(),
  date: z.string().datetime().optional(),
  time: z.string().min(1, 'Time is required').optional(),
  venue: z.string().min(1, 'Venue is required').optional(),
  isHome: z.boolean().optional(),
  result: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type CreateFixtureInput = z.infer<typeof createFixtureSchema>;
export type UpdateFixtureInput = z.infer<typeof updateFixtureSchema>;
