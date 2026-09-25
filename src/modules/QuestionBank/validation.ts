import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';
import { CAPS_LEVELS } from './model-shared.js';
import { questionTypeEnum, capsLevelEnum, questionStatusEnum, paperTypeEnum, paperDifficultyEnum, mediaSchema, optionSchema, cognitiveLevelSchema } from './validation-shared.js';
import { generatePaperSchema } from './validation-paper-generation.js';

// Shared enums live in validation-shared.ts and the AI paper generation
// schema in validation-paper-generation.ts (split to stay under 350 lines).
export { PAPER_QUESTION_TYPES, type PaperQuestionType, generatePaperSchema } from './validation-paper-generation.js';

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
}).strict();

// ─── Paper Question / Section (NEW SHAPE — Task 1) ────────────────────────

const paperQuestionDiagramSchema = z.object({
  tikz: z.string().max(20000),
  caption: z.string().max(500).optional(),
}).strict();

// Base shape for a paper question — bank-ref XOR inline.
const paperQuestionBaseShape = {
  questionId: objectIdSchema.optional(),
  questionText: z.string().min(1).max(5000).optional(),
  options: z.array(optionSchema).default([]),
  marks: z.number().int().min(0).max(100),
  position: z.number().int().min(0),
  modelAnswer: z.string().max(5000).optional(),
  markingGuideline: z.string().max(5000).optional(),
  diagram: paperQuestionDiagramSchema.optional(),
  curriculumNodeId: objectIdSchema.nullable().optional(),
  capsLevel: z.enum(CAPS_LEVELS).nullable().optional(),
} as const;

const paperQuestionXorRefinement = (
  q: { questionId?: string; questionText?: string },
) => (Boolean(q.questionId) !== Boolean(q.questionText));

const paperQuestionInputSchema = z.object(paperQuestionBaseShape).strict().refine(
  paperQuestionXorRefinement,
  { message: 'Exactly one of questionId or questionText must be set' },
);

const paperSectionInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  instructions: z.string().trim().max(2000).optional(),
  questions: z.array(paperQuestionInputSchema).max(100),
}).strict();

// ─── Paper Schemas ─────────────────────────────────────────────────────────

export const createPaperSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  schoolId: objectIdSchema.optional(),
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
  instructions: z.string().trim().max(5000).optional(),
}).strict();

export const updatePaperSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  topicIds: z.array(objectIdSchema).min(1).max(20).optional(),
  term: z.number().int().min(1).max(4).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  paperType: paperTypeEnum.optional(),
  duration: z.number().int().min(5).max(480).optional(),
  totalMarks: z.number().int().min(0).max(500).optional(),
  difficulty: paperDifficultyEnum.optional(),
  sections: z.array(paperSectionInputSchema).min(0).max(20).optional(),
  instructions: z.string().trim().max(5000).optional(),
}).strict();

// DEPRECATED: superseded by addQuestionToPaperSchema.
// Remove once Task 4 (AI gen refactor) and Task 9 (route wiring) land.
// Legacy shape (sectionIndex + questionNumber) — preserved so existing
// routes/services continue to compile until those tasks land.
export const addQuestionSchema = z.object({
  sectionIndex: z.number().int().min(0),
  questionId: objectIdSchema,
  questionNumber: z.string().min(1),
  marks: z.number().int().min(1),
}).strict();

export const paperQuerySchema = z.object({
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  term: z.coerce.number().int().min(1).max(4).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  status: z.enum(['draft', 'finalised', 'archived']).optional(),
  paperType: paperTypeEnum.optional(),
  moderation: z.enum(['pending', 'approved', 'changes_requested']).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

// ─── Paper Assignment to Class (Phase 1) ──────────────────────────────────

export const PAPER_ASSIGNMENT_MODES = ['digital', 'paper'] as const;

export const createPaperAssignmentSchema = z.object({
  classId: objectIdSchema,
  mode: z.enum(PAPER_ASSIGNMENT_MODES),
  releaseAt: z.iso.datetime().nullable().optional(),
  dueAt: z.iso.datetime().nullable().optional(),
}).strict();

export type CreatePaperAssignmentInput = z.infer<typeof createPaperAssignmentSchema>;

// ─── Question CRUD on existing paper (NEW — Task 2) ───────────────────────

// Add: must pass exactly-one-of refinement.
export const addQuestionToPaperSchema = paperQuestionInputSchema;

// Update: all fields optional, NO XOR refinement (so { marks: 5 } validates).
// Built fresh — does NOT inherit from paperQuestionInputSchema. A min-keys
// refinement still rejects an empty body so PATCH without changes 400s.
export const updatePaperQuestionSchema = z.object({
  questionId: objectIdSchema.optional(),
  questionText: z.string().min(1).max(5000).optional(),
  options: z.array(optionSchema).optional(),
  marks: z.number().int().min(0).max(100).optional(),
  position: z.number().int().min(0).optional(),
  modelAnswer: z.string().max(5000).optional(),
  markingGuideline: z.string().max(5000).optional(),
  diagram: z.object({
    tikz: z.string().max(20000),
    caption: z.string().max(500).optional(),
  }).strict().optional(),
  curriculumNodeId: objectIdSchema.nullable().optional(),
  capsLevel: z.enum(CAPS_LEVELS).nullable().optional(),
}).strict().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: 'At least one field must be provided to update' },
);

// ─── Memo update (NEW — Task 2) ───────────────────────────────────────────

// Shape mirrors `IPaperMemo` in
// `src/modules/TeacherWorkbench/model.assessment.ts` — model is source of
// truth. Min/max bounds tighten the model's permissive Mongoose defaults
// for sensible write-time UX (e.g. a memo with zero sections is meaningless).
const memoMarkAllocationSchema = z.object({
  criterion: z.string().trim().max(500),
  marks: z.number().int().min(0).max(100),
}).strict();

const memoAnswerSchema = z.object({
  questionNumber: z.string().min(1).max(20),  // e.g. "1", "1.a", "2.b.iii"
  expectedAnswer: z.string().trim().max(5000),
  markAllocation: z.array(memoMarkAllocationSchema).max(20),
  commonMistakes: z.array(z.string().trim().max(500)).max(10).optional(),
  acceptableAlternatives: z.array(z.string().trim().max(500)).max(10).optional(),
}).strict();

const memoSectionSchema = z.object({
  sectionTitle: z.string().min(1).max(200),
  answers: z.array(memoAnswerSchema).max(100),
}).strict();

export const updateMemoSchema = z.object({
  sections: z.array(memoSectionSchema).min(1).max(20),
}).strict().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: 'At least one field must be provided to update' },
);

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
