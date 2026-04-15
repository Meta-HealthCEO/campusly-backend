import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const attendanceStatusSchema = z.enum(['present', 'absent', 'late', 'excused']);

export const recordAttendanceSchema = z.object({
  studentId: objectIdSchema,
  classId: objectIdSchema,
  schoolId: objectIdSchema,
  date: z.string().datetime(),
  period: z.int().positive('Period must be a positive integer'),
  status: attendanceStatusSchema,
  notes: z.string().optional(),
  earlyDeparture: z.boolean().optional(),
  reason: z.string().optional(),
  verifiedByParent: z.boolean().optional(),
  arrivalTime: z.string().optional(),
  departureTime: z.string().optional(),
}).strict();

export const bulkAttendanceSchema = z.object({
  classId: objectIdSchema,
  schoolId: objectIdSchema,
  date: z.string().datetime(),
  period: z.int().positive('Period must be a positive integer'),
  records: z.array(
    z.object({
      studentId: objectIdSchema,
      status: attendanceStatusSchema,
      notes: z.string().optional(),
    }),
  ).min(1, 'At least one record is required'),
}).strict();

export const attendanceReportSchema = z.object({
  studentId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).strict();

// ─── Discipline ─────────────────────────────────────────────────────────────

export const createDisciplineSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  type: z.enum(['misconduct', 'bullying', 'vandalism', 'truancy', 'dress_code', 'late', 'other']),
  severity: z.enum(['minor', 'moderate', 'serious', 'critical']),
  description: z.string().min(1, 'Description is required'),
  witnesses: z.array(z.string()).optional(),
  actionTaken: z.string().optional(),
  parentNotified: z.boolean().optional(),
  parentNotifiedDate: z.string().datetime().optional(),
  meetingScheduled: z.boolean().optional(),
  meetingDate: z.string().datetime().optional(),
  outcome: z.enum(['warning', 'detention', 'suspension', 'expulsion', 'counselling', 'community_service']).optional(),
  detentionDate: z.string().datetime().optional(),
  detentionServed: z.boolean().optional(),
  followUpRequired: z.boolean().optional(),
  followUpDate: z.string().datetime().optional(),
  followUpNotes: z.string().optional(),
  status: z.enum(['reported', 'investigating', 'resolved', 'escalated']).optional(),
}).strict();

export const updateDisciplineSchema = createDisciplineSchema.partial().strict();

// ─── Merit / Demerit ────────────────────────────────────────────────────────

export const createMeritSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  type: z.enum(['merit', 'demerit']),
  points: z.number().int().positive('Points must be positive'),
  category: z.enum(['academic', 'behaviour', 'sport', 'service', 'leadership']),
  reason: z.string().min(1, 'Reason is required'),
}).strict();

// ─── Substitute Teacher ─────────────────────────────────────────────────────

const substituteReasonCategorySchema = z.enum([
  'sick',
  'training',
  'personal',
  'family',
  'emergency',
  'other',
]);

export const createSubstituteSchema = z
  .object({
    originalTeacherId: objectIdSchema,
    substituteTeacherId: objectIdSchema,
    schoolId: objectIdSchema,
    date: z.string().datetime(),
    periods: z.array(z.number().int().positive()).default([]),
    reason: z.string().optional(),
    reasonCategory: substituteReasonCategorySchema,
    classIds: z.array(objectIdSchema).min(1, 'At least one class is required'),
    isFullDay: z.boolean().default(false),
    leaveRequestId: objectIdSchema.optional(),
  })
  .strict()
  .refine(
    (data) => data.isFullDay || data.periods.length > 0,
    { message: 'At least one period is required when not a full-day substitution', path: ['periods'] },
  )
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(data.date) >= today;
    },
    { message: 'Cannot create substitute for past dates', path: ['date'] },
  );

export const updateSubstituteSchema = z
  .object({
    originalTeacherId: objectIdSchema.optional(),
    substituteTeacherId: objectIdSchema.optional(),
    schoolId: objectIdSchema.optional(),
    date: z.string().datetime().optional(),
    periods: z.array(z.number().int().positive()).optional(),
    reason: z.string().optional(),
    reasonCategory: substituteReasonCategorySchema.optional(),
    classIds: z.array(objectIdSchema).min(1).optional(),
    isFullDay: z.boolean().optional(),
    leaveRequestId: objectIdSchema.optional(),
  })
  .strict();

export const declineSubstituteSchema = z
  .object({
    reason: z.string().min(1, 'Decline reason is required').trim(),
  })
  .strict();

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
export type AttendanceReportInput = z.infer<typeof attendanceReportSchema>;
export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;
export type CreateMeritInput = z.infer<typeof createMeritSchema>;
export type CreateSubstituteInput = z.infer<typeof createSubstituteSchema>;
export type UpdateSubstituteInput = z.infer<typeof updateSubstituteSchema>;
export type DeclineSubstituteInput = z.infer<typeof declineSubstituteSchema>;
