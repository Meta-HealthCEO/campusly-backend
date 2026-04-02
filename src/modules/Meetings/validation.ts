import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeSchema = z.string().regex(timeRegex, 'Time must be in HH:mm format');

// ─── Meeting Day Schemas ──────────────────────────────────────────────────────

export const createMeetingDaySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().datetime(),
  startTime: timeSchema,
  endTime: timeSchema,
  slotDuration: z.number().int().min(5).max(60),
  location: z.string().optional(),
  virtualMeetingEnabled: z.boolean().optional(),
}).strict();

// ─── Slot Generation Schema ───────────────────────────────────────────────────

export const createSlotsSchema = z.object({
  meetingDayId: objectIdSchema,
  teacherId: objectIdSchema,
  teacherName: z.string().min(1, 'Teacher name is required'),
}).strict();

// ─── Book Slot Schema ─────────────────────────────────────────────────────────

export const bookSlotSchema = z.object({
  studentId: objectIdSchema,
  studentName: z.string().min(1, 'Student name is required'),
  parentName: z.string().min(1, 'Parent name is required'),
}).strict();

// ─── Cancel Booking Schema ────────────────────────────────────────────────────

export const cancelBookingSchema = z.object({
  reason: z.string().optional(),
}).strict();

// ─── Add Notes Schema ─────────────────────────────────────────────────────────

export const completeSlotSchema = z.object({
  notes: z.string().min(1, 'Notes are required').optional(),
}).strict();

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type CreateMeetingDayInput = z.infer<typeof createMeetingDaySchema>;
export type CreateSlotsInput = z.infer<typeof createSlotsSchema>;
export type BookSlotInput = z.infer<typeof bookSlotSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type CompleteSlotInput = z.infer<typeof completeSlotSchema>;
