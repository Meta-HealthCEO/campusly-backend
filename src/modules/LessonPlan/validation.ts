import { z } from 'zod/v4';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

// Staged homework: a homework input without teacherId/schoolId (service fills those)
// and without classId/subjectId (inherited from the lesson plan).
// NOTE: the current service-compensation.ts validates that staged homework's
// schoolId/classId/subjectId match the plan — so the staged shape CAN include
// them. Model after createHomeworkSchema but omit teacherId.
const stagedHomeworkSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('quiz'),
    title: z.string().min(1).max(200),
    quizId: objectIdSchema,
    schoolId: objectIdSchema,
    subjectId: objectIdSchema,
    classId: objectIdSchema,
    dueDate: z.iso.datetime(),
    totalMarks: z.number().int().min(0).max(1000),
  }),
  z.object({
    type: z.literal('reading'),
    title: z.string().min(1).max(200),
    contentResourceId: objectIdSchema,
    pageRange: z.string().max(50).optional(),
    schoolId: objectIdSchema,
    subjectId: objectIdSchema,
    classId: objectIdSchema,
    dueDate: z.iso.datetime(),
    totalMarks: z.number().int().min(0).max(1000).default(0),
  }),
  z.object({
    type: z.literal('exercise'),
    title: z.string().min(1).max(200),
    exerciseQuestionIds: z.array(objectIdSchema).min(1).max(100),
    schoolId: objectIdSchema,
    subjectId: objectIdSchema,
    classId: objectIdSchema,
    dueDate: z.iso.datetime(),
    totalMarks: z.number().int().min(0).max(1000),
  }),
]);

export const createLessonPlanSchema = z.object({
  schoolId: objectIdSchema,
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  curriculumTopicId: objectIdSchema, // REQUIRED — was optional
  date: z.iso.datetime(),
  topic: z.string().min(1).max(200),
  durationMinutes: z.number().int().min(5).max(240).default(45),
  objectives: z.array(z.string().min(1).max(500)).max(20).optional(),
  activities: z.array(z.string().min(1).max(1000)).max(20).optional(),
  resources: z.array(z.string().min(1).max(500)).max(20).optional(),
  reflectionNotes: z.string().max(5000).optional(),
  aiGenerated: z.boolean().optional(),
  stagedHomework: z.array(stagedHomeworkSchema).max(10).optional(),
});

export const updateLessonPlanSchema = createLessonPlanSchema.partial();

export const aiGenerateLessonPlanSchema = z.object({
  curriculumTopicId: objectIdSchema,
  classId: objectIdSchema,
  subjectId: objectIdSchema,
  schoolId: objectIdSchema,
  date: z.iso.datetime(),
  durationMinutes: z.number().int().min(5).max(240).optional(),
});

export type CreateLessonPlanInput = z.infer<typeof createLessonPlanSchema>;
export type UpdateLessonPlanInput = z.infer<typeof updateLessonPlanSchema>;
export type AIGenerateLessonPlanInput = z.infer<typeof aiGenerateLessonPlanSchema>;
export type StagedHomeworkInput = z.infer<typeof stagedHomeworkSchema>;
