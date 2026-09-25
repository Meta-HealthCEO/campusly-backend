// src/modules/QuestionBank/validation-shared.ts
//
// Enums and sub-schemas shared by the QuestionBank validation files. Moved
// unchanged from validation.ts (a pure move, to keep files under 350 lines).
import { z } from 'zod/v4';

// ─── Shared Enums ──────────────────────────────────────────────────────────

export const questionTypeEnum = z.enum([
  'mcq', 'true_false', 'short_answer', 'structured', 'essay',
  'match', 'fill_blank', 'calculation', 'diagram_label', 'case_study',
]);

export const capsLevelEnum = z.enum([
  'knowledge', 'routine', 'complex', 'problem_solving',
]);

export const bloomsLevelEnum = z.enum([
  'remember', 'understand', 'apply', 'analyse', 'evaluate', 'create',
]);

export const mediaTypeEnum = z.enum(['image', 'diagram', 'table']);

export const questionStatusEnum = z.enum([
  'draft', 'pending_review', 'approved', 'rejected',
]);

// NOTE: paperType values match `model-papers.ts` PAPER_TYPES exactly.
// Module 2 plan listed simpler labels but the model is source of truth.
// Frontend types in Task 13 must mirror these legacy values.
export const paperTypeEnum = z.enum([
  'class_test', 'assignment', 'mid_year', 'trial', 'final', 'custom',
]);

export const paperDifficultyEnum = z.enum(['easy', 'medium', 'hard']);

// ─── Subdoc Schemas ────────────────────────────────────────────────────────

export const mediaSchema = z.object({
  mediaType: mediaTypeEnum,
  url: z.url(),
}).strict();

export const optionSchema = z.object({
  label: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
}).strict();

export const cognitiveLevelSchema = z.object({
  caps: capsLevelEnum,
  blooms: bloomsLevelEnum,
}).strict();
