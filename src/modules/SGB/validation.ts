import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Members ────────────────────────────────────────────────────────────────

export const inviteSgbMemberSchema = z.object({
  email: z.string().email('Valid email is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  position: z.enum(['chairperson', 'deputy_chairperson', 'secretary', 'treasurer', 'member', 'co_opted']),
  term: z.string().optional(),
}).strict();

export const updateSgbMemberSchema = z.object({
  position: z.enum(['chairperson', 'deputy_chairperson', 'secretary', 'treasurer', 'member', 'co_opted']).optional(),
  status: z.enum(['pending', 'active', 'inactive']).optional(),
  term: z.string().optional(),
}).strict();

// ─── Meetings ───────────────────────────────────────────────────────────────

const agendaItemSchema = z.object({
  title: z.string().min(1, 'Agenda item title is required'),
  presenter: z.string().optional(),
  duration: z.number().int().positive().optional(),
}).strict();

export const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().datetime('Valid ISO 8601 datetime is required'),
  venue: z.string().min(1, 'Venue is required'),
  type: z.enum(['ordinary', 'special', 'annual_general']),
  agenda: z.array(agendaItemSchema).optional(),
}).strict();

export const updateMeetingSchema = z.object({
  title: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  venue: z.string().min(1).optional(),
  type: z.enum(['ordinary', 'special', 'annual_general']).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  agenda: z.array(agendaItemSchema).optional(),
}).strict();

export const recordMinutesSchema = z.object({
  content: z.string().min(1, 'Minutes content is required'),
  attendees: z.array(objectIdSchema).optional(),
  apologies: z.array(objectIdSchema).optional(),
}).strict();

// ─── Resolutions ────────────────────────────────────────────────────────────

export const createResolutionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['financial', 'policy', 'staffing', 'infrastructure', 'curriculum', 'general']),
  requiresVote: z.boolean().default(true),
}).strict();

export const castVoteSchema = z.object({
  vote: z.enum(['for', 'against', 'abstain']),
}).strict();

// ─── Documents ──────────────────────────────────────────────────────────────

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['policy', 'financial_statement', 'audit_report', 'minutes', 'constitution', 'annual_report', 'other']),
  description: z.string().optional(),
  policyReviewDate: z.string().datetime().optional(),
}).strict();

// ─── Policy Propose ─────────────────────────────────────────────────────────

export const proposePolicySchema = z.object({
  documentId: objectIdSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  meetingId: objectIdSchema,
}).strict();

// ─── School Improvement Plan ────────────────────────────────────────────────

const milestoneSchema = z.object({
  title: z.string().min(1),
  targetDate: z.string().min(1),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']).default('not_started'),
  completedDate: z.string().optional(),
}).strict();

const goalSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['academic', 'infrastructure', 'governance', 'financial', 'community']),
  milestones: z.array(milestoneSchema),
}).strict();

export const upsertSipSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  goals: z.array(goalSchema).min(1, 'At least one goal is required'),
}).strict();

// ─── Query schemas ──────────────────────────────────────────────────────────

export const financeSummaryQuerySchema = z.object({
  period: z.enum(['term1', 'term2', 'term3', 'term4', 'q1', 'q2', 'q3', 'q4', 'annual']).default('annual'),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
}).strict();

export const financeYearQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
}).strict();

// ─── Inferred types ─────────────────────────────────────────────────────────

export type InviteSgbMemberInput = z.infer<typeof inviteSgbMemberSchema>;
export type UpdateSgbMemberInput = z.infer<typeof updateSgbMemberSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type RecordMinutesInput = z.infer<typeof recordMinutesSchema>;
export type CreateResolutionInput = z.infer<typeof createResolutionSchema>;
export type CastVoteInput = z.infer<typeof castVoteSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type ProposePolicyInput = z.infer<typeof proposePolicySchema>;
export type UpsertSipInput = z.infer<typeof upsertSipSchema>;
