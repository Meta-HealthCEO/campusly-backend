import path from 'path';
import fs from 'fs';
import { createDocument, finalise } from '../../common/pdf/document.js';

function toISODateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
import { MARGIN, CONTENT_WIDTH, PAGE_HEIGHT, FONT_TITLE, FONT_NORMAL, FOOTER_RESERVE } from '../../common/pdf/constants.js';
import { markingDir } from './service-marking-images.js';
import type { IPaperMarking } from './model-marking.js';

interface PdfMeta {
  paperTitle: string;
}

/**
 * Stitch a marking's uploaded page images into a single A4 PDF.
 * Returns null when the marking has no images (caller should 404).
 */
export async function buildMarkingPdf(
  marking: IPaperMarking,
  meta: PdfMeta,
): Promise<Buffer | null> {
  if (!marking.images || marking.images.length === 0) return null;

  const doc = createDocument();
  const dir = markingDir(String(marking._id));
  const ordered = [...marking.images].sort((a, b) => a.pageNumber - b.pageNumber);

  // Header on page 1
  doc.font(FONT_TITLE).fontSize(16).text(meta.paperTitle, MARGIN, MARGIN, { width: CONTENT_WIDTH });
  doc.moveDown(0.3);
  doc.font(FONT_NORMAL).fontSize(11).text(`Student: ${marking.studentName}`, { width: CONTENT_WIDTH });
  doc.text(
    `Score: ${marking.totalMarks}/${marking.maxMarks} (${Math.round(marking.percentage)}%)`,
    { width: CONTENT_WIDTH },
  );
  doc.text(`Marked: ${toISODateLocal(marking.updatedAt)}`, { width: CONTENT_WIDTH });
  doc.moveDown(1);

  const usableHeight = PAGE_HEIGHT - MARGIN * 2 - FOOTER_RESERVE - 100; // leave room for header on first page
  const fullPageHeight = PAGE_HEIGHT - MARGIN * 2 - FOOTER_RESERVE;

  ordered.forEach((img, idx) => {
    const absPath = path.join(dir, img.filename);
    if (!fs.existsSync(absPath)) {
      console.warn('Marking PDF: missing image', { markingId: String(marking._id), filename: img.filename });
      return;
    }
    if (idx === 0) {
      doc.image(absPath, MARGIN, doc.y, { fit: [CONTENT_WIDTH, usableHeight], align: 'center' });
    } else {
      doc.addPage();
      doc.image(absPath, MARGIN, MARGIN, { fit: [CONTENT_WIDTH, fullPageHeight], align: 'center' });
    }
  });

  return finalise(doc);
}
