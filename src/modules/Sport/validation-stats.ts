import { z } from 'zod/v4';
import { VALID_SPORT_CODES } from './sport-configs.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Match Stats Schemas ──────────────────────────────────────────────────────

const playerStatEntrySchema = z.object({
  studentId: objectIdSchema,
  position: z.string().optional(),
  stats: z.record(z.string(), z.unknown()),
  rating: z.number().min(0).max(99).optional(),
  manOfMatch: z.boolean().optional(),
}).strict();

export const recordMatchStatsSchema = z.object({
  sportCode: z.string().min(1, 'Sport code is required'),
  teamId: objectIdSchema,
  playerStats: z.array(playerStatEntrySchema).min(1, 'At least one player stat is required'),
  teamStats: z.record(z.string(), z.unknown()).optional(),
  scorecard: z.record(z.string(), z.unknown()).optional(),
}).strict();

export type RecordMatchStatsInput = z.infer<typeof recordMatchStatsSchema>;

// ─── Personal Best Schemas ────────────────────────────────────────────────────

export const recordPersonalBestSchema = z.object({
  sportCode: z.string().min(1, 'Sport code is required'),
  event: z.string().min(1, 'Event is required'),
  value: z.number({ message: 'Value is required' }),
  unit: z.string().min(1, 'Unit is required'),
  date: z.string().min(1, 'Date is required'),
  fixtureId: objectIdSchema.optional(),
}).strict();

export type RecordPersonalBestInput = z.infer<typeof recordPersonalBestSchema>;
