import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const focusAreaEnum = z.enum([
  'lesson_planning', 'learner_engagement', 'assessment_practices',
  'classroom_management', 'subject_knowledge', 'differentiation',
  'use_of_resources', 'questioning_techniques',
]);

const scoreSchema = z.number().int().min(1).max(5);

// ─── Department Schemas ──────────────────────────────────────────────────────

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().trim().optional(),
  hodUserId: objectIdSchema.optional(),
  subjectIds: z.array(objectIdSchema).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).trim().optional(),
  description: z.string().trim().optional(),
  hodUserId: objectIdSchema.nullable().optional(),
  subjectIds: z.array(objectIdSchema).optional(),
  isActive: z.boolean().optional(),
}).strict();

// ─── Observation Schemas ─────────────────────────────────────────────────────

export const createObservationSchema = z.object({
  teacherId: objectIdSchema,
  classId: objectIdSchema,
  subjectId: objectIdSchema,
  scheduledDate: z.string().datetime(),
  duration: z.number().int().min(15).max(120).optional(),
  focusAreas: z.array(focusAreaEnum).min(1),
}).strict();

export const updateObservationSchema = z.object({
  status: z.enum(['completed', 'cancelled']).optional(),
  scores: z.object({
    lesson_planning: scoreSchema.optional(),
    learner_engagement: scoreSchema.optional(),
    assessment_practices: scoreSchema.optional(),
    classroom_management: scoreSchema.optional(),
    subject_knowledge: scoreSchema.optional(),
    differentiation: scoreSchema.optional(),
    use_of_resources: scoreSchema.optional(),
    questioning_techniques: scoreSchema.optional(),
  }).strict().optional(),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
  completedAt: z.string().datetime().optional(),
}).strict();

// ─── Query Schemas ───────────────────────────────────────────────────────────

export const performanceQuerySchema = z.object({
  term: z.coerce.number().int().min(1).max(4).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
}).strict();

export const moderationQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'changes_requested']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).strict();

export const observationQuerySchema = z.object({
  teacherId: objectIdSchema.optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).strict();

export const commonAssessmentQuerySchema = z.object({
  subjectId: objectIdSchema.optional(),
  term: z.coerce.number().int().min(1).max(4).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
}).strict();

// ─── Type Exports ────────────────────────────────────────────────────────────

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type CreateObservationInput = z.infer<typeof createObservationSchema>;
export type UpdateObservationInput = z.infer<typeof updateObservationSchema>;
