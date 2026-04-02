import { z } from 'zod/v4';

const templateTypeEnum = z.enum([
  'fee_reminder', 'absence_alert', 'homework_due', 'results_available',
  'event_reminder', 'general_announcement', 'transport_alert', 'emergency',
]);

const recipientGroupEnum = z.enum(['all_parents', 'grade', 'class']);

const languageEnum = z.enum(['en', 'af', 'zu', 'xh']);

// E.164 phone format: +27XXXXXXXXX
const e164Phone = z.string().regex(
  /^\+[1-9]\d{6,14}$/,
  'Phone number must be in E.164 format (e.g. +27821234567)',
);

export const configSchema = z.object({
  provider: z.enum(['twilio', '360dialog', 'wati']),
  credentials: z.object({
    accountSid: z.string().min(1, 'Account SID is required'),
    authToken: z.string().min(1, 'Auth token is required'),
    phoneNumber: e164Phone,
  }).strict(),
  enabled: z.boolean(),
}).strict();

export const sendMessageSchema = z.object({
  recipientPhone: e164Phone,
  templateType: templateTypeEnum,
  templateParams: z.record(z.string(), z.string()).default({}),
  recipientName: z.string().optional(),
}).strict();

export const broadcastSchema = z.object({
  templateType: templateTypeEnum,
  recipientGroup: recipientGroupEnum,
  gradeId: z.string().optional(),
  classId: z.string().optional(),
  templateParams: z.record(z.string(), z.string()).default({}),
}).strict();

export const optInSchema = z.object({
  phoneNumber: e164Phone,
  preferredLanguage: languageEnum.default('en'),
}).strict();

export const optOutSchema = z.object({}).strict();

export type ConfigInput = z.infer<typeof configSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type BroadcastInput = z.infer<typeof broadcastSchema>;
export type OptInInput = z.infer<typeof optInSchema>;
