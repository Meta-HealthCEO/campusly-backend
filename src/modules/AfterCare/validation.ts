import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const weekDaySchema = z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);

export const createRegistrationSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  term: z.number().int().positive('Term must be a positive integer'),
  academicYear: z.number().int().positive('Academic year must be a positive integer'),
  daysPerWeek: z.array(weekDaySchema).min(1, 'At least one day is required'),
  monthlyFee: z.number().int().nonnegative('Monthly fee must be a non-negative integer in cents'),
  isActive: z.boolean().optional(),
}).strict();

export const updateRegistrationSchema = z.object({
  term: z.number().int().positive('Term must be a positive integer').optional(),
  academicYear: z.number().int().positive('Academic year must be a positive integer').optional(),
  daysPerWeek: z.array(weekDaySchema).min(1, 'At least one day is required').optional(),
  monthlyFee: z.number().int().nonnegative('Monthly fee must be a non-negative integer in cents').optional(),
  isActive: z.boolean().optional(),
}).strict();

export const checkInSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  date: z.string().datetime(),
  checkInTime: z.string().min(1, 'Check-in time is required'),
  notes: z.string().optional(),
}).strict();

export const checkOutSchema = z.object({
  checkOutTime: z.string().min(1, 'Check-out time is required'),
  notes: z.string().optional(),
}).strict();

// ─── Pickup Authorization ──────────────────────────────────────────────────

export const createPickupAuthSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  authorizedPersonName: z.string().min(1, 'Authorized person name is required'),
  idNumber: z.string().min(1, 'ID number is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  photoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
}).strict();

export const updatePickupAuthSchema = z.object({
  authorizedPersonName: z.string().min(1, 'Authorized person name is required').optional(),
  idNumber: z.string().min(1, 'ID number is required').optional(),
  relationship: z.string().min(1, 'Relationship is required').optional(),
  phoneNumber: z.string().min(1, 'Phone number is required').optional(),
  photoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ─── Sign Out Log ──────────────────────────────────────────────────────────

export const createSignOutLogSchema = z.object({
  attendanceId: objectIdSchema,
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  pickedUpBy: z.string().min(1, 'Picked up by name is required'),
  pickedUpAt: z.string().datetime(),
  isAuthorized: z.boolean(),
  authorizationId: objectIdSchema.optional(),
  notes: z.string().optional(),
}).strict();

// ─── After Care Activity ───────────────────────────────────────────────────

const activityTypeSchema = z.enum([
  'homework_help',
  'sport',
  'free_play',
  'arts_crafts',
  'reading',
  'other',
]);

export const createActivitySchema = z.object({
  schoolId: objectIdSchema,
  date: z.string().datetime(),
  activityType: activityTypeSchema,
  name: z.string().min(1, 'Activity name is required'),
  description: z.string().optional(),
  supervisorId: objectIdSchema,
  studentIds: z.array(objectIdSchema).optional(),
  capacity: z.number().int().nonnegative().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
}).strict();

export const updateActivitySchema = z.object({
  date: z.string().datetime().optional(),
  activityType: activityTypeSchema.optional(),
  name: z.string().min(1, 'Activity name is required').optional(),
  description: z.string().optional(),
  supervisorId: objectIdSchema.optional(),
  studentIds: z.array(objectIdSchema).optional(),
  capacity: z.number().int().nonnegative().optional(),
  startTime: z.string().min(1, 'Start time is required').optional(),
  endTime: z.string().min(1, 'End time is required').optional(),
}).strict();

export const bookActivitySchema = z.object({
  studentId: objectIdSchema,
}).strict();

export type BookActivityInput = z.infer<typeof bookActivitySchema>;

// ─── After Care Invoice ────────────────────────────────────────────────────

export const generateInvoicesSchema = z.object({
  schoolId: objectIdSchema,
  month: z.number().int().min(1).max(12),
  year: z.number().int().positive('Year must be a positive integer'),
}).strict();

// ─── Type Exports ──────────────────────────────────────────────────────────

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type CreatePickupAuthInput = z.infer<typeof createPickupAuthSchema>;
export type UpdatePickupAuthInput = z.infer<typeof updatePickupAuthSchema>;
export type CreateSignOutLogInput = z.infer<typeof createSignOutLogSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type GenerateInvoicesInput = z.infer<typeof generateInvoicesSchema>;
