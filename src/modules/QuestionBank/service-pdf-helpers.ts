import type { IQuestion, IQuestionOption } from './model.js';

// ─── Constants ─────────────────────────────────────────────────────────────

const MARGIN = 50;
const PAGE_WIDTH = 595.28;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FONT_TITLE = 'Helvetica-Bold';
const FONT_NORMAL = 'Helvetica';
const FONT_ITALIC = 'Helvetica-Oblique';

export { MARGIN, PAGE_WIDTH, CONTENT_WIDTH, FONT_TITLE, FONT_NORMAL, FONT_ITALIC };

// ─── Common Helpers ────────────────────────────────────────────────────────

interface PopulatedRef {
  name?: string;
  level?: number;
}

export function getRefName(ref: unknown): string {
  if (ref && typeof ref === 'object' && 'name' in ref) {
    return (ref as PopulatedRef).name ?? '';
  }
  return String(ref ?? '');
}

export function checkPageSpace(doc: PDFKit.PDFDocument, needed: number): void {
  if (doc.y + needed > doc.page.height - MARGIN - 30) {
    doc.addPage();
  }
}

// ─── Paper Rendering ───────────────────────────────────────────────────────

export function renderTitlePage(
  doc: PDFKit.PDFDocument,
  schoolName: string,
  paper: Record<string, unknown>,
): void {
  doc.moveDown(4);
  doc.font(FONT_TITLE).fontSize(22).text(schoolName, { align: 'center' });
  doc.moveDown(1.5);

  doc.font(FONT_TITLE).fontSize(16).text(getRefName(paper.subjectId), { align: 'center' });
  doc.moveDown(0.5);

  doc.font(FONT_NORMAL).fontSize(13).text(getRefName(paper.gradeId), { align: 'center' });
  doc.font(FONT_NORMAL).fontSize(13).text(
    `Term ${paper.term ?? ''} — ${paper.year ?? ''}`,
    { align: 'center' },
  );
  doc.moveDown(1);

  const paperTypeLabel = String(paper.paperType ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  doc.font(FONT_TITLE).fontSize(14).text(paperTypeLabel, { align: 'center' });
  doc.moveDown(2);

  doc.font(FONT_NORMAL).fontSize(11);
  doc.text(`Total Marks: ${paper.totalMarks ?? 0}`, { align: 'center' });
  doc.text(`Time: ${paper.duration ?? 0} minutes`, { align: 'center' });
  doc.moveDown(1);
  doc.moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y).stroke();
  doc.moveDown(1);
}

export function renderInstructions(doc: PDFKit.PDFDocument, instructions: string): void {
  if (!instructions) return;
  doc.font(FONT_TITLE).fontSize(12).text('INSTRUCTIONS', { underline: true });
  doc.moveDown(0.3);
  doc.font(FONT_NORMAL).fontSize(10).text(instructions, { width: CONTENT_WIDTH });
  doc.moveDown(1);
  doc.moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y).stroke();
  doc.moveDown(1);
}

interface SectionQuestion {
  questionId: unknown;
  questionNumber: string;
  marks: number;
}

export function renderQuestionSections(
  doc: PDFKit.PDFDocument,
  sections: Array<{ title: string; instructions: string; questions: SectionQuestion[] }>,
  questions: Map<string, IQuestion>,
): void {
  for (const section of sections) {
    checkPageSpace(doc, 80);
    doc.font(FONT_TITLE).fontSize(13).text(section.title.toUpperCase());
    doc.moveDown(0.3);

    if (section.instructions) {
      doc.font(FONT_ITALIC).fontSize(9).text(section.instructions, { width: CONTENT_WIDTH });
      doc.moveDown(0.5);
    }

    for (const pq of section.questions) {
      const qId = resolveQuestionId(pq.questionId);
      const question = questions.get(qId);
      if (!question) continue;

      checkPageSpace(doc, 50);
      renderQuestion(doc, pq.questionNumber, pq.marks, question);
    }
    doc.moveDown(1);
  }
}

function renderQuestion(
  doc: PDFKit.PDFDocument,
  number: string,
  marks: number,
  question: IQuestion,
): void {
  doc.font(FONT_TITLE).fontSize(10).text(`Q${number}`, { continued: true });
  doc.font(FONT_NORMAL).fontSize(10).text(`  (${marks} mark${marks !== 1 ? 's' : ''})`, { continued: false });
  doc.moveDown(0.2);
  doc.font(FONT_NORMAL).fontSize(10).text(question.stem, { width: CONTENT_WIDTH - 20, indent: 20 });
  doc.moveDown(0.3);

  if (question.type === 'mcq' || question.type === 'true_false') {
    renderOptions(doc, question.options);
  }
  doc.moveDown(0.5);
}

function renderOptions(doc: PDFKit.PDFDocument, options: IQuestionOption[]): void {
  for (const opt of options) {
    doc.font(FONT_NORMAL).fontSize(10).text(
      `     ${opt.label}.  ${opt.text}`,
      { width: CONTENT_WIDTH - 40 },
    );
  }
}

// ─── Memo Rendering ────────────────────────────────────────────────────────

export function renderMemoTitlePage(
  doc: PDFKit.PDFDocument,
  schoolName: string,
  paper: Record<string, unknown>,
): void {
  doc.moveDown(4);
  doc.font(FONT_TITLE).fontSize(22).text(schoolName, { align: 'center' });
  doc.moveDown(1);
  doc.font(FONT_TITLE).fontSize(20).text('MEMORANDUM', { align: 'center' });
  doc.moveDown(1);

  doc.font(FONT_TITLE).fontSize(14).text(getRefName(paper.subjectId), { align: 'center' });
  doc.moveDown(0.5);
  doc.font(FONT_NORMAL).fontSize(12).text(getRefName(paper.gradeId), { align: 'center' });
  doc.font(FONT_NORMAL).fontSize(12).text(
    `Term ${paper.term ?? ''} — ${paper.year ?? ''}`,
    { align: 'center' },
  );
  doc.moveDown(0.5);
  doc.font(FONT_NORMAL).fontSize(11).text(`Total Marks: ${paper.totalMarks ?? 0}`, { align: 'center' });
  doc.moveDown(1.5);
  doc.moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y).stroke();
  doc.moveDown(1);
}

export function renderMemoSections(
  doc: PDFKit.PDFDocument,
  sections: Array<{ title: string; questions: SectionQuestion[] }>,
  questions: Map<string, IQuestion>,
): void {
  const mcqAnswers: Array<{ number: string; answer: string }> = [];

  for (const section of sections) {
    checkPageSpace(doc, 60);
    doc.font(FONT_TITLE).fontSize(13).text(section.title.toUpperCase());
    doc.moveDown(0.5);

    for (const pq of section.questions) {
      const qId = resolveQuestionId(pq.questionId);
      const question = questions.get(qId);
      if (!question) continue;

      if (question.type === 'mcq' || question.type === 'true_false') {
        const correct = question.options.find((o) => o.isCorrect);
        const answer = correct?.label ?? question.answer;
        mcqAnswers.push({ number: pq.questionNumber, answer });
        renderMemoMcq(doc, pq.questionNumber, pq.marks, answer);
      } else {
        checkPageSpace(doc, 50);
        renderMemoAnswer(doc, pq.questionNumber, pq.marks, question);
      }
    }
    doc.moveDown(1);
  }

  if (mcqAnswers.length > 0) {
    checkPageSpace(doc, 40 + mcqAnswers.length * 14);
    doc.moveDown(1);
    doc.font(FONT_TITLE).fontSize(12).text('MCQ ANSWER GRID');
    doc.moveDown(0.3);
    const gridText = mcqAnswers.map((a) => `Q${a.number}: ${a.answer}`).join('   |   ');
    doc.font(FONT_NORMAL).fontSize(10).text(gridText, { width: CONTENT_WIDTH });
  }
}

function renderMemoMcq(
  doc: PDFKit.PDFDocument,
  number: string,
  marks: number,
  answer: string,
): void {
  doc.font(FONT_TITLE).fontSize(10).text(`Q${number}`, { continued: true });
  doc.font(FONT_NORMAL).fontSize(10).text(`  (${marks})  —  ${answer}`);
  doc.moveDown(0.2);
}

function renderMemoAnswer(
  doc: PDFKit.PDFDocument,
  number: string,
  marks: number,
  question: IQuestion,
): void {
  doc.font(FONT_TITLE).fontSize(10).text(`Q${number}`, { continued: true });
  doc.font(FONT_NORMAL).fontSize(10).text(`  (${marks} mark${marks !== 1 ? 's' : ''})`);
  doc.moveDown(0.2);

  if (question.answer) {
    doc.font(FONT_TITLE).fontSize(9).text('Answer:', { indent: 15 });
    doc.font(FONT_NORMAL).fontSize(9).text(question.answer, { width: CONTENT_WIDTH - 30, indent: 15 });
    doc.moveDown(0.2);
  }

  if (question.markingRubric) {
    doc.font(FONT_TITLE).fontSize(9).text('Marking Rubric:', { indent: 15 });
    doc.font(FONT_NORMAL).fontSize(9).text(question.markingRubric, { width: CONTENT_WIDTH - 30, indent: 15 });
    doc.moveDown(0.2);
  }
  doc.moveDown(0.3);
}

// ─── Utility ──────────────────────────────────────────────────────────────

function resolveQuestionId(questionId: unknown): string {
  if (questionId && typeof questionId === 'object' && questionId !== null) {
    return String((questionId as { _id?: unknown })._id ?? questionId);
  }
  return String(questionId);
}
