// src/modules/AITools/validation-marking.ts
import { z } from 'zod/v4';

export const MarkingQuestionSchema = z.object({
  questionNumber: z.union([z.number(), z.string()]),
  studentAnswer: z.string().default(''),
  correctAnswer: z.string().default(''),
  marksAwarded: z.number().nonnegative(),
  maxMarks: z.number().nonnegative(),
  feedback: z.string().default(''),
  rationale: z.string().optional(),
});

export const MarkingResponseSchema = z.object({
  studentName: z.string(),
  totalMarks: z.number().nonnegative(),
  maxMarks: z.number().positive(),
  percentage: z.number().min(0).max(100),
  questions: z.array(MarkingQuestionSchema).min(1),
  extractedHeader: z.string().default(''),
  paperMismatch: z.boolean().default(false),
  mismatchReason: z.string().default(''),
});

export type MarkingResponse = z.infer<typeof MarkingResponseSchema>;
