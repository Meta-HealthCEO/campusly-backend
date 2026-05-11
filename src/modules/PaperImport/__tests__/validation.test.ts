import { describe, it, expect } from 'vitest';
import {
  CreatePaperImportSchema,
  SegmentResponseSchema,
  TranscribeResponseSchema,
} from '../validation.js';

const objectId = '64b0a0a0a0a0a0a0a0a0a0a0';

describe('CreatePaperImportSchema', () => {
  it('accepts a minimal valid payload', () => {
    const r = CreatePaperImportSchema.safeParse({
      subjectId: objectId, gradeId: objectId, term: 1, curriculumNodeId: objectId,
      generateAnswers: true, addHints: true, addWorkedExample: false, addExplanations: false,
    });
    expect(r.success).toBe(true);
  });
  it('rejects term outside 1-4', () => {
    expect(CreatePaperImportSchema.safeParse({
      subjectId: objectId, gradeId: objectId, term: 5, curriculumNodeId: objectId,
      generateAnswers: true, addHints: true, addWorkedExample: false, addExplanations: false,
    }).success).toBe(false);
  });
});

describe('SegmentResponseSchema', () => {
  it('accepts valid', () => {
    expect(SegmentResponseSchema.safeParse({
      resources: [{ kind: 'worksheet', title: 'X', pageRange: [1, 2], reasoning: 'r' }],
    }).success).toBe(true);
  });
  it('rejects unknown kind', () => {
    expect(SegmentResponseSchema.safeParse({
      resources: [{ kind: 'unknown', title: 'X', pageRange: [1, 2], reasoning: 'r' }],
    }).success).toBe(false);
  });
});

describe('TranscribeResponseSchema', () => {
  it('accepts blocks with confidence + optional cropBox', () => {
    const r = TranscribeResponseSchema.safeParse({
      title: 'X',
      blocks: [
        { blockId: 'b1', type: 'text', order: 0, content: '{}', confidence: 0.9 },
        { blockId: 'b2', type: 'image', order: 1, content: '{}', confidence: 0.7,
          cropBox: { page: 1, x: 0.1, y: 0.1, w: 0.5, h: 0.5 } },
      ],
    });
    expect(r.success).toBe(true);
  });
});
