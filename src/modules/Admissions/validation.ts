import { z } from 'zod/v4';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

// ─── Public: Submit Application ───────────────────────────────────────────────

export const submitApplicationSchema = z.object({
  schoolId: objectIdSchema,
  applicantFirstName: z.string().min(1).trim(),
  applicantLastName: z.string().min(1).trim(),
  dateOfBirth: z.string().min(1),
  gender: z.enum(['male', 'female', 'other']).optional(),
  gradeApplyingFor: z.number().int().min(0).max(12),
  yearApplyingFor: z.number().int().min(2024).max(2100),
  previousSchool: z.string().trim().optional(),
  parentFirstName: z.string().min(1).trim(),
  parentLastName: z.string().min(1).trim(),
  parentEmail: z.string().email().trim(),
  parentPhone: z.string().min(1).trim(),
  parentIdNumber: z.string().trim().optional(),
  parentRelationship: z.enum(['mother', 'father', 'guardian', 'other']).optional(),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    province: z.string().min(1),
    postalCode: z.string().min(1),
  }).strict(),
  specialNeeds: z.string().optional(),
  additionalNotes: z.string().optional(),
}).strict();

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;

// ─── Admin: Update Status ─────────────────────────────────────────────────────

export const updateStatusSchema = z.object({
  status: z.enum([
    'submitted', 'under_review', 'interview_scheduled',
    'accepted', 'waitlisted', 'rejected',
  ]),
  notes: z.string().optional(),
  notifyParent: z.boolean().optional().default(false),
}).strict();

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

// ─── Admin: Schedule Interview ────────────────────────────────────────────────

export const scheduleInterviewSchema = z.object({
  interviewDate: z.string().min(1),
  interviewType: z.enum(['in_person', 'virtual']),
  interviewerName: z.string().min(1).trim(),
  venue: z.string().trim().optional(),
  notes: z.string().optional(),
  notifyParent: z.boolean().optional().default(false),
}).strict();

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;

// ─── Admin: Bulk Action ───────────────────────────────────────────────────────

export const bulkActionSchema = z.object({
  applicationIds: z.array(objectIdSchema).min(1),
  action: z.enum(['accepted', 'rejected']),
  notes: z.string().optional(),
  notifyParents: z.boolean().optional().default(false),
}).strict();

export type BulkActionInput = z.infer<typeof bulkActionSchema>;

// ─── Admin: Update Capacity ───────────────────────────────────────────────────

export const updateCapacitySchema = z.object({
  grades: z.array(z.object({
    grade: z.number().int().min(0).max(12),
    maxCapacity: z.number().int().min(1),
  }).strict()).min(1),
}).strict();

export type UpdateCapacityInput = z.infer<typeof updateCapacitySchema>;

// ─── Admin: List Filters (query) ──────────────────────────────────────────────

export const listApplicationsSchema = z.object({
  status: z.string().optional(),
  gradeApplyingFor: z.coerce.number().int().min(0).max(12).optional(),
  yearApplyingFor: z.coerce.number().int().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).strict();

export type ListApplicationsInput = z.infer<typeof listApplicationsSchema>;

// ─── Reports Query ────────────────────────────────────────────────────────────

export const reportQuerySchema = z.object({
  yearApplyingFor: z.coerce.number().int().optional(),
}).strict();

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
