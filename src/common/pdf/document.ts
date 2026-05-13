// src/common/pdf/document.ts
import PDFDocument from 'pdfkit';
import { MARGIN, CONTENT_WIDTH, FOOTER_RESERVE } from './constants.js';

export function createDocument(): PDFKit.PDFDocument {
  return new PDFDocument({
    size: 'A4',
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    bufferPages: true,
  });
}

export function finalise(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      doc.save();
      doc.font('Helvetica').fontSize(8);
      // Keep the footer inside PDFKit's writable page area. Writing below the
      // bottom margin makes PDFKit auto-add a fresh page for the footer, which
      // doubles the page count with blank pages.
      doc.text(
        `Page ${i + 1} of ${pages.count}`,
        MARGIN,
        doc.page.height - MARGIN - 20,
        { width: CONTENT_WIDTH, align: 'center', lineBreak: false },
      );
      doc.restore();
    }

    doc.end();
  });
}
