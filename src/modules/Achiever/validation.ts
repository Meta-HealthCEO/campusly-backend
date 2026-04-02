import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Achievement ────────────────────────────────────────────────────────────

export const createAchievementSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  type: z.enum(['academic', 'sport', 'cultural', 'behaviour']),
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().trim().optional(),
  term: z.number().int().min(1),
  year: z.number().int().min(2000),
  category: z.string().trim().optional(),
  points: z.number().min(0).optional(),
  awardedBy: objectIdSchema,
  awardedAt: z.string().datetime().optional(),
  isPublic: z.boolean().optional(),
}).strict();

export const updateAchievementSchema = createAchievementSchema.partial().strict();

// ─── HousePoints ────────────────────────────────────────────────────────────

export const createHousePointsSchema = z.object({
  schoolId: objectIdSchema,
  houseName: z.string().min(1, 'House name is required').trim(),
  houseColor: z.string().min(1, 'House color is required').trim(),
  term: z.number().int().min(1),
  year: z.number().int().min(2000),
}).strict();

export const updateHousePointsSchema = createHousePointsSchema.partial().strict();

// ─── HousePointLog ──────────────────────────────────────────────────────────

export const addHousePointLogSchema = z.object({
  studentId: objectIdSchema,
  houseId: objectIdSchema,
  points: z.number(),
  reason: z.string().min(1, 'Reason is required').trim(),
}).strict();

// ─── Inferred types ─────────────────────────────────────────────────────────

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;
export type CreateHousePointsInput = z.infer<typeof createHousePointsSchema>;
export type UpdateHousePointsInput = z.infer<typeof updateHousePointsSchema>;
export type AddHousePointLogInput = z.infer<typeof addHousePointLogSchema>;
