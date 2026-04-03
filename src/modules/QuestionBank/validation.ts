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

// ─── Subdoc Schemas ────────────────────────────────────────────────────────

const mediaSchema = z.object({
  mediaType: mediaTypeEnum,
  url: z.string().url(),
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

// ─── Paper Section / Question ──────────────────────────────────────────────

const paperQuestionSchema = z.object({
  questionId: objectIdSchema,
  questionNumber: z.string().min(1),
  marks: z.number().int().min(1),
  order: z.number().int().min(0),
}).strict();

const paperSectionSchema = z.object({
  title: z.string().min(1),
  instructions: z.string().default(''),
  order: z.number().int().min(0),
  questions: z.array(paperQuestionSchema).default([]),
}).strict();

// ─── Paper Schemas ─────────────────────────────────────────────────────────

export const createPaperSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  term: z.number().int().min(1).max(4),
  year: z.number().int(),
  paperType: paperTypeEnum,
  duration: z.number().int().min(1),
  sections: z.array(paperSectionSchema).default([]),
  instructions: z.string().default(''),
}).strict();

export const updatePaperSchema = z.object({
  title: z.string().min(1).trim().optional(),
  term: z.number().int().min(1).max(4).optional(),
  year: z.number().int().optional(),
  paperType: paperTypeEnum.optional(),
  duration: z.number().int().min(1).optional(),
  instructions: z.string().optional(),
  sections: z.array(paperSectionSchema).optional(),
}).strict();

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
