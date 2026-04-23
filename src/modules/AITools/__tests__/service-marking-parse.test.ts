import { describe, it, expect } from 'vitest';
import { MarkingResponseSchema } from '../validation-marking.js';

const validBase = {
  studentName: 'Alice',
  totalMarks: 8,
  maxMarks: 10,
  percentage: 80,
  questions: [{
    questionNumber: 1, studentAnswer: '4', correctAnswer: '4',
    marksAwarded: 2, maxMarks: 2, feedback: 'Correct.',
  }],
  extractedHeader: 'Math Grade 10 - Algebra',
  paperMismatch: false,
  mismatchReason: '',
};

describe('MarkingResponseSchema', () => {
  it('accepts a valid response', () => {
    expect(MarkingResponseSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects response with no questions', () => {
    const bad = { ...validBase, questions: [] };
    expect(MarkingResponseSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects negative marks', () => {
    const bad = { ...validBase, totalMarks: -1 };
    expect(MarkingResponseSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects percentage over 100', () => {
    const bad = { ...validBase, percentage: 150 };
    expect(MarkingResponseSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts paper mismatch with reason', () => {
    const mismatch = { ...validBase, paperMismatch: true, mismatchReason: 'Image shows a Science paper, not Maths.' };
    expect(MarkingResponseSchema.safeParse(mismatch).success).toBe(true);
  });

  it('defaults missing mismatch fields', () => {
    const minimal = {
      studentName: 'B', totalMarks: 0, maxMarks: 1, percentage: 0,
      questions: [{ questionNumber: 1, marksAwarded: 0, maxMarks: 1 }],
    };
    const result = MarkingResponseSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.paperMismatch).toBe(false);
      expect(result.data.extractedHeader).toBe('');
    }
  });
});
