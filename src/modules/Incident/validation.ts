import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const incidentTypes = [
  'bullying', 'injury', 'property_damage', 'safety_concern',
  'substance', 'theft', 'verbal_abuse', 'cyber_bullying', 'other',
] as const;

const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
const partyRoles = ['perpetrator', 'victim', 'bystander', 'witness'] as const;
const witnessTypes = ['student', 'staff', 'other'] as const;

// ─── Incident ──────────────────────────────────────────────────────────────

export const createIncidentSchema = z.object({
  type: z.enum(incidentTypes),
  severity: z.enum(severityLevels),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  location: z.string().max(200).optional(),
  incidentDate: z.string().min(1, 'Date is required'),
  incidentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm').optional(),
  involvedParties: z.array(z.object({
    studentId: objectIdSchema,
    role: z.enum(partyRoles),
    description: z.string().max(500).optional(),
  }).strict()).optional(),
  witnesses: z.array(z.object({
    type: z.enum(witnessTypes),
    studentId: objectIdSchema.optional(),
    staffId: objectIdSchema.optional(),
    name: z.string().max(200).optional(),
  }).strict()).optional(),
  immediateActionTaken: z.string().max(2000).optional(),
}).strict();

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

export const updateIncidentSchema = z.object({
  type: z.enum(incidentTypes).optional(),
  severity: z.enum(severityLevels).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  location: z.string().max(200).optional(),
  incidentDate: z.string().optional(),
  incidentTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  status: z.enum(['reported', 'investigating', 'resolved', 'escalated']).optional(),
  assignedTo: objectIdSchema.optional(),
  resolutionSummary: z.string().max(5000).optional(),
  involvedParties: z.array(z.object({
    studentId: objectIdSchema,
    role: z.enum(partyRoles),
    description: z.string().max(500).optional(),
  }).strict()).optional(),
  witnesses: z.array(z.object({
    type: z.enum(witnessTypes),
    studentId: objectIdSchema.optional(),
    staffId: objectIdSchema.optional(),
    name: z.string().max(200).optional(),
  }).strict()).optional(),
  immediateActionTaken: z.string().max(2000).optional(),
}).strict();

export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;

// ─── Follow-up Actions ─────────────────────────────────────────────────────

export const createActionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(1000),
  assignedToUserId: objectIdSchema,
  dueDate: z.string().min(1, 'Due date is required'),
}).strict();

export type CreateActionInput = z.infer<typeof createActionSchema>;

export const updateActionSchema = z.object({
  description: z.string().min(1).max(1000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).optional(),
  completedAt: z.string().optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export type UpdateActionInput = z.infer<typeof updateActionSchema>;

// ─── Confidential Notes ────────────────────────────────────────────────────

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000),
}).strict();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  content: z.string().min(1).max(10000),
}).strict();

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
