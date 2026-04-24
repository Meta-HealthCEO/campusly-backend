import { describe, it, expect } from 'vitest';
import { GradingResponseSchema } from '../validation-grading.js';

const valid = {
  totalMark: 8,
  maxMark: 10,
  percentage: 80,
  criteriaScores: [{ criterion: 'Content', score: 4, maxScore: 5, feedback: '' }],
  overallFeedback: 'Good',
  strengths: ['a'],
  improvements: [],
};

describe('GradingResponseSchema', () => {
  it('accepts valid', () => {
    expect(GradingResponseSchema.safeParse(valid).success).toBe(true);
  });
  it('rejects empty criteriaScores', () => {
    expect(GradingResponseSchema.safeParse({ ...valid, criteriaScores: [] }).success).toBe(false);
  });
  it('rejects percentage > 100', () => {
    expect(GradingResponseSchema.safeParse({ ...valid, percentage: 150 }).success).toBe(false);
  });
  it('rejects negative totalMark', () => {
    expect(GradingResponseSchema.safeParse({ ...valid, totalMark: -1 }).success).toBe(false);
  });
  it('defaults feedback/strengths/improvements', () => {
    const r = GradingResponseSchema.safeParse({
      totalMark: 5, maxMark: 10, percentage: 50,
      criteriaScores: [{ criterion: 'X', score: 5, maxScore: 10 }],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.overallFeedback).toBe('');
      expect(r.data.strengths).toEqual([]);
    }
  });
});
