import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format');

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const periodsPerDaySchema = z.object({
  monday: z.number().int().min(1).max(12).default(7),
  tuesday: z.number().int().min(1).max(12).default(7),
  wednesday: z.number().int().min(1).max(12).default(7),
  thursday: z.number().int().min(1).max(12).default(7),
  friday: z.number().int().min(1).max(12).default(7),
}).strict();

const configBaseSchema = z.object({
  periodsPerDay: periodsPerDaySchema.optional(),
  periodTimes: z.array(z.object({
    period: z.number().int().min(1),
    startTime: timeSchema,
    endTime: timeSchema,
  }).strict().refine(
    (pt) => timeToMinutes(pt.endTime) > timeToMinutes(pt.startTime),
    { message: 'End time must be after start time' },
  )).optional(),
  breakSlots: z.array(z.object({
    afterPeriod: z.number().int().min(1),
    duration: z.number().int().min(5).max(90),
    label: z.string().trim().min(1).max(50),
  }).strict()).optional(),
  academicYear: z.number().int().optional(),
  term: z.number().int().min(1).max(4).optional(),
}).strict();

export const configSchema = configBaseSchema.superRefine((data, ctx) => {
  const maxPeriods = data.periodsPerDay
    ? Math.max(...Object.values(data.periodsPerDay))
    : data.periodTimes?.length;

  if (data.periodTimes) {
    const seenPeriods = new Set<number>();
    let previousEnd = -1;

    data.periodTimes
      .slice()
      .sort((a, b) => a.period - b.period)
      .forEach((periodTime, index) => {
        if (seenPeriods.has(periodTime.period)) {
          ctx.addIssue({
            code: 'custom',
            message: `Duplicate period time for P${periodTime.period}`,
            path: ['periodTimes', index, 'period'],
          });
        }
        seenPeriods.add(periodTime.period);

        if (periodTime.period !== index + 1) {
          ctx.addIssue({
            code: 'custom',
            message: 'Period times must run sequentially from P1',
            path: ['periodTimes', index, 'period'],
          });
        }

        if (maxPeriods && periodTime.period > maxPeriods) {
          ctx.addIssue({
            code: 'custom',
            message: `P${periodTime.period} exceeds configured periods per day`,
            path: ['periodTimes', index, 'period'],
          });
        }

        const start = timeToMinutes(periodTime.startTime);
        if (start < previousEnd) {
          ctx.addIssue({
            code: 'custom',
            message: `P${periodTime.period} overlaps the previous period`,
            path: ['periodTimes', index, 'startTime'],
          });
        }
        previousEnd = timeToMinutes(periodTime.endTime);
      });
  }

  if (data.breakSlots) {
    const seenBreaks = new Set<number>();
    data.breakSlots.forEach((breakSlot, index) => {
      if (maxPeriods && breakSlot.afterPeriod >= maxPeriods) {
        ctx.addIssue({
          code: 'custom',
          message: `Break after P${breakSlot.afterPeriod} must be before the final period`,
          path: ['breakSlots', index, 'afterPeriod'],
        });
      }

      if (seenBreaks.has(breakSlot.afterPeriod)) {
        ctx.addIssue({
          code: 'custom',
          message: `Only one break can be placed after P${breakSlot.afterPeriod}`,
          path: ['breakSlots', index, 'afterPeriod'],
        });
      }
      seenBreaks.add(breakSlot.afterPeriod);
    });
  }
});

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
