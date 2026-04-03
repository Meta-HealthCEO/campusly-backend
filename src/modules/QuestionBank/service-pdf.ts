import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import { AssessmentPaper } from './model.js';
import type { IQuestion } from './model.js';
import { School } from '../School/model.js';
import { NotFoundError } from '../../common/errors.js';
import { collectPaperQuestions } from './service-papers-helpers.js';
import {
  MARGIN,
  renderTitlePage,
  renderInstructions,
  renderQuestionSections,
  renderMemoTitlePage,
  renderMemoSections,
} from './service-pdf-helpers.js';

// ─── Public API ────────────────────────────────────────────────────────────

export class PdfService {
  static async generatePaperPdf(
    paperId: string,
    schoolId: string,
  ): Promise<Buffer> {
    const { paper, questions, schoolName } = await loadPaperData(paperId, schoolId);
    const doc = createDocument();

    renderTitlePage(doc, schoolName, paper);
    renderInstructions(doc, paper.instructions);
    renderQuestionSections(doc, paper.sections, questions);

    return finalise(doc);
  }

  static async generateMemoPdf(
    paperId: string,
    schoolId: string,
  ): Promise<Buffer> {
    const { paper, questions, schoolName } = await loadPaperData(paperId, schoolId);
    const doc = createDocument();

    renderMemoTitlePage(doc, schoolName, paper);
    renderMemoSections(doc, paper.sections, questions);

    return finalise(doc);
  }
}

// ─── Data Loading ──────────────────────────────────────────────────────────

interface PaperData {
  paper: ReturnType<typeof AssessmentPaper.prototype.toObject>;
  questions: Map<string, IQuestion>;
  schoolName: string;
}

async function loadPaperData(paperId: string, schoolId: string): Promise<PaperData> {
  const oid = new mongoose.Types.ObjectId(paperId);
  const soid = new mongoose.Types.ObjectId(schoolId);

  const paper = await AssessmentPaper.findOne({
    _id: oid,
    schoolId: soid,
    isDeleted: false,
  })
    .populate([
      { path: 'subjectId', select: 'name' },
      { path: 'gradeId', select: 'name level' },
    ])
    .lean();

  if (!paper) throw new NotFoundError('Assessment paper not found');

  const allQuestions = await collectPaperQuestions(paper.sections);
  const questionsMap = new Map<string, IQuestion>();
  for (const q of allQuestions) {
    questionsMap.set(q._id.toString(), q);
  }

  const school = await School.findOne({ _id: soid, isDeleted: false }).lean();
  const schoolName = school?.name ?? 'School';

  return { paper, questions: questionsMap, schoolName };
}

// ─── Document Helpers ──────────────────────────────────────────────────────

function createDocument(): PDFKit.PDFDocument {
  return new PDFDocument({
    size: 'A4',
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    bufferPages: true,
  });
}

function finalise(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Add page numbers
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.save();
      doc.font('Helvetica').fontSize(8);
      doc.text(
        `Page ${i + 1} of ${pageCount}`,
        MARGIN,
        doc.page.height - 30,
        { width: 595.28 - MARGIN * 2, align: 'center' },
      );
      doc.restore();
    }

    doc.end();
  });
}
