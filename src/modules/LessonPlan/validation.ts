import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createLessonPlanSchema = z.object({
  schoolId: objectIdSchema,
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  curriculumTopicId: objectIdSchema.optional(),
  date: z.string().datetime(),
  topic: z.string().min(1, 'Topic is required'),
  objectives: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
  homework: z.string().optional(),
  reflectionNotes: z.string().optional(),
  aiGenerated: z.boolean().optional(),
}).strict();

export const updateLessonPlanSchema = createLessonPlanSchema.partial().strict();

export const aiGenerateLessonPlanSchema = z.object({
  curriculumTopicId: objectIdSchema,
  classId: objectIdSchema,
  subjectId: objectIdSchema,
  schoolId: objectIdSchema,
  date: z.string().datetime(),
  durationMinutes: z.number().int().positive().optional(),
}).strict();

export type CreateLessonPlanInput = z.infer<typeof createLessonPlanSchema>;
export type UpdateLessonPlanInput = z.infer<typeof updateLessonPlanSchema>;
export type AIGenerateLessonPlanInput = z.infer<typeof aiGenerateLessonPlanSchema>;
