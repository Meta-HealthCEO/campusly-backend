import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

const timeStringSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format');

// ─── Create Conference Event ──────────────────────────────────────────────────

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).nullable().optional(),
  date: z.string().date(),
  startTime: timeStringSchema,
  endTime: timeStringSchema,
  venue: z.string().max(200).nullable().optional(),
  slotDurationMinutes: z.number().int().min(5).max(60).optional().default(15),
  breakBetweenMinutes: z.number().int().min(0).max(30).optional().default(5),
  maxSlotsPerTeacher: z.number().int().min(1).nullable().optional(),
  maxBookingsPerParent: z.number().int().min(1).nullable().optional(),
  allowWaitlist: z.boolean().optional().default(true),
  bookingOpensAt: z.string().datetime().nullable().optional(),
  bookingClosesAt: z.string().datetime().nullable().optional(),
  participatingTeacherIds: z.array(objectIdSchema).optional(),
}).strict();

// ─── Update Conference Event ──────────────────────────────────────────────────

export const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  date: z.string().date().optional(),
  startTime: timeStringSchema.optional(),
  endTime: timeStringSchema.optional(),
  venue: z.string().max(200).nullable().optional(),
  slotDurationMinutes: z.number().int().min(5).max(60).optional(),
  breakBetweenMinutes: z.number().int().min(0).max(30).optional(),
  maxSlotsPerTeacher: z.number().int().min(1).nullable().optional(),
  maxBookingsPerParent: z.number().int().min(1).nullable().optional(),
  allowWaitlist: z.boolean().optional(),
  bookingOpensAt: z.string().datetime().nullable().optional(),
  bookingClosesAt: z.string().datetime().nullable().optional(),
  participatingTeacherIds: z.array(objectIdSchema).optional(),
}).strict();

// ─── Change Event Status ──────────────────────────────────────────────────────

export const changeEventStatusSchema = z.object({
  status: z.enum(['published', 'in_progress', 'completed', 'cancelled']),
}).strict();

// ─── List Events ──────────────────────────────────────────────────────────────

export const listEventsSchema = z.object({
  status: z.enum(['draft', 'published', 'in_progress', 'completed', 'cancelled']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
}).strict();

// ─── Set Availability ─────────────────────────────────────────────────────────

const availabilityWindowSchema = z.object({
  startTime: timeStringSchema,
  endTime: timeStringSchema,
  location: z.string().max(200).nullable().optional(),
}).strict();

export const setAvailabilitySchema = z.object({
  windows: z.array(availabilityWindowSchema).min(1),
}).strict();

// ─── Create Booking ───────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  eventId: objectIdSchema,
  teacherId: objectIdSchema,
  slotId: z.string().min(1),
  studentId: objectIdSchema,
  notes: z.string().max(500).nullable().optional(),
}).strict();

// ─── List Bookings ────────────────────────────────────────────────────────────

export const listBookingsSchema = z.object({
  eventId: objectIdSchema,
  teacherId: objectIdSchema.optional(),
  parentId: objectIdSchema.optional(),
  status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
}).strict();

// ─── My Schedule ──────────────────────────────────────────────────────────────

export const myScheduleSchema = z.object({
  eventId: objectIdSchema,
}).strict();

// ─── Update Booking Status ────────────────────────────────────────────────────

export const updateBookingStatusSchema = z.object({
  status: z.enum(['completed', 'no_show']),
}).strict();

// ─── Cancel Booking ───────────────────────────────────────────────────────────

export const cancelBookingSchema = z.object({
  cancelReason: z.string().max(500).nullable().optional(),
}).strict();

// ─── Join Waitlist ────────────────────────────────────────────────────────────

export const joinWaitlistSchema = z.object({
  eventId: objectIdSchema,
  teacherId: objectIdSchema,
  studentId: objectIdSchema,
  preferredTimes: z.array(timeStringSchema).optional(),
}).strict();

// ─── List Waitlist ────────────────────────────────────────────────────────────

export const listWaitlistSchema = z.object({
  eventId: objectIdSchema,
  teacherId: objectIdSchema.optional(),
}).strict();

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ChangeEventStatusInput = z.infer<typeof changeEventStatusSchema>;
export type ListEventsInput = z.infer<typeof listEventsSchema>;
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ListBookingsInput = z.infer<typeof listBookingsSchema>;
export type MyScheduleInput = z.infer<typeof myScheduleSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
export type ListWaitlistInput = z.infer<typeof listWaitlistSchema>;
