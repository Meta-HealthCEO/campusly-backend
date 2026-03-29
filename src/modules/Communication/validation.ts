import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Message Template ───────────────────────────────────────────────────────

export const createTemplateSchema = z.object({
  schoolId: objectIdSchema,
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['fee_reminder', 'absence', 'general', 'event', 'emergency']),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  channel: z.enum(['email', 'sms', 'whatsapp', 'all']).optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

// ─── Bulk Message ───────────────────────────────────────────────────────────

export const sendBulkMessageSchema = z.object({
  schoolId: objectIdSchema,
  templateId: objectIdSchema.optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  channel: z.enum(['email', 'sms', 'whatsapp', 'all']).optional(),
  recipients: z.object({
    type: z.enum(['school', 'grade', 'class', 'custom']),
    targetIds: z.array(objectIdSchema).optional(),
  }),
});

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type SendBulkMessageInput = z.infer<typeof sendBulkMessageSchema>;
