import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Referral Schemas ────────────────────────────────────────────────────────

export const createReferralSchema = z.object({
  studentId: objectIdSchema,
  reason: z.enum([
    'academic', 'behavioural', 'emotional', 'social', 'family',
    'substance', 'bullying', 'self_harm', 'other',
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  referrerNotes: z.string().optional(),
}).strict();

export type CreateReferralInput = z.infer<typeof createReferralSchema>;

export const updateReferralSchema = z.object({
  status: z.enum(['referred', 'acknowledged', 'in_progress', 'resolved', 'closed']).optional(),
  assignedCounselorId: objectIdSchema.optional(),
  counselorNotes: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
}).strict();

export type UpdateReferralInput = z.infer<typeof updateReferralSchema>;

export const resolveReferralSchema = z.object({
  outcome: z.enum(['positive', 'ongoing', 'referred_external', 'no_further_action']),
  resolutionNotes: z.string().min(1, 'Resolution notes are required'),
}).strict();

export type ResolveReferralInput = z.infer<typeof resolveReferralSchema>;

// ─── Session Schemas ─────────────────────────────────────────────────────────

export const createSessionSchema = z.object({
  studentId: objectIdSchema,
  referralId: objectIdSchema.optional(),
  sessionDate: z.string().min(1, 'Session date is required'),
  sessionType: z.enum(['individual', 'group', 'crisis', 'follow_up', 'consultation']),
  duration: z.number().int().min(5).max(180),
  summary: z.string().min(1, 'Summary is required'),
  followUpActions: z.string().optional(),
  followUpDate: z.string().optional(),
  confidentialityLevel: z.enum(['standard', 'sensitive', 'restricted']),
  parentNotified: z.boolean().optional(),
}).strict();

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const updateSessionSchema = z.object({
  sessionDate: z.string().optional(),
  sessionType: z.enum(['individual', 'group', 'crisis', 'follow_up', 'consultation']).optional(),
  duration: z.number().int().min(5).max(180).optional(),
  summary: z.string().min(1).optional(),
  followUpActions: z.string().optional(),
  followUpDate: z.string().optional(),
  confidentialityLevel: z.enum(['standard', 'sensitive', 'restricted']).optional(),
  parentNotified: z.boolean().optional(),
}).strict();

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

// ─── Query Schemas ────────────────────────────────────────────────────────────

export const referralQuerySchema = z.object({
  status: z.enum(['referred', 'acknowledged', 'in_progress', 'resolved', 'closed']).optional(),
  reason: z.enum([
    'academic', 'behavioural', 'emotional', 'social', 'family',
    'substance', 'bullying', 'self_harm', 'other',
  ]).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  studentId: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const sessionQuerySchema = z.object({
  studentId: objectIdSchema.optional(),
  referralId: objectIdSchema.optional(),
  sessionType: z.enum(['individual', 'group', 'crisis', 'follow_up', 'consultation']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const reportQuerySchema = z.object({
  reportType: z.enum(['referral_reasons', 'sessions_monthly', 'outcomes']),
  year: z.coerce.number().int().min(2020).optional(),
}).strict();
