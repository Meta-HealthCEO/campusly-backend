import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  schoolId: objectIdSchema,
  eventType: z.enum(['sports_day', 'concert', 'parents_evening', 'fundraiser', 'excursion', 'other']),
  date: z.string().datetime(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  venue: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  rsvpRequired: z.boolean().optional(),
  rsvpDeadline: z.string().datetime().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  eventType: z.enum(['sports_day', 'concert', 'parents_evening', 'fundraiser', 'excursion', 'other']).optional(),
  date: z.string().datetime().optional(),
  startTime: z.string().min(1, 'Start time is required').optional(),
  endTime: z.string().min(1, 'End time is required').optional(),
  venue: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  rsvpRequired: z.boolean().optional(),
  rsvpDeadline: z.string().datetime().optional(),
});

export const createRsvpSchema = z.object({
  eventId: objectIdSchema,
  status: z.enum(['attending', 'not_attending', 'maybe']),
  notes: z.string().optional(),
});

export const updateRsvpSchema = z.object({
  status: z.enum(['attending', 'not_attending', 'maybe']),
  notes: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateRsvpInput = z.infer<typeof createRsvpSchema>;
export type UpdateRsvpInput = z.infer<typeof updateRsvpSchema>;
