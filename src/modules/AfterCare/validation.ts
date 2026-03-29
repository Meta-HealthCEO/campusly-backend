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
});

export const updateRegistrationSchema = z.object({
  term: z.number().int().positive('Term must be a positive integer').optional(),
  academicYear: z.number().int().positive('Academic year must be a positive integer').optional(),
  daysPerWeek: z.array(weekDaySchema).min(1, 'At least one day is required').optional(),
  monthlyFee: z.number().int().nonnegative('Monthly fee must be a non-negative integer in cents').optional(),
  isActive: z.boolean().optional(),
});

export const checkInSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  date: z.string().datetime(),
  checkInTime: z.string().min(1, 'Check-in time is required'),
  notes: z.string().optional(),
});

export const checkOutSchema = z.object({
  checkOutTime: z.string().min(1, 'Check-out time is required'),
  notes: z.string().optional(),
});

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
