import { z } from 'zod/v4';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');

export const createFitnessTestSchema = z.object({
  studentId: objectId,
  teamId: objectId.optional(),
  sportCode: z.string().optional(),
  testType: z.string().min(1).max(100),
  value: z.number(),
  unit: z.string().min(1).max(30),
  date: z.iso.datetime(),
  notes: z.string().optional(),
});

export const updateFitnessTestSchema = z.object({
  testType: z.string().min(1).max(100).optional(),
  value: z.number().optional(),
  unit: z.string().min(1).max(30).optional(),
  date: z.iso.datetime().optional(),
  notes: z.string().optional(),
  teamId: objectId.optional(),
  sportCode: z.string().optional(),
});

export const createBiometricSchema = z.object({
  studentId: objectId,
  date: z.iso.datetime(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  bodyFatPct: z.number().min(0).max(100).optional(),
  restingHrBpm: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const updateBiometricSchema = z.object({
  date: z.iso.datetime().optional(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  bodyFatPct: z.number().min(0).max(100).optional(),
  restingHrBpm: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type CreateFitnessTestInput = z.infer<typeof createFitnessTestSchema>;
export type UpdateFitnessTestInput = z.infer<typeof updateFitnessTestSchema>;
export type CreateBiometricInput = z.infer<typeof createBiometricSchema>;
export type UpdateBiometricInput = z.infer<typeof updateBiometricSchema>;
