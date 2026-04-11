import PDFDocument from 'pdfkit';
import type { ICertificate } from './model.js';

/**
 * Certificate PDF dimensions. A4 landscape (297×210mm → 842×595 pt) is
 * the traditional certificate orientation and reads well as both a
 * screen download and a printed page.
 */
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const MARGIN = 50;

/**
 * Render a certificate as a PDF Buffer. The caller streams the buffer to
 * the HTTP response with Content-Type: application/pdf. Matches the
 * pattern used by src/modules/QuestionBank/service-pdf.ts.
 */
export class CourseCertificatePdfService {
  static async render(cert: ICertificate): Promise<Buffer> {
    const doc = createDocument();
    renderBorder(doc);
    renderTitle(doc);
    renderStudentName(doc, cert.studentName);
    renderCompletionText(doc, cert.courseName);
    renderFooter(doc, cert);
    return finalise(doc);
  }
}

// ─── Document helpers ────────────────────────────────────────────────────

function createDocument(): PDFKit.PDFDocument {
  return new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    bufferPages: true,
    info: {
      Title: 'Certificate of Completion',
      Author: 'Campusly',
    },
  });
}

function finalise(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

// ─── Rendering ───────────────────────────────────────────────────────────

/**
 * A double border ~15pt inside the page edge. Gives the cert its
 * "official document" feel without needing custom fonts or images.
 */
function renderBorder(doc: PDFKit.PDFDocument): void {
  const outer = 20;
  const inner = 30;
  doc
    .lineWidth(2)
    .strokeColor('#1e3a8a') // deep blue — matches Campusly brand
    .rect(outer, outer, PAGE_WIDTH - 2 * outer, PAGE_HEIGHT - 2 * outer)
    .stroke()
    .lineWidth(0.75)
    .rect(inner, inner, PAGE_WIDTH - 2 * inner, PAGE_HEIGHT - 2 * inner)
    .stroke();
}

/**
 * The "Certificate of Completion" headline and the presentation line,
 * centred near the top of the page.
 */
function renderTitle(doc: PDFKit.PDFDocument): void {
  doc
    .fillColor('#1e3a8a')
    .font('Helvetica-Bold')
    .fontSize(32)
    .text('Certificate of Completion', 0, 90, {
      align: 'center',
      width: PAGE_WIDTH,
    });

  doc
    .fillColor('#6b7280')
    .font('Helvetica')
    .fontSize(14)
    .text('This certificate is presented to', 0, 150, {
      align: 'center',
      width: PAGE_WIDTH,
    });
}

/**
 * The student's name in a large weight, centred. This is the visual
 * centrepiece of the certificate.
 */
function renderStudentName(doc: PDFKit.PDFDocument, name: string): void {
  doc
    .fillColor('#111827')
    .font('Helvetica-Bold')
    .fontSize(42)
    .text(name, 0, 200, {
      align: 'center',
      width: PAGE_WIDTH,
    });

  // Underline beneath the name.
  const underlineY = 260;
  const lineWidth = 400;
  doc
    .moveTo((PAGE_WIDTH - lineWidth) / 2, underlineY)
    .lineTo((PAGE_WIDTH + lineWidth) / 2, underlineY)
    .lineWidth(1)
    .strokeColor('#1e3a8a')
    .stroke();
}

/**
 * "For successfully completing the course: [course name]" centred below
 * the student name.
 */
function renderCompletionText(
  doc: PDFKit.PDFDocument,
  courseName: string,
): void {
  doc
    .fillColor('#6b7280')
    .font('Helvetica')
    .fontSize(14)
    .text('for successfully completing the course', 0, 285, {
      align: 'center',
      width: PAGE_WIDTH,
    });

  doc
    .fillColor('#111827')
    .font('Helvetica-Bold')
    .fontSize(20)
    .text(courseName, 0, 315, {
      align: 'center',
      width: PAGE_WIDTH,
    });
}

/**
 * School name on the left, issued date in the middle, verification code
 * on the right — all near the bottom of the page.
 */
function renderFooter(
  doc: PDFKit.PDFDocument,
  cert: ICertificate,
): void {
  const footerY = PAGE_HEIGHT - 100;
  const issued = cert.issuedAt.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const columnWidth = (PAGE_WIDTH - 2 * MARGIN - 40) / 3;

  // Left: school name
  doc
    .fillColor('#111827')
    .font('Helvetica-Bold')
    .fontSize(12)
    .text(cert.schoolName, MARGIN + 20, footerY, {
      align: 'left',
      width: columnWidth,
    });
  doc
    .fillColor('#6b7280')
    .font('Helvetica')
    .fontSize(10)
    .text('Issued by', MARGIN + 20, footerY + 18, {
      align: 'left',
      width: columnWidth,
    });

  // Middle: issued date (uses full page width for centring)
  doc
    .fillColor('#111827')
    .font('Helvetica-Bold')
    .fontSize(12)
    .text(issued, 0, footerY, {
      align: 'center',
      width: PAGE_WIDTH,
    });
  doc
    .fillColor('#6b7280')
    .font('Helvetica')
    .fontSize(10)
    .text('Date of issue', 0, footerY + 18, {
      align: 'center',
      width: PAGE_WIDTH,
    });

  // Right: verification code (monospace)
  const rightX = PAGE_WIDTH - MARGIN - 20 - columnWidth;
  doc
    .fillColor('#111827')
    .font('Courier-Bold')
    .fontSize(12)
    .text(cert.verificationCode, rightX, footerY, {
      align: 'right',
      width: columnWidth,
    });
  doc
    .fillColor('#6b7280')
    .font('Helvetica')
    .fontSize(10)
    .text('Verification code', rightX, footerY + 18, {
      align: 'right',
      width: columnWidth,
    });

  // Verification URL hint beneath the code.
  doc
    .fontSize(8)
    .fillColor('#9ca3af')
    .text(`Verify at /verify/${cert.verificationCode}`, 0, footerY + 40, {
      align: 'center',
      width: PAGE_WIDTH,
    });
}
