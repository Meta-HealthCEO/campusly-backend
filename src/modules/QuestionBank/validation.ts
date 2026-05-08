import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

// ─── Shared Enums ──────────────────────────────────────────────────────────

const questionTypeEnum = z.enum([
  'mcq', 'true_false', 'short_answer', 'structured', 'essay',
  'match', 'fill_blank', 'calculation', 'diagram_label', 'case_study',
]);

const capsLevelEnum = z.enum([
  'knowledge', 'routine', 'complex', 'problem_solving',
]);

const bloomsLevelEnum = z.enum([
  'remember', 'understand', 'apply', 'analyse', 'evaluate', 'create',
]);

const mediaTypeEnum = z.enum(['image', 'diagram', 'table']);

const questionStatusEnum = z.enum([
  'draft', 'pending_review', 'approved', 'rejected',
]);

const paperTypeEnum = z.enum([
  'class_test', 'assignment', 'mid_year', 'trial', 'final', 'custom',
]);

const paperDifficultyEnum = z.enum(['easy', 'medium', 'hard']);

// ─── Subdoc Schemas ────────────────────────────────────────────────────────

const mediaSchema = z.object({
  mediaType: mediaTypeEnum,
  url: z.url(),
}).strict();

const optionSchema = z.object({
  label: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
}).strict();

const cognitiveLevelSchema = z.object({
  caps: capsLevelEnum,
  blooms: bloomsLevelEnum,
}).strict();

// ─── Question Schemas ──────────────────────────────────────────────────────

export const createQuestionSchema = z.object({
  curriculumNodeId: objectIdSchema,
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  type: questionTypeEnum,
  stem: z.string().min(1, 'Stem is required').trim(),
  media: z.array(mediaSchema).default([]),
  options: z.array(optionSchema).default([]),
  answer: z.string().default(''),
  markingRubric: z.string().default(''),
  marks: z.number().int().min(1),
  cognitiveLevel: cognitiveLevelSchema,
  difficulty: z.number().int().min(1).max(5).default(3),
  tags: z.array(z.string()).default([]),
}).strict();

export const updateQuestionSchema = z.object({
  stem: z.string().min(1).trim().optional(),
  media: z.array(mediaSchema).optional(),
  options: z.array(optionSchema).optional(),
  answer: z.string().optional(),
  markingRubric: z.string().optional(),
  marks: z.number().int().min(1).optional(),
  cognitiveLevel: cognitiveLevelSchema.optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
}).strict();

export const reviewQuestionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().default(''),
}).strict();

// ─── AI Generation ─────────────────────────────────────────────────────────

export const generateQuestionsSchema = z.object({
  curriculumNodeId: objectIdSchema,
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  type: questionTypeEnum,
  count: z.number().int().min(1).max(20).default(5),
  difficulty: z.number().int().min(1).max(5).default(3),
  cognitiveLevel: cognitiveLevelSchema,
  gradeLevel: z.number().int().min(1).max(12).optional(),
}).strict();

// ─── Question Query ────────────────────────────────────────────────────────

export const questionQuerySchema = z.object({
  curriculumNodeId: objectIdSchema.optional(),
  type: questionTypeEnum.optional(),
  capsLevel: capsLevelEnum.optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  status: questionStatusEnum.optional(),
  search: z.string().optional(),
  mine: z.preprocess((val) => val === 'true', z.boolean()).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Paper Question / Section (NEW SHAPE — Task 1) ────────────────────────

const paperQuestionDiagramSchema = z.object({
  tikz: z.string().max(20000),
  caption: z.string().max(500).optional(),
}).strict();

// Base shape for a paper question — bank-ref XOR inline.
const paperQuestionBaseShape = {
  questionId: objectIdSchema.optional(),
  questionText: z.string().min(1).max(5000).optional(),
  marks: z.number().int().min(0).max(100),
  position: z.number().int().min(0),
  modelAnswer: z.string().max(5000).optional(),
  markingGuideline: z.string().max(5000).optional(),
  diagram: paperQuestionDiagramSchema.optional(),
} as const;

const paperQuestionXorRefinement = (
  q: { questionId?: string; questionText?: string },
) => (Boolean(q.questionId) !== Boolean(q.questionText));

const paperQuestionInputSchema = z.object(paperQuestionBaseShape).refine(
  paperQuestionXorRefinement,
  { message: 'Exactly one of questionId or questionText must be set' },
);

const paperSectionInputSchema = z.object({
  title: z.string().min(1).max(200),
  instructions: z.string().max(2000).optional(),
  questions: z.array(paperQuestionInputSchema).max(100),
}).strict();

// ─── Paper Schemas ─────────────────────────────────────────────────────────

export const createPaperSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  schoolId: objectIdSchema,
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  topicIds: z.array(objectIdSchema).min(1).max(20),
  term: z.number().int().min(1).max(4),
  year: z.number().int().min(2000).max(2100),
  paperType: paperTypeEnum,
  duration: z.number().int().min(5).max(480),
  totalMarks: z.number().int().min(1).max(500),
  difficulty: paperDifficultyEnum.default('medium'),
  aiGenerated: z.boolean().default(false),
  sections: z.array(paperSectionInputSchema).min(0).max(20).default([]),
  instructions: z.string().max(5000).optional(),
}).strict();

export const updatePaperSchema = createPaperSchema.partial().strict();

// Legacy add-question schema (sectionIndex + questionNumber) — preserved for
// existing routes/services until Task 4 swaps to addQuestionToPaperSchema.
export const addQuestionSchema = z.object({
  sectionIndex: z.number().int().min(0),
  questionId: objectIdSchema,
  questionNumber: z.string().min(1),
  marks: z.number().int().min(1),
}).strict();

export const paperQuerySchema = z.object({
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  status: z.enum(['draft', 'finalised', 'archived']).optional(),
  paperType: paperTypeEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── AI Paper Generation ──────────────────────────────────────────────────

const sectionConfigSchema = z.object({
  title: z.string().min(1).max(200),
  instructions: z.string().max(2000).optional(),
  questionCount: z.number().int().min(1).max(50),
  sectionMarks: z.number().int().min(1).max(200),
}).strict();

export const generatePaperSchema = z.object({
  schoolId: objectIdSchema,
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  topicIds: z.array(objectIdSchema).min(1).max(20),
  term: z.number().int().min(1).max(4),
  year: z.number().int().min(2000).max(2100),
  paperType: paperTypeEnum,
  duration: z.number().int().min(5).max(480),
  totalMarks: z.number().int().min(1).max(500),
  difficulty: paperDifficultyEnum.default('medium'),
  title: z.string().min(1).max(200),
  sectionConfig: z.array(sectionConfigSchema).min(1).max(10),
  instructions: z.string().max(5000).optional(),
  // Legacy fields kept for backward compatibility with existing AI generator.
  // TODO(Task 12): drop once service-paper-generation.ts is rewritten.
  topicNodeIds: z.array(objectIdSchema).default([]).optional(),
  cognitiveWeighting: z.object({
    knowledge: z.number().min(0).max(100),
    routine: z.number().min(0).max(100),
    complex: z.number().min(0).max(100),
    problemSolving: z.number().min(0).max(100),
  }).optional(),
}).strict();

// ─── Question CRUD on existing paper (NEW — Task 2) ───────────────────────

// Add: must pass exactly-one-of refinement.
export const addQuestionToPaperSchema = paperQuestionInputSchema;

// Update: all fields optional, NO refinement (so { marks: 5 } validates).
// Built fresh — does NOT inherit from paperQuestionInputSchema.
export const updatePaperQuestionSchema = z.object({
  questionId: objectIdSchema.optional(),
  questionText: z.string().min(1).max(5000).optional(),
  marks: z.number().int().min(0).max(100).optional(),
  position: z.number().int().min(0).optional(),
  modelAnswer: z.string().max(5000).optional(),
  markingGuideline: z.string().max(5000).optional(),
  diagram: paperQuestionDiagramSchema.optional(),
}).strict();

// ─── Memo update (NEW — Task 2) ───────────────────────────────────────────

export const updateMemoSchema = z.object({
  sections: z.array(z.object({
    title: z.string().min(1).max(200),
    items: z.array(z.object({
      position: z.number().int().min(0),
      modelAnswer: z.string().max(5000),
      markingGuideline: z.string().max(5000).optional(),
      marks: z.number().int().min(0).max(100),
    }).strict()),
  }).strict()),
}).strict();

// ─── Extract From Paper (Vision) ──────────────────────────────────────────

export const extractFromPaperSchema = z.object({
  image: z.string().min(1, 'Base64 image data is required'),
  imageType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
}).strict();

// ─── Inferred Types ────────────────────────────────────────────────────────

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ReviewQuestionInput = z.infer<typeof reviewQuestionSchema>;
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
export type QuestionQueryInput = z.infer<typeof questionQuerySchema>;
export type CreatePaperInput = z.infer<typeof createPaperSchema>;
export type UpdatePaperInput = z.infer<typeof updatePaperSchema>;
export type AddQuestionInput = z.infer<typeof addQuestionSchema>;
export type PaperQueryInput = z.infer<typeof paperQuerySchema>;
export type GeneratePaperInput = z.infer<typeof generatePaperSchema>;
export type ExtractFromPaperInput = z.infer<typeof extractFromPaperSchema>;
export type AddQuestionToPaperInput = z.infer<typeof addQuestionToPaperSchema>;
export type UpdatePaperQuestionInput = z.infer<typeof updatePaperQuestionSchema>;
export type UpdateMemoInput = z.infer<typeof updateMemoSchema>;
