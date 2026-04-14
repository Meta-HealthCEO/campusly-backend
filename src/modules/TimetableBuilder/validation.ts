import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

// ─── Config ─────────────────────────────────────────────────────────────────

const periodsPerDaySchema = z.object({
  monday: z.number().int().min(1).max(12).default(7),
  tuesday: z.number().int().min(1).max(12).default(7),
  wednesday: z.number().int().min(1).max(12).default(7),
  thursday: z.number().int().min(1).max(12).default(7),
  friday: z.number().int().min(1).max(12).default(7),
}).strict();

export const configSchema = z.object({
  periodsPerDay: periodsPerDaySchema.optional(),
  periodTimes: z.array(z.object({
    period: z.number().int().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
  }).strict().refine(
    (pt) => pt.endTime > pt.startTime,
    { message: 'End time must be after start time' },
  )).optional(),
  breakSlots: z.array(z.object({
    afterPeriod: z.number().int().min(1),
    duration: z.number().int().min(1),
    label: z.string().min(1),
  }).strict()).optional(),
  academicYear: z.number().int().optional(),
  term: z.number().int().min(1).max(4).optional(),
}).strict();

export type ConfigInput = z.infer<typeof configSchema>;

// ─── Subject Requirement ────────────────────────────────────────────────────

export const requirementSchema = z.object({
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  periodsPerWeek: z.number().int().min(1).max(10),
  requiresDoublePeriod: z.boolean().default(false),
  preferredTeacherId: objectIdSchema.optional(),
}).strict();

export type RequirementInput = z.infer<typeof requirementSchema>;

// ─── Teacher Availability ───────────────────────────────────────────────────

export const availabilitySchema = z.object({
  teacherId: objectIdSchema,
  unavailable: z.array(z.object({
    day: z.enum(days),
    periods: z.array(z.number().int().min(1)),
    reason: z.string().optional(),
  }).strict()),
}).strict();

export type AvailabilityInput = z.infer<typeof availabilitySchema>;

// ─── Subject Line ───────────────────────────────────────────────────────────

export const lineSchema = z.object({
  gradeId: objectIdSchema,
  lineName: z.string().min(1).max(100).trim(),
  subjectIds: z.array(objectIdSchema).min(1),
}).strict();

export type LineInput = z.infer<typeof lineSchema>;

// ─── Generate ───────────────────────────────────────────────────────────────

export const generateSchema = z.object({
  gradeId: objectIdSchema.optional(),
  lockedSlots: z.array(z.object({
    classId: objectIdSchema,
    day: z.enum(days),
    period: z.number().int().min(1),
    subjectId: objectIdSchema,
    teacherId: objectIdSchema,
  }).strict()).default([]),
}).strict();

export type GenerateInput = z.infer<typeof generateSchema>;

// ─── Line Suggest ───────────────────────────────────────────────────────────

export const lineSuggestSchema = z.object({
  gradeId: objectIdSchema,
}).strict();

export type LineSuggestInput = z.infer<typeof lineSuggestSchema>;
