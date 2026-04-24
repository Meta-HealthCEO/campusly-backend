import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Message Template ───────────────────────────────────────────────────────

export const createTemplateSchema = z.object({
  schoolId: objectIdSchema,
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['fee_reminder', 'absence', 'general', 'event', 'emergency']).default('general'),
  channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'all']).optional(),
  category: z.enum(['attendance', 'fees', 'academic', 'events', 'general', 'emergency']).optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  htmlBody: z.string().optional(),
  variables: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
}).strict();

export const updateTemplateSchema = createTemplateSchema.partial().strict();

// ─── Template Preview ───────────────────────────────────────────────────────

export const previewTemplateSchema = z.object({
  variables: z.record(z.string(), z.string()),
}).strict();

// ─── Bulk Message ───────────────────────────────────────────────────────────

export const sendBulkMessageSchema = z.object({
  schoolId: objectIdSchema,
  templateId: objectIdSchema.optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'all']).optional(),
  recipients: z.object({
    type: z.enum(['school', 'grade', 'class', 'custom']),
    targetIds: z.array(objectIdSchema).optional(),
  }),
}).strict();

// ─── Schedule Message ──────────────────────────────────────────────────────

export const scheduleMessageSchema = z.object({
  schoolId: objectIdSchema,
  templateId: objectIdSchema.optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'all']).optional(),
  recipients: z.object({
    type: z.enum(['school', 'grade', 'class', 'custom']),
    targetIds: z.array(objectIdSchema).optional(),
  }),
  scheduledFor: z.iso.datetime({ message: 'scheduledFor must be a valid ISO date-time' }),
}).strict();

export const cancelScheduledMessageSchema = z.object({
  id: objectIdSchema,
});

// ─── Unified Send ──────────────────────────────────────────────────────────

const recipientSchema = z.object({
  userId: objectIdSchema.optional(),
  parentId: objectIdSchema.optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  deviceToken: z.string().optional(),
}).strict();

export const unifiedSendSchema = z.object({
  schoolId: objectIdSchema,
  templateId: objectIdSchema.optional(),
  channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'preference']).optional(),
  recipients: z.array(recipientSchema).min(1, 'At least one recipient is required'),
  subject: z.string().optional(),
  body: z.string().optional(),
  htmlBody: z.string().optional(),
  variables: z.record(z.string(), z.string()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  scheduledAt: z.string().datetime().optional(),
}).strict();

// ─── Channel Config ─────────────────────────────────────────────────────────

export const updateConfigSchema = z.object({
  schoolId: objectIdSchema,
  channels: z.object({
    email: z.object({
      enabled: z.boolean().optional(),
      provider: z.enum(['resend', 'sendgrid']).optional(),
      fromName: z.string().optional(),
      fromEmail: z.string().email().optional(),
      replyToEmail: z.string().email().optional(),
      apiKey: z.string().optional(),
      dailyLimit: z.number().min(0).optional(),
    }).strict().optional(),
    sms: z.object({
      enabled: z.boolean().optional(),
      provider: z.enum(['twilio']).optional(),
      senderId: z.string().max(11).optional(),
      apiKey: z.string().optional(),
      apiUsername: z.string().optional(),
      dailyLimit: z.number().min(0).optional(),
    }).strict().optional(),
    whatsapp: z.object({
      enabled: z.boolean().optional(),
      provider: z.enum(['twilio', 'whatsapp_business']).optional(),
      phoneNumber: z.string().optional(),
      accountSid: z.string().optional(),
      authToken: z.string().optional(),
      dailyLimit: z.number().min(0).optional(),
    }).strict().optional(),
    push: z.object({
      enabled: z.boolean().optional(),
      provider: z.enum(['fcm']).optional(),
      serviceAccountKey: z.string().optional(),
      dailyLimit: z.number().min(0).optional(),
    }).strict().optional(),
  }).strict(),
}).strict();

// ─── Test Channel ───────────────────────────────────────────────────────────

export const testChannelSchema = z.object({
  schoolId: objectIdSchema,
  channel: z.enum(['email', 'sms', 'whatsapp', 'push']),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  recipientDeviceToken: z.string().optional(),
}).strict();

// ─── Device Registration ────────────────────────────────────────────────────

export const registerDeviceSchema = z.object({
  deviceToken: z.string().min(1, 'Device token is required'),
  platform: z.enum(['web', 'android', 'ios']),
  deviceName: z.string().optional(),
}).strict();

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type SendBulkMessageInput = z.infer<typeof sendBulkMessageSchema>;
export type ScheduleMessageInput = z.infer<typeof scheduleMessageSchema>;
export type CancelScheduledMessageInput = z.infer<typeof cancelScheduledMessageSchema>;
export type UnifiedSendInput = z.infer<typeof unifiedSendSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type TestChannelInput = z.infer<typeof testChannelSchema>;
export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
