// src/common/pdf/primitives.ts
import {
  MARGIN, PAGE_WIDTH, CONTENT_WIDTH, FOOTER_RESERVE,
  FONT_TITLE, FONT_NORMAL,
} from './constants.js';
import type { NormalisedPaperMeta } from './types.js';

export function checkPageSpace(doc: PDFKit.PDFDocument, needed: number): void {
  if (doc.y + needed > doc.page.height - MARGIN - FOOTER_RESERVE) {
    doc.addPage();
  }
}

export function renderTitlePage(
  doc: PDFKit.PDFDocument,
  meta: NormalisedPaperMeta,
): void {
  doc.moveDown(4);
  doc.font(FONT_TITLE).fontSize(22).text(meta.schoolName, { align: 'center' });
  doc.moveDown(1.5);

  doc.font(FONT_TITLE).fontSize(16).text(meta.subject, { align: 'center' });
  doc.moveDown(0.5);

  doc.font(FONT_NORMAL).fontSize(13).text(meta.gradeLabel, { align: 'center' });
  const yearPart = meta.year ? ` — ${meta.year}` : '';
  doc.font(FONT_NORMAL).fontSize(13).text(
    `Term ${meta.term}${yearPart}`,
    { align: 'center' },
  );
  doc.moveDown(1);

  if (meta.paperTypeLabel) {
    doc.font(FONT_TITLE).fontSize(14).text(meta.paperTypeLabel, { align: 'center' });
    doc.moveDown(2);
  }

  doc.font(FONT_NORMAL).fontSize(11);
  doc.text(`Total Marks: ${meta.totalMarks}`, { align: 'center' });
  doc.text(`Time: ${meta.duration} minutes`, { align: 'center' });
  doc.moveDown(1);
  doc.moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y).stroke();
  doc.moveDown(1);
}

export function renderMemoTitlePage(
  doc: PDFKit.PDFDocument,
  meta: NormalisedPaperMeta,
): void {
  doc.moveDown(4);
  doc.font(FONT_TITLE).fontSize(22).text(meta.schoolName, { align: 'center' });
  doc.moveDown(1);
  doc.font(FONT_TITLE).fontSize(20).text('MEMORANDUM', { align: 'center' });
  doc.moveDown(1);

  doc.font(FONT_TITLE).fontSize(14).text(meta.subject, { align: 'center' });
  doc.moveDown(0.5);
  doc.font(FONT_NORMAL).fontSize(12).text(meta.gradeLabel, { align: 'center' });
  const yearPart = meta.year ? ` — ${meta.year}` : '';
  doc.font(FONT_NORMAL).fontSize(12).text(
    `Term ${meta.term}${yearPart}`,
    { align: 'center' },
  );
  doc.moveDown(0.5);
  doc.font(FONT_NORMAL).fontSize(11).text(`Total Marks: ${meta.totalMarks}`, { align: 'center' });
  doc.moveDown(1.5);
  doc.moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y).stroke();
  doc.moveDown(1);
}

export function renderInstructions(doc: PDFKit.PDFDocument, instructions?: string): void {
  if (!instructions) return;
  doc.font(FONT_TITLE).fontSize(12).text('INSTRUCTIONS', { underline: true });
  doc.moveDown(0.3);
  doc.font(FONT_NORMAL).fontSize(10).text(instructions, { width: CONTENT_WIDTH });
  doc.moveDown(1);
  doc.moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y).stroke();
  doc.moveDown(1);
}
