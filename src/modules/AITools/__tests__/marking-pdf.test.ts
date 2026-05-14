import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { buildMarkingPdf } from '../service-marking-pdf.js';
import type { IPaperMarking } from '../model-marking.js';
import { markingDir } from '../service-marking-images.js';

function makeMarking(images: { filename: string; pageNumber: number }[]): IPaperMarking {
  const id = new mongoose.Types.ObjectId();
  return {
    _id: id,
    paperId: new mongoose.Types.ObjectId(),
    paperType: 'generated',
    studentName: 'Test',
    teacherId: new mongoose.Types.ObjectId(),
    schoolId: new mongoose.Types.ObjectId(),
    imageCount: images.length,
    totalMarks: 5,
    maxMarks: 10,
    percentage: 50,
    questions: [],
    status: 'completed',
    isDeleted: false,
    extractedHeader: null,
    paperMismatch: false,
    mismatchReason: null,
    aiRawResult: null,
    images: images.map((i) => ({ ...i, mimeType: 'image/png', sizeBytes: 1 })),
    paperVersion: 1,
    issuedToStudent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as IPaperMarking;
}

// A 1x1 transparent PNG, base64 decoded
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAeImBZsAAAAASUVORK5CYII=',
  'base64',
);

describe('buildMarkingPdf', () => {
  it('returns null when marking has no images', async () => {
    const m = makeMarking([]);
    const out = await buildMarkingPdf(m, { paperTitle: 'Empty' });
    expect(out).toBeNull();
  });

  it('returns a non-empty PDF buffer when images exist on disk', async () => {
    const m = makeMarking([{ filename: 'page-1.png', pageNumber: 1 }]);
    const dir = markingDir(String(m._id));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'page-1.png'), TINY_PNG);

    try {
      const out = await buildMarkingPdf(m, { paperTitle: 'Test paper' });
      expect(out).not.toBeNull();
      expect(out!.length).toBeGreaterThan(100);
      // PDF files start with the magic %PDF-
      expect(out!.subarray(0, 5).toString()).toBe('%PDF-');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
