// src/modules/QuestionBank/validation-paper-generation.ts
//
// The AI paper generation request. Moved unchanged from validation.ts (a
// pure move, to keep files under 350 lines); validation.ts re-exports it.
import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';
import { paperTypeEnum, paperDifficultyEnum } from './validation-shared.js';

// ─── AI Paper Generation ──────────────────────────────────────────────────

const sectionConfigSchema = z.object({
  title: z.string().trim().min(1).max(200),
  instructions: z.string().trim().max(2000).optional(),
  questionCount: z.number().int().min(1).max(50),
  sectionMarks: z.number().int().min(1).max(200),
}).strict();

// Question types the AI generator can actually produce + score reliably.
// Subset of the full Question.type enum — drops formats (true_false, match,
// fill_blank, diagram_label) that the AI prompt and parser don't cover today.
export const PAPER_QUESTION_TYPES = [
  'mcq', 'short_answer', 'structured', 'essay', 'calculation',
] as const;
export type PaperQuestionType = (typeof PAPER_QUESTION_TYPES)[number];

const questionTypeWeightSchema = z.object({
  type: z.enum(PAPER_QUESTION_TYPES),
  weight: z.number().min(0).max(100),
}).strict();

export const generatePaperSchema = z.object({
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
  title: z.string().trim().min(1).max(200),
  sectionConfig: z.array(sectionConfigSchema).min(1).max(10),
  instructions: z.string().trim().max(5000).optional(),
  // Optional question-type mix. Each entry weights one paper question type
  // as a percentage of total marks. Weights should sum to ~100 (a ±2 slack
  // is allowed for rounding). When omitted the generator falls back to the
  // legacy "ignore type during selection, group post-hoc" behaviour.
  questionTypeMix: z.array(questionTypeWeightSchema).min(1).max(PAPER_QUESTION_TYPES.length).optional(),
  // Opt-in seeding from the teacher's curated Question Bank. When false
  // (default), every question on the paper is freshly AI-generated and
  // saved as a draft on the paper — nothing is pulled from prior approved
  // questions. When true, the generator first selects matching approved
  // bank questions, then AI-fills any deficit. Lets teachers run "fresh"
  // and "reuse" generations side-by-side without committing to one mode.
  useExistingBank: z.boolean().default(false).optional(),
  // Legacy fields kept for backward compatibility with existing AI generator.
  // TODO(Task 12): drop once service-paper-generation.ts is rewritten.
  topicNodeIds: z.array(objectIdSchema).default([]).optional(),
  cognitiveWeighting: z.object({
    knowledge: z.number().min(0).max(100),
    routine: z.number().min(0).max(100),
    complex: z.number().min(0).max(100),
    problemSolving: z.number().min(0).max(100),
  }).optional(),
}).strict().superRefine((data, ctx) => {
  const configuredMarks = data.sectionConfig.reduce(
    (sum, section) => sum + section.sectionMarks,
    0,
  );
  if (configuredMarks !== data.totalMarks) {
    ctx.addIssue({
      code: 'custom',
      path: ['sectionConfig'],
      message: 'Section marks must add up to totalMarks',
    });
  }
  if (data.questionTypeMix) {
    const sum = data.questionTypeMix.reduce((acc, m) => acc + m.weight, 0);
    if (Math.abs(sum - 100) > 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['questionTypeMix'],
        message: `Question-type weights must sum to ~100 (got ${sum.toFixed(1)})`,
      });
    }
    const seen = new Set<string>();
    for (const m of data.questionTypeMix) {
      if (seen.has(m.type)) {
        ctx.addIssue({
          code: 'custom',
          path: ['questionTypeMix'],
          message: `Duplicate question type in mix: ${m.type}`,
        });
        break;
      }
      seen.add(m.type);
    }
  }
});
