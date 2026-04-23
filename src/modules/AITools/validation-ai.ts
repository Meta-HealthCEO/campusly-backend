// src/modules/AITools/validation-ai.ts
import { z } from 'zod/v4';

export const DiagramSchema = z.object({
  tikz: z.string(),
  data: z.record(z.string(), z.unknown()).optional().default({}),
  alt: z.string().default(''),
}).optional();

export const PaperQuestionSchema = z.object({
  questionNumber: z.union([z.number(), z.string()]),
  questionText: z.string().min(1),
  marks: z.number().int().nonnegative(),
  modelAnswer: z.string().default(''),
  markingGuideline: z.string().default(''),
  diagram: DiagramSchema,
});

export const PaperSectionSchema = z.object({
  sectionLabel: z.string().min(1),
  questionType: z.string().min(1),
  questions: z.array(PaperQuestionSchema).min(1),
});

export const PaperGenerationResponseSchema = z.object({
  sections: z.array(PaperSectionSchema).min(1),
  memorandum: z.string().default(''),
});

export type PaperGenerationResponse = z.infer<typeof PaperGenerationResponseSchema>;
