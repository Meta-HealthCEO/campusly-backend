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
  ticketPrice: z.number().min(0).optional(),
  isTicketed: z.boolean().optional(),
  galleryEnabled: z.boolean().optional(),
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
  ticketPrice: z.number().min(0).optional(),
  isTicketed: z.boolean().optional(),
  galleryEnabled: z.boolean().optional(),
});

export const createRsvpSchema = z.object({
  eventId: objectIdSchema,
  status: z.enum(['attending', 'not_attending', 'maybe']),
  notes: z.string().optional(),
  headcount: z.number().int().positive().optional(),
});

export const updateRsvpSchema = z.object({
  status: z.enum(['attending', 'not_attending', 'maybe']),
  notes: z.string().optional(),
  headcount: z.number().int().positive().optional(),
});

// ─── Ticket Validation ──────────────────────────────────────────────────────

export const purchaseTicketSchema = z.object({
  schoolId: objectIdSchema,
  ticketType: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
});

export const cancelTicketSchema = z.object({});

// ─── Seat Validation ────────────────────────────────────────────────────────

export const createSeatsSchema = z.object({
  seats: z.array(
    z.object({
      row: z.string().min(1, 'Row is required'),
      seatNumber: z.number().int().positive('Seat number must be positive'),
      label: z.string().optional(),
    }),
  ).min(1, 'At least one seat is required'),
});

export const reserveSeatSchema = z.object({
  ticketId: objectIdSchema,
});

export const releaseSeatSchema = z.object({});

// ─── Check-In Validation ────────────────────────────────────────────────────

export const checkInSchema = z.object({
  qrCode: z.string().min(1, 'QR code is required'),
});

// ─── Gallery Validation ─────────────────────────────────────────────────────

export const uploadGallerySchema = z.object({
  schoolId: objectIdSchema,
  imageUrl: z.string().url('Invalid image URL'),
  caption: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateRsvpInput = z.infer<typeof createRsvpSchema>;
export type UpdateRsvpInput = z.infer<typeof updateRsvpSchema>;
export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>;
export type CancelTicketInput = z.infer<typeof cancelTicketSchema>;
export type CreateSeatsInput = z.infer<typeof createSeatsSchema>;
export type ReserveSeatInput = z.infer<typeof reserveSeatSchema>;
export type ReleaseSeatInput = z.infer<typeof releaseSeatSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type UploadGalleryInput = z.infer<typeof uploadGallerySchema>;
