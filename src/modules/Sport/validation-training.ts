import { z } from 'zod/v4';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');
const focusEnum = z.enum([
  'fitness',
  'technical',
  'tactical',
  'recovery',
  'strength',
  'match_prep',
]);
const statusEnum = z.enum(['scheduled', 'completed', 'cancelled']);
const attendanceStatusEnum = z.enum([
  'present',
  'absent',
  'late',
  'excused',
  'injured',
]);

export const createTrainingSessionSchema = z.object({
  teamId: objectId,
  title: z.string().min(1).max(200),
  date: z.iso.datetime(),
  startTime: z.string().min(1).max(10),
  durationMinutes: z.number().int().positive(),
  location: z.string().trim().optional(),
  focus: z.array(focusEnum).default([]),
  drillIds: z.array(objectId).default([]),
  notes: z.string().optional(),
  status: statusEnum.optional(),
});

export const updateTrainingSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  date: z.iso.datetime().optional(),
  startTime: z.string().min(1).max(10).optional(),
  durationMinutes: z.number().int().positive().optional(),
  location: z.string().trim().optional(),
  focus: z.array(focusEnum).optional(),
  drillIds: z.array(objectId).optional(),
  notes: z.string().optional(),
  status: statusEnum.optional(),
});

export const createDrillTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  sport: z.string().optional(),
  focus: z.array(focusEnum).default([]),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  equipment: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
});

export const updateDrillTemplateSchema = createDrillTemplateSchema.partial();

export const recordAttendanceSchema = z.object({
  attendance: z
    .array(
      z.object({
        studentId: objectId,
        status: attendanceStatusEnum,
        notes: z.string().optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .min(1),
});

export type CreateTrainingSessionInput = z.infer<typeof createTrainingSessionSchema>;
export type UpdateTrainingSessionInput = z.infer<typeof updateTrainingSessionSchema>;
export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;
export type CreateDrillTemplateInput = z.infer<typeof createDrillTemplateSchema>;
export type UpdateDrillTemplateInput = z.infer<typeof updateDrillTemplateSchema>;
