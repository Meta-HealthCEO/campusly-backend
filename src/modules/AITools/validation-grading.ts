import { z } from 'zod/v4';

export const CriteriaScoreSchema = z.object({
  criterion: z.string().min(1),
  score: z.number().nonnegative(),
  maxScore: z.number().positive(),
  feedback: z.string().default(''),
});

export const GradingResponseSchema = z.object({
  totalMark: z.number().nonnegative(),
  maxMark: z.number().positive(),
  percentage: z.number().min(0).max(100),
  criteriaScores: z.array(CriteriaScoreSchema).min(1),
  overallFeedback: z.string().default(''),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
});

export type GradingResponse = z.infer<typeof GradingResponseSchema>;
