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
}).strict();

export const updateTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  sport: z.string().min(1, 'Sport is required').optional(),
  ageGroup: z.string().optional(),
  coachId: objectIdSchema.optional(),
  playerIds: z.array(objectIdSchema).optional(),
  isActive: z.boolean().optional(),
}).strict();

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
}).strict();

export const updateFixtureSchema = z.object({
  opponent: z.string().min(1, 'Opponent is required').optional(),
  date: z.string().datetime().optional(),
  time: z.string().min(1, 'Time is required').optional(),
  venue: z.string().min(1, 'Venue is required').optional(),
  isHome: z.boolean().optional(),
  result: z.string().optional(),
  notes: z.string().optional(),
}).strict();

// ─── Season Schemas ────────────────────────────────────────────────────────

export const createSeasonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  schoolId: objectIdSchema,
  sport: z.string().min(1, 'Sport is required'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional(),
}).strict();

export const updateSeasonSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  sport: z.string().min(1, 'Sport is required').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ─── Player Availability Schemas ───────────────────────────────────────────

export const createPlayerAvailabilitySchema = z.object({
  fixtureId: objectIdSchema,
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  status: z.enum(['available', 'unavailable', 'injured']),
  parentConfirmed: z.boolean().optional(),
  notes: z.string().optional(),
}).strict();

export const updatePlayerAvailabilitySchema = z.object({
  status: z.enum(['available', 'unavailable', 'injured']).optional(),
  parentConfirmed: z.boolean().optional(),
  notes: z.string().optional(),
}).strict();

// ─── Match Result Schemas ──────────────────────────────────────────────────

const scorerSchema = z.object({
  studentId: objectIdSchema,
  goals: z.number().int().min(0),
});

export const createMatchResultSchema = z.object({
  fixtureId: objectIdSchema,
  schoolId: objectIdSchema,
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  scorers: z.array(scorerSchema).optional(),
  manOfTheMatch: objectIdSchema.optional(),
  notes: z.string().optional(),
}).strict();

export const updateMatchResultSchema = z.object({
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
  scorers: z.array(scorerSchema).optional(),
  manOfTheMatch: objectIdSchema.optional(),
  notes: z.string().optional(),
}).strict();

// ─── MVP Vote Schema ───────────────────────────────────────────────────────

export const createMvpVoteSchema = z.object({
  fixtureId: objectIdSchema,
  voterId: objectIdSchema,
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
}).strict();

// ─── Type Exports ──────────────────────────────────────────────────────────

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type CreateFixtureInput = z.infer<typeof createFixtureSchema>;
export type UpdateFixtureInput = z.infer<typeof updateFixtureSchema>;
export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;
export type CreatePlayerAvailabilityInput = z.infer<typeof createPlayerAvailabilitySchema>;
export type UpdatePlayerAvailabilityInput = z.infer<typeof updatePlayerAvailabilitySchema>;
export type CreateMatchResultInput = z.infer<typeof createMatchResultSchema>;
export type UpdateMatchResultInput = z.infer<typeof updateMatchResultSchema>;
export type CreateMvpVoteInput = z.infer<typeof createMvpVoteSchema>;
