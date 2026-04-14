import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');
const nullableObjectId = objectIdSchema.nullable().default(null);

const categoryTypes = ['test', 'exam', 'assignment', 'practical', 'project', 'other'] as const;
const lineItemStatuses = ['pending', 'capturing', 'closed'] as const;

// ─── createStructureSchema ────────────────────────────────────────────────────

export const createStructureSchema = z
  .object({
    name: z.string().min(1).max(200).trim(),
    subjectId: nullableObjectId,
    subjectName: z.string().min(1).max(200).trim(),
    classId: nullableObjectId,
    gradeId: nullableObjectId,
    term: z.number().int().min(1).max(4),
    academicYear: z.number().int().min(2020).max(2100),
  })
  .strict();

export type CreateStructureInput = z.infer<typeof createStructureSchema>;

// ─── updateStructureSchema ────────────────────────────────────────────────────

export const updateStructureSchema = z
  .object({
    name: z.string().min(1).max(200).trim().optional(),
    subjectName: z.string().min(1).max(200).trim().optional(),
    gradeId: nullableObjectId.optional(),
  })
  .strict();

export type UpdateStructureInput = z.infer<typeof updateStructureSchema>;

// ─── addCategorySchema ────────────────────────────────────────────────────────

export const addCategorySchema = z
  .object({
    name: z.string().min(1).max(200).trim(),
    type: z.enum(categoryTypes),
    weight: z.number().min(0).max(100),
  })
  .strict();

export type AddCategoryInput = z.infer<typeof addCategorySchema>;

// ─── updateCategorySchema ─────────────────────────────────────────────────────

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(200).trim().optional(),
    type: z.enum(categoryTypes).optional(),
    weight: z.number().min(0).max(100).optional(),
  })
  .strict();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// ─── addLineItemSchema ────────────────────────────────────────────────────────

export const addLineItemSchema = z
  .object({
    name: z.string().min(1).max(200).trim(),
    totalMarks: z.number().int().min(1),
    weight: z.number().min(0).max(100).nullable().optional(),
    date: z.string().min(1).nullable().optional(),
    existingAssessmentId: objectIdSchema.optional(),
  })
  .strict();

export type AddLineItemInput = z.infer<typeof addLineItemSchema>;

// ─── updateLineItemSchema ─────────────────────────────────────────────────────

export const updateLineItemSchema = z
  .object({
    name: z.string().min(1).max(200).trim().optional(),
    totalMarks: z.number().int().min(1).optional(),
    weight: z.number().min(0).max(100).nullable().optional(),
    date: z.string().min(1).nullable().optional(),
    existingAssessmentId: objectIdSchema.optional(),
    status: z.enum(lineItemStatuses).optional(),
  })
  .strict();

export type UpdateLineItemInput = z.infer<typeof updateLineItemSchema>;

// ─── linkAssessmentSchema ─────────────────────────────────────────────────────

export const linkAssessmentSchema = z
  .object({
    assessmentId: objectIdSchema,
  })
  .strict();

export type LinkAssessmentInput = z.infer<typeof linkAssessmentSchema>;

// ─── addStudentsSchema ────────────────────────────────────────────────────────

export const addStudentsSchema = z
  .object({
    studentIds: z.array(objectIdSchema).min(1),
  })
  .strict();

export type AddStudentsInput = z.infer<typeof addStudentsSchema>;

// ─── unlockSchema ─────────────────────────────────────────────────────────────

export const unlockSchema = z
  .object({
    reason: z.string().min(1).max(1000).trim(),
  })
  .strict();

export type UnlockInput = z.infer<typeof unlockSchema>;

// ─── saveAsTemplateSchema ─────────────────────────────────────────────────────

export const saveAsTemplateSchema = z
  .object({
    templateName: z.string().min(1).max(200).trim(),
  })
  .strict();

export type SaveAsTemplateInput = z.infer<typeof saveAsTemplateSchema>;

// ─── fromTemplateSchema ───────────────────────────────────────────────────────

export const fromTemplateSchema = z
  .object({
    name: z.string().min(1).max(200).trim(),
    subjectId: nullableObjectId,
    subjectName: z.string().min(1).max(200).trim(),
    classId: nullableObjectId,
    gradeId: nullableObjectId,
    term: z.number().int().min(1).max(4),
    academicYear: z.number().int().min(2020).max(2100),
  })
  .strict();

export type FromTemplateInput = z.infer<typeof fromTemplateSchema>;

// ─── cloneStructureSchema ─────────────────────────────────────────────────────

export const cloneStructureSchema = z
  .object({
    term: z.number().int().min(1).max(4),
    academicYear: z.number().int().min(2020).max(2100),
    classId: objectIdSchema.optional(),
    gradeId: objectIdSchema.optional(),
    name: z.string().min(1).max(200).trim().optional(),
  })
  .strict();

export type CloneStructureInput = z.infer<typeof cloneStructureSchema>;

// ─── exportQuerySchema ────────────────────────────────────────────────────────

export const exportQuerySchema = z
  .object({
    format: z.enum(['csv', 'pdf']).default('csv'),
  })
  .strict();

export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
