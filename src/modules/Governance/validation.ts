import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── SIP Plan ────────────────────────────────────────────────────────────────

export const createSIPPlanSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  year: z.number().int().min(2020, 'Year must be 2020 or later'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).strict();

export type CreateSIPPlanInput = z.infer<typeof createSIPPlanSchema>;

export const updateSIPPlanSchema = z.object({
  title: z.string().min(1).trim().optional(),
  year: z.number().int().min(2020).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
}).strict();

export type UpdateSIPPlanInput = z.infer<typeof updateSIPPlanSchema>;

// ─── SIP Goal ────────────────────────────────────────────────────────────────

export const createSIPGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional(),
  wseArea: z.number().int().min(1).max(9),
  responsiblePersonId: objectIdSchema.optional(),
  targetDate: z.string().min(1, 'Target date is required'),
  completionPercent: z.number().min(0).max(100).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
}).strict();

export type CreateSIPGoalInput = z.infer<typeof createSIPGoalSchema>;

export const updateSIPGoalSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  wseArea: z.number().int().min(1).max(9).optional(),
  responsiblePersonId: objectIdSchema.optional(),
  targetDate: z.string().optional(),
  completionPercent: z.number().min(0).max(100).optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'overdue']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
}).strict();

export type UpdateSIPGoalInput = z.infer<typeof updateSIPGoalSchema>;

// ─── SIP Evidence ────────────────────────────────────────────────────────────

export const addEvidenceSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  fileUrl: z.string().min(1, 'File URL is required'),
  fileType: z.string().optional(),
}).strict();

export type AddEvidenceInput = z.infer<typeof addEvidenceSchema>;

// ─── SIP Review ──────────────────────────────────────────────────────────────

export const addReviewSchema = z.object({
  quarter: z.number().int().min(1).max(4),
  year: z.number().int().min(2020),
  notes: z.string().min(1, 'Notes are required'),
  completionPercent: z.number().min(0).max(100),
}).strict();

export type AddReviewInput = z.infer<typeof addReviewSchema>;

// ─── Policy ──────────────────────────────────────────────────────────────────

export const createPolicySchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  category: z.enum(['hr', 'academic', 'safety', 'financial', 'governance', 'general']),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  status: z.enum(['draft', 'active', 'under_review', 'archived']).optional(),
  reviewDate: z.string().optional(),
}).strict();

export type CreatePolicyInput = z.infer<typeof createPolicySchema>;

export const updatePolicySchema = z.object({
  title: z.string().min(1).trim().optional(),
  category: z.enum(['hr', 'academic', 'safety', 'financial', 'governance', 'general']).optional(),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  status: z.enum(['draft', 'active', 'under_review', 'archived']).optional(),
  reviewDate: z.string().optional(),
}).strict();

export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;

// ─── Query Schemas ──────────────────────────────────────────────────────────

export const sipQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const policyQuerySchema = z.object({
  category: z.enum(['hr', 'academic', 'safety', 'financial', 'governance', 'general']).optional(),
  status: z.enum(['draft', 'active', 'under_review', 'archived']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
