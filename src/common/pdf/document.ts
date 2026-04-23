// src/common/pdf/document.ts
import PDFDocument from 'pdfkit';
import { MARGIN, PAGE_WIDTH } from './constants.js';

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

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.save();
      doc.font('Helvetica').fontSize(8);
      doc.text(
        `Page ${i + 1} of ${pageCount}`,
        MARGIN,
        doc.page.height - 30,
        { width: PAGE_WIDTH - MARGIN * 2, align: 'center' },
      );
      doc.restore();
    }

    doc.end();
  });
}
