// src/modules/AITools/__tests__/service-generation-parse.test.ts
import { describe, it, expect } from 'vitest';
import { PaperGenerationResponseSchema } from '../validation-ai.js';

describe('PaperGenerationResponseSchema', () => {
  it('accepts a valid minimal response', () => {
    const result = PaperGenerationResponseSchema.safeParse({
      sections: [{
        sectionLabel: 'A',
        questionType: 'Short',
        questions: [{ questionNumber: 1, questionText: 'Q1', marks: 5 }],
      }],
      memorandum: 'memo',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a response with no sections', () => {
    const result = PaperGenerationResponseSchema.safeParse({
      sections: [],
      memorandum: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a section with no questions', () => {
    const result = PaperGenerationResponseSchema.safeParse({
      sections: [{ sectionLabel: 'A', questionType: 'Short', questions: [] }],
      memorandum: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a question with empty text', () => {
    const result = PaperGenerationResponseSchema.safeParse({
      sections: [{
        sectionLabel: 'A', questionType: 'Short',
        questions: [{ questionNumber: 1, questionText: '', marks: 5 }],
      }],
      memorandum: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional diagram', () => {
    const result = PaperGenerationResponseSchema.safeParse({
      sections: [{
        sectionLabel: 'A', questionType: 'Short',
        questions: [{
          questionNumber: 1, questionText: 'Q1', marks: 5,
          diagram: { tikz: '\\draw (0,0) -- (1,1);', alt: 'line' },
        }],
      }],
      memorandum: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric marks', () => {
    const result = PaperGenerationResponseSchema.safeParse({
      sections: [{
        sectionLabel: 'A', questionType: 'Short',
        questions: [{ questionNumber: 1, questionText: 'Q1', marks: 'five' }],
      }],
      memorandum: '',
    });
    expect(result.success).toBe(false);
  });
});
