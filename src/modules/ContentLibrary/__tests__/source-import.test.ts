import { describe, it, expect } from 'vitest';
import { createResourceSchema } from '../validation.js';

const base = {
  curriculumNodeId: '64b0a0a0a0a0a0a0a0a0a0a0',
  type: 'worksheet',
  title: 'T',
  blocks: [],
  gradeId: '64b0a0a0a0a0a0a0a0a0a0a1',
  subjectId: '64b0a0a0a0a0a0a0a0a0a0a2',
  term: 1,
  tags: [],
  prerequisites: [],
};

describe('createResourceSchema source extensions', () => {
  it('accepts source: imported', () => {
    expect(createResourceSchema.safeParse({ ...base, source: 'imported' }).success).toBe(true);
  });
  it('accepts sourceImport block', () => {
    const r = createResourceSchema.safeParse({
      ...base,
      source: 'imported',
      sourceImport: {
        jobId: '64b0a0a0a0a0a0a0a0a0a0a3',
        storagePath: 'uploads/paper-imports/abc/source.pdf',
        filename: 'worksheet.pdf',
        mimeType: 'application/pdf',
        pageRange: { start: 1, end: 3 },
      },
      needsReview: true,
    });
    expect(r.success).toBe(true);
  });
  it('defaults needsReview to false', () => {
    const r = createResourceSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.needsReview).toBe(false);
  });
});
