import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createNotificationSchema = z.object({
  recipientId: objectIdSchema,
  schoolId: objectIdSchema,
  type: z.enum(['email', 'sms', 'push', 'in_app']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  data: z.unknown().optional(),
});

export const bulkNotificationSchema = z.object({
  schoolId: objectIdSchema,
  targetType: z.enum(['class', 'grade', 'school']),
  targetId: objectIdSchema,
  type: z.enum(['email', 'sms', 'push', 'in_app']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  data: z.unknown().optional(),
});

export const updatePreferenceSchema = z.object({
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  push: z.boolean().optional(),
  inApp: z.boolean().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type BulkNotificationInput = z.infer<typeof bulkNotificationSchema>;
export type UpdatePreferenceInput = z.infer<typeof updatePreferenceSchema>;
