import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Create Course ─────────────────────────────────────────────────────────

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .trim(),
  description: z.string().max(2000).default(''),
  coverImageUrl: z.string().default(''),
  subjectId: objectIdSchema.nullable().optional(),
  gradeLevel: z.number().int().min(1).max(12).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
  estimatedDurationHours: z.number().min(0).max(1000).nullable().optional(),
  passMarkPercent: z.number().int().min(0).max(100).default(60),
  certificateEnabled: z.boolean().default(true),
}).strict();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// ─── Update Course (metadata only) ─────────────────────────────────────────

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).optional(),
  coverImageUrl: z.string().optional(),
  subjectId: objectIdSchema.nullable().optional(),
  gradeLevel: z.number().int().min(1).max(12).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).optional(),
  estimatedDurationHours: z.number().min(0).max(1000).nullable().optional(),
  passMarkPercent: z.number().int().min(0).max(100).optional(),
  certificateEnabled: z.boolean().optional(),
}).strict();

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// ─── Query ─────────────────────────────────────────────────────────────────

export const courseQuerySchema = z.object({
  status: z.enum(['draft', 'in_review', 'published', 'archived']).optional(),
  subjectId: objectIdSchema.optional(),
  gradeLevel: z.coerce.number().int().min(1).max(12).optional(),
  mine: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type CourseQueryInput = z.infer<typeof courseQuerySchema>;

// ─── Module CRUD ───────────────────────────────────────────────────────────

export const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  orderIndex: z.number().int().min(0).default(0),
}).strict();

export type CreateModuleInput = z.infer<typeof createModuleSchema>;

export const updateModuleSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  orderIndex: z.number().int().min(0).optional(),
}).strict();

export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

export const reorderModulesSchema = z.object({
  orders: z
    .array(
      z.object({
        id: objectIdSchema,
        orderIndex: z.number().int().min(0),
      }),
    )
    .min(1),
}).strict();

export type ReorderModulesInput = z.infer<typeof reorderModulesSchema>;

// ─── Lesson CRUD ───────────────────────────────────────────────────────────

// Base lesson fields shared by every lesson type.
const lessonBase = z.object({
  moduleId: objectIdSchema,
  orderIndex: z.number().int().min(0).default(0),
  title: z.string().min(1).max(200).trim(),
  isRequiredToAdvance: z.boolean().default(false),
  // Default 70 matches the schema default on CourseLesson.passMarkPercent.
  // Only meaningful for type='quiz' lessons — the non-quiz variants ignore
  // this field at runtime but the default keeps the type inference clean.
  passMarkPercent: z.number().int().min(0).max(100).default(70),
  maxAttempts: z.number().int().min(1).nullable().optional(),
});

// Tagged-union: exactly one foreign key set per type. Zod `discriminatedUnion`
// enforces this at parse time, which replaces the "exactly one of" runtime
// check from the spec.
export const createLessonSchema = z.discriminatedUnion('type', [
  lessonBase.extend({
    type: z.literal('content'),
    contentResourceId: objectIdSchema,
    isGraded: z.literal(false).default(false),
  }),
  lessonBase.extend({
    type: z.literal('chapter'),
    textbookId: objectIdSchema,
    chapterId: objectIdSchema,
    isGraded: z.literal(false).default(false),
  }),
  lessonBase.extend({
    type: z.literal('homework'),
    homeworkId: objectIdSchema,
    isGraded: z.literal(false).default(false),
  }),
  lessonBase.extend({
    type: z.literal('quiz'),
    quizQuestionIds: z.array(objectIdSchema).min(1, 'At least one question is required'),
    isGraded: z.boolean().default(true),
  }),
]);

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

// Update allows changing metadata only — to change lesson type, delete and
// re-add. This keeps the validation simple and mirrors the rule that
// structural edits on published courses are forbidden.
export const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  orderIndex: z.number().int().min(0).optional(),
  isRequiredToAdvance: z.boolean().optional(),
  passMarkPercent: z.number().int().min(0).max(100).nullable().optional(),
  maxAttempts: z.number().int().min(1).nullable().optional(),
}).strict();

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

export const reorderLessonsSchema = z.object({
  orders: z
    .array(
      z.object({
        id: objectIdSchema,
        moduleId: objectIdSchema,
        orderIndex: z.number().int().min(0),
      }),
    )
    .min(1),
}).strict();

export type ReorderLessonsInput = z.infer<typeof reorderLessonsSchema>;

// ─── Review workflow ───────────────────────────────────────────────────────

export const rejectCourseSchema = z.object({
  reviewNotes: z.string().min(1, 'Review notes are required').max(2000),
}).strict();

export type RejectCourseInput = z.infer<typeof rejectCourseSchema>;

// ─── Assignment ────────────────────────────────────────────────────────────

export const assignCourseSchema = z.object({
  classId: objectIdSchema,
}).strict();

export type AssignCourseInput = z.infer<typeof assignCourseSchema>;
