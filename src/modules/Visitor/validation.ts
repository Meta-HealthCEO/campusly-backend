import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

const visitorPurposeEnum = z.enum([
  'meeting', 'delivery', 'maintenance', 'parent_visit',
  'government', 'interview', 'contractor', 'other',
]);

const visitorStatusFilter = z.enum(['checked_in', 'checked_out', 'all']);

const lateReasonEnum = z.enum(['traffic', 'medical', 'transport', 'family', 'other']);

const earlyDepartureReasonEnum = z.enum([
  'medical', 'appointment', 'family_emergency', 'sport', 'other',
]);

// ─── Visitor Registration ─────────────────────────────────────────────────────

export const registerVisitorSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  idNumber: z.string().regex(/^\d{13}$/, 'Must be a 13-digit SA ID number').nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email().nullable().optional(),
  company: z.string().max(200).nullable().optional(),
  purpose: visitorPurposeEnum,
  purposeDetail: z.string().max(500).nullable().optional(),
  hostId: objectIdSchema.nullable().optional(),
  hostName: z.string().max(200).nullable().optional(),
  vehicleRegistration: z.string().max(20).nullable().optional(),
  numberOfVisitors: z.number().int().min(1).max(100).optional().default(1),
  preRegistrationId: objectIdSchema.nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
}).strict();

// ─── Visitor Checkout ─────────────────────────────────────────────────────────

export const checkoutVisitorSchema = z.object({
  notes: z.string().max(500).nullable().optional(),
}).strict();

// ─── List Visitors ────────────────────────────────────────────────────────────

export const listVisitorsSchema = z.object({
  status: visitorStatusFilter.optional(),
  purpose: visitorPurposeEnum.optional(),
  date: z.string().date().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  search: z.string().optional(),
  hostId: objectIdSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
}).strict();

// ─── Pre-Registration ─────────────────────────────────────────────────────────

export const createPreRegistrationSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  company: z.string().max(200).nullable().optional(),
  purpose: visitorPurposeEnum,
  purposeDetail: z.string().max(500).nullable().optional(),
  expectedDate: z.string().date(),
  expectedTime: z.string().max(10).nullable().optional(),
  hostId: objectIdSchema.nullable().optional(),
  vehicleRegistration: z.string().max(20).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
}).strict();

export const listPreRegistrationsSchema = z.object({
  expectedDate: z.string().date().optional(),
  status: z.enum(['expected', 'arrived', 'cancelled', 'no_show']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
}).strict();

// ─── Late Arrival ─────────────────────────────────────────────────────────────

export const createLateArrivalSchema = z.object({
  studentId: objectIdSchema,
  arrivalTime: z.string().datetime(),
  reason: lateReasonEnum,
  reasonDetail: z.string().max(500).nullable().optional(),
  parentNotified: z.boolean().optional().default(true),
  accompaniedBy: z.string().max(200).nullable().optional(),
}).strict();

export const listLateArrivalsSchema = z.object({
  date: z.string().date().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  classId: objectIdSchema.optional(),
  studentId: objectIdSchema.optional(),
  reason: lateReasonEnum.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
}).strict();

// ─── Early Departure ──────────────────────────────────────────────────────────

export const createEarlyDepartureSchema = z.object({
  studentId: objectIdSchema,
  departureTime: z.string().datetime(),
  reason: earlyDepartureReasonEnum,
  reasonDetail: z.string().max(500).nullable().optional(),
  authorizedById: objectIdSchema.nullable().optional(),
  collectedBy: z.string().min(1).max(200),
  collectedByIdNumber: z.string().regex(/^\d{13}$/, 'Must be a 13-digit SA ID number').nullable().optional(),
  collectedByRelation: z.string().max(100).nullable().optional(),
  parentNotified: z.boolean().optional().default(true),
}).strict();

export const listEarlyDeparturesSchema = z.object({
  date: z.string().date().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  classId: objectIdSchema.optional(),
  studentId: objectIdSchema.optional(),
  reason: earlyDepartureReasonEnum.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
}).strict();

// ─── Daily Report ─────────────────────────────────────────────────────────────

export const dailyReportSchema = z.object({
  date: z.string().date().optional(),
}).strict();

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type RegisterVisitorInput = z.infer<typeof registerVisitorSchema>;
export type CheckoutVisitorInput = z.infer<typeof checkoutVisitorSchema>;
export type ListVisitorsInput = z.infer<typeof listVisitorsSchema>;
export type CreatePreRegistrationInput = z.infer<typeof createPreRegistrationSchema>;
export type ListPreRegistrationsInput = z.infer<typeof listPreRegistrationsSchema>;
export type CreateLateArrivalInput = z.infer<typeof createLateArrivalSchema>;
export type ListLateArrivalsInput = z.infer<typeof listLateArrivalsSchema>;
export type CreateEarlyDepartureInput = z.infer<typeof createEarlyDepartureSchema>;
export type ListEarlyDeparturesInput = z.infer<typeof listEarlyDeparturesSchema>;
export type DailyReportInput = z.infer<typeof dailyReportSchema>;
