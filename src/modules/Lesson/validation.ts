import { z } from 'zod/v4';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');
const trimmedString = (max: number) => z.string().trim().min(1).max(max);

export const lessonPhaseEnum = z.enum(['introduction', 'direct_instruction', 'practice', 'assessment', 'homework']);
export const lessonMaterialKindEnum = z.enum([
  'reading',
  'worksheet',
  'activity',
  'notes',
  'worked_example',
  'quiz',
  'practice_questions',
  'homework',
  'paper',
]);
export const lessonStatusEnum = z.enum(['draft', 'ready', 'taught']);

const internalTextbookRef = z.object({
  source: z.literal('internal'),
  textbookId: objectId,
  chapterId: objectId.optional(),
  pageStart: z.number().int().min(1).optional(),
  pageEnd: z.number().int().min(1).optional(),
  notes: z.string().max(500).optional(),
});
const externalTextbookRef = z.object({
  source: z.literal('external'),
  title: trimmedString(200),
  publisher: z.string().max(200).optional(),
  isbn: z.string().max(20).optional(),
  pageStart: z.number().int().min(1).optional(),
  pageEnd: z.number().int().min(1).optional(),
  excerpt: z.string().max(8000).optional(),
  notes: z.string().max(500).optional(),
});
export const textbookRefSchema = z.discriminatedUnion('source', [internalTextbookRef, externalTextbookRef]);

const scaffoldSuggestion = z.object({
  kind: lessonMaterialKindEnum,
  title: trimmedString(200),
  notes: z.string().max(500).optional(),
});
export const scaffoldedOutlineSchema = z.object({
  objectives: z.array(trimmedString(500)).min(1).max(5),
  phases: z.array(z.object({
    phase: lessonPhaseEnum,
    suggestions: z.array(scaffoldSuggestion).max(5),
  })).length(5),
});

export const createLessonSchema = z.object({
  classId: objectId,
  subjectId: objectId,
  gradeId: objectId,
  curriculumNodeId: objectId,
  title: trimmedString(200),
  date: z.iso.datetime(),
  durationMinutes: z.number().int().min(5).max(480),
  objectives: z.array(trimmedString(500)).max(10).optional(),
  scaffoldedOutline: scaffoldedOutlineSchema.optional(),
});

export const updateLessonSchema = z.object({
  title: trimmedString(200).optional(),
  date: z.iso.datetime().optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  objectives: z.array(trimmedString(500)).max(10).optional(),
  reflectionNotes: z.string().max(4000).optional(),
});

export const patchStatusSchema = z.object({ status: lessonStatusEnum });

export const scaffoldLessonSchema = z.object({
  curriculumNodeId: objectId,
  classId: objectId,
  subjectId: objectId,
  gradeId: objectId,
  durationMinutes: z.number().int().min(5).max(480),
  hints: z.string().max(1000).optional(),
});

const baseAddMaterial = z.object({
  phase: lessonPhaseEnum,
  title: trimmedString(200),
  teacherNotes: z.string().max(2000).optional(),
});
export const addReadingMaterialSchema = baseAddMaterial.extend({
  kind: z.literal('reading'),
  textbookRef: textbookRefSchema,
  generateComprehension: z.boolean().optional(),
  comprehensionCount: z.number().int().min(1).max(10).optional(),
});
export const addContentBackedMaterialSchema = baseAddMaterial.extend({
  kind: z.enum(['worksheet', 'activity', 'notes', 'worked_example']),
  contentPayload: z.object({
    type: z.string(),
    prompt: z.string().max(4000).optional(),
    difficulty: z.string().optional(),
  }).loose(),
});
export const addQuizMaterialSchema = baseAddMaterial.extend({
  kind: z.literal('quiz'),
  quizId: objectId,
});
export const addPracticeQuestionsSchema = baseAddMaterial.extend({
  kind: z.literal('practice_questions'),
  questionPayload: z.object({
    count: z.number().int().min(1).max(50),
    questionTypes: z.array(z.string()).optional(),
  }).loose(),
});
export const addHomeworkMaterialSchema = baseAddMaterial.extend({
  kind: z.literal('homework'),
  existingHomeworkId: objectId.optional(),
  createPayload: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (v) => !!v.existingHomeworkId !== !!v.createPayload,
  { message: 'Provide exactly one of existingHomeworkId or createPayload' },
);
export const addPaperMaterialSchema = baseAddMaterial.extend({
  kind: z.literal('paper'),
  existingPaperId: objectId.optional(),
  createPayload: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (v) => !!v.existingPaperId !== !!v.createPayload,
  { message: 'Provide exactly one of existingPaperId or createPayload' },
);
export const addMaterialSchema = z.discriminatedUnion('kind', [
  addReadingMaterialSchema,
  addContentBackedMaterialSchema,
  addQuizMaterialSchema,
  addPracticeQuestionsSchema,
  addHomeworkMaterialSchema,
  addPaperMaterialSchema,
]);

export const updateMaterialSchema = z.object({
  title: trimmedString(200).optional(),
  teacherNotes: z.string().max(2000).optional(),
});

export const moveMaterialSchema = z.object({
  toPhase: lessonPhaseEnum,
  toIndex: z.number().int().min(0),
});

export const listLessonsSchema = z.object({
  teacherId: objectId.optional(),
  classId: objectId.optional(),
  subjectId: objectId.optional(),
  status: lessonStatusEnum.optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type ScaffoldLessonInput = z.infer<typeof scaffoldLessonSchema>;
export type AddMaterialInput = z.infer<typeof addMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type MoveMaterialInput = z.infer<typeof moveMaterialSchema>;
export type ListLessonsInput = z.infer<typeof listLessonsSchema>;
export type ScaffoldedOutline = z.infer<typeof scaffoldedOutlineSchema>;
