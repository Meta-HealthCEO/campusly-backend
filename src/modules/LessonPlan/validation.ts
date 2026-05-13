import { z } from 'zod/v4';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');
const nonEmptyTrimmed = (max: number) => z.string().trim().min(1).max(max);

const resourceTypeEnum = z.enum([
  'lesson',
  'study_notes',
  'worksheet',
  'worked_example',
  'activity',
]);

const blockTypeEnum = z.enum([
  'text',
  'image',
  'video',
  'quiz',
  'drag_drop',
  'fill_blank',
  'match_columns',
  'ordering',
  'hotspot',
  'step_reveal',
  'code',
]);

const stagedHomeworkSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('quiz'),
    title: nonEmptyTrimmed(200),
    quizId: objectIdSchema,
    schoolId: objectIdSchema,
    subjectId: objectIdSchema,
    classId: objectIdSchema,
    dueDate: z.iso.datetime(),
    totalMarks: z.number().int().min(0).max(1000),
  }).strict(),
  z.object({
    type: z.literal('reading'),
    title: nonEmptyTrimmed(200),
    contentResourceId: objectIdSchema,
    pageRange: z.string().trim().max(50).optional(),
    schoolId: objectIdSchema,
    subjectId: objectIdSchema,
    classId: objectIdSchema,
    dueDate: z.iso.datetime(),
    totalMarks: z.number().int().min(0).max(1000).default(0),
  }).strict(),
  z.object({
    type: z.literal('exercise'),
    title: nonEmptyTrimmed(200),
    exerciseQuestionIds: z.array(objectIdSchema).min(1).max(100),
    schoolId: objectIdSchema,
    subjectId: objectIdSchema,
    classId: objectIdSchema,
    dueDate: z.iso.datetime(),
    totalMarks: z.number().int().min(0).max(1000),
  }).strict(),
]);

const lessonPlanFields = {
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  curriculumTopicId: objectIdSchema,
  date: z.iso.datetime(),
  topic: nonEmptyTrimmed(200),
  durationMinutes: z.number().int().min(5).max(240).default(45),
  objectives: z.array(nonEmptyTrimmed(500)).max(20).optional(),
  activities: z.array(nonEmptyTrimmed(1000)).max(20).optional(),
  resources: z.array(nonEmptyTrimmed(500)).max(20).optional(),
  reflectionNotes: z.string().trim().max(5000).optional(),
  aiGenerated: z.boolean().optional(),
};

export const createLessonPlanSchema = z.object({
  schoolId: objectIdSchema.optional(),
  ...lessonPlanFields,
  stagedHomework: z.array(stagedHomeworkSchema).max(10).optional(),
}).strict().superRefine((data, ctx) => {
  const lessonDate = new Date(data.date);
  data.stagedHomework?.forEach((homework, index) => {
    if (new Date(homework.dueDate) < lessonDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['stagedHomework', index, 'dueDate'],
        message: 'Homework due date cannot be before the lesson date',
      });
    }
  });
});

export const updateLessonPlanSchema = z.object(lessonPlanFields).partial().strict();

export const aiGenerateLessonPlanSchema = z.object({
  curriculumTopicId: objectIdSchema,
  classId: objectIdSchema,
  subjectId: objectIdSchema,
  schoolId: objectIdSchema.optional(),
  date: z.iso.datetime(),
  durationMinutes: z.number().int().min(5).max(240).optional(),
}).strict();

export const generateLessonMaterialSchema = z.object({
  type: resourceTypeEnum,
  blockTypes: z.array(blockTypeEnum).min(1).default(['text', 'quiz']),
  difficulty: z.number().int().min(1).max(5).default(3),
  instructions: z.string().trim().max(2000).default(''),
}).strict();

export type CreateLessonPlanInput = z.infer<typeof createLessonPlanSchema>;
export type UpdateLessonPlanInput = z.infer<typeof updateLessonPlanSchema>;
export type AIGenerateLessonPlanInput = z.infer<typeof aiGenerateLessonPlanSchema>;
export type GenerateLessonMaterialInput = z.infer<typeof generateLessonMaterialSchema>;
export type StagedHomeworkInput = z.infer<typeof stagedHomeworkSchema>;
