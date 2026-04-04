import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

const leaveTypeEnum = z.enum([
  'annual',
  'sick',
  'family_responsibility',
  'maternity',
  'paternity',
  'unpaid',
  'study',
]);

// ─── Create Leave Request ─────────────────────────────────────────────────────

export const createLeaveRequestSchema = z.object({
  leaveType: leaveTypeEnum,
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().min(1).max(1000),
  isHalfDay: z.boolean().optional().default(false),
  halfDayPeriod: z.enum(['morning', 'afternoon']).nullable().optional(),
  documentUrl: z.string().url().nullable().optional(),
  substituteTeacherId: objectIdSchema.nullable().optional(),
}).strict();

// ─── Review Leave Request ─────────────────────────────────────────────────────

export const reviewLeaveRequestSchema = z.object({
  status: z.enum(['approved', 'declined']),
  reviewComment: z.string().max(1000).nullable().optional(),
  substituteTeacherId: objectIdSchema.nullable().optional(),
}).strict();

// ─── List Leave Requests ──────────────────────────────────────────────────────

export const listLeaveRequestsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['pending', 'approved', 'declined', 'cancelled']).optional(),
  leaveType: leaveTypeEnum.optional(),
  staffId: objectIdSchema.optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  search: z.string().optional(),
}).strict();

// ─── Leave Policy ─────────────────────────────────────────────────────────────

const leaveTypeConfigSchema = z.object({
  type: leaveTypeEnum,
  label: z.string().min(1).max(100),
  defaultEntitlement: z.number().min(0),
  unit: z.string().default('days'),
  cycleLength: z.number().int().min(1).max(3).default(1),
  requiresDocument: z.boolean().default(false),
  requiresDocumentAfterDays: z.number().int().min(0).nullable().optional(),
  isPaid: z.boolean().default(true),
  isActive: z.boolean().default(true),
}).strict();

export const leavePolicySchema = z.object({
  leaveTypes: z.array(leaveTypeConfigSchema).min(1),
}).strict();

// ─── Initialize Balances ──────────────────────────────────────────────────────

export const leaveBalanceInitSchema = z.object({
  staffId: objectIdSchema.optional(),
  year: z.coerce.number().int().min(2020).max(2100),
}).strict();

// ─── Calendar Query ───────────────────────────────────────────────────────────

export const leaveCalendarQuerySchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
  department: z.string().optional(),
}).strict();

// ─── Substitute Query ─────────────────────────────────────────────────────────

export const substituteQuerySchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
  subjectId: objectIdSchema.optional(),
  excludeStaffId: objectIdSchema.optional(),
}).strict();

// ─── Report Summary Query ─────────────────────────────────────────────────────

export const reportSummaryQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  department: z.string().optional(),
  staffId: objectIdSchema.optional(),
}).strict();

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type ReviewLeaveRequestInput = z.infer<typeof reviewLeaveRequestSchema>;
export type ListLeaveRequestsInput = z.infer<typeof listLeaveRequestsSchema>;
export type LeavePolicyInput = z.infer<typeof leavePolicySchema>;
export type LeaveBalanceInitInput = z.infer<typeof leaveBalanceInitSchema>;
export type LeaveCalendarQueryInput = z.infer<typeof leaveCalendarQuerySchema>;
export type SubstituteQueryInput = z.infer<typeof substituteQuerySchema>;
export type ReportSummaryQueryInput = z.infer<typeof reportSummaryQuerySchema>;
