// src/modules/QuestionBank/service-memo-pdf.ts
//
// Programmatic memo PDF generator. Renders the actual IPaperMemo shape
// (sectionTitle / answers / markAllocation with criterion+marks,
// commonMistakes, acceptableAlternatives) against an IAssessmentPaper
// for question text lookup. Reuses the common pdf primitives.

import type { IAssessmentPaper, IPaperSection, IPaperQuestion } from './model.js';
import type {
  IPaperMemo, IMemoSection, IMemoAnswer,
} from '../TeacherWorkbench/model.assessment.js';
import type { ISchool } from '../School/model.js';
import { createDocument, finalise } from '../../common/pdf/document.js';
import {
  MARGIN, PAGE_WIDTH, CONTENT_WIDTH,
  FONT_TITLE, FONT_NORMAL, FONT_ITALIC,
} from '../../common/pdf/constants.js';
import { checkPageSpace } from '../../common/pdf/primitives.js';

const GRAY = '#666666';
const BLACK = '#000000';

// ─── Public API ───────────────────────────────────────────────────────────────

export type PaperForMemoPdf = Pick<
  IAssessmentPaper,
  'title' | 'term' | 'year' | 'totalMarks' | 'duration' | 'sections'
> & {
  subjectId: unknown;
  gradeId: unknown;
};

export type MemoForMemoPdf = Pick<IPaperMemo, 'sections' | 'totalMarks'>;

export type SchoolForMemoPdf = Pick<ISchool, 'name'>;

export async function generateMemoPdf(
  paper: PaperForMemoPdf,
  memo: MemoForMemoPdf,
  school: SchoolForMemoPdf,
): Promise<Buffer> {
  const doc = createDocument();

  renderHeader(doc, school.name);
  renderTitleAndMeta(doc, paper);

  const orderedPaperSections = [...(paper.sections ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  for (let sIdx = 0; sIdx < memo.sections.length; sIdx++) {
    const memoSection = memo.sections[sIdx];
    const paperSection = orderedPaperSections[sIdx];
    renderMemoSection(doc, memoSection, paperSection);
  }

  return finalise(doc);
}

// ─── Header / Title / Meta ────────────────────────────────────────────────────

function renderHeader(doc: PDFKit.PDFDocument, schoolName: string): void {
  doc.fillColor(BLACK).font(FONT_TITLE).fontSize(14).text(schoolName);
  doc.moveDown(0.2);
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_WIDTH - MARGIN, doc.y)
    .strokeColor(GRAY)
    .stroke();
  doc.moveDown(0.6);
}

function renderTitleAndMeta(
  doc: PDFKit.PDFDocument,
  paper: PaperForMemoPdf,
): void {
  doc
    .font(FONT_TITLE)
    .fontSize(16)
    .fillColor(BLACK)
    .text(`MEMORANDUM — ${paper.title}`, { width: CONTENT_WIDTH });

  const subjectName = getRefName(paper.subjectId);
  const gradeName = getRefName(paper.gradeId);

  const meta = [
    subjectName,
    gradeName,
    `Term ${paper.term}`,
    String(paper.year),
    `${paper.totalMarks} marks`,
    `${paper.duration} min`,
    formatLocalDate(new Date()),
  ]
    .filter((s) => s.length > 0)
    .join('  \u2022  ');

  doc.font(FONT_NORMAL).fontSize(10).fillColor(GRAY).text(meta, {
    width: CONTENT_WIDTH,
  });
  doc.moveDown(1);
}

// ─── Sections / Answers ───────────────────────────────────────────────────────

function renderMemoSection(
  doc: PDFKit.PDFDocument,
  section: IMemoSection,
  paperSection: IPaperSection | undefined,
): void {
  checkPageSpace(doc, 60);
  doc
    .font(FONT_TITLE)
    .fontSize(13)
    .fillColor(BLACK)
    .text(section.sectionTitle, { width: CONTENT_WIDTH });
  doc.moveDown(0.3);

  for (const answer of section.answers) {
    renderMemoAnswer(doc, answer, paperSection);
  }
  doc.moveDown(0.4);
}

function renderMemoAnswer(
  doc: PDFKit.PDFDocument,
  answer: IMemoAnswer,
  paperSection: IPaperSection | undefined,
): void {
  checkPageSpace(doc, 80);

  const questionText = lookupPaperQuestionText(answer.questionNumber, paperSection);
  const totalMarks = (answer.markAllocation ?? []).reduce(
    (sum, m) => sum + (m.marks ?? 0),
    0,
  );

  // Heading: number, paper question text, total marks
  const headingSuffix = questionText ? `  ${questionText}` : '';
  doc
    .font(FONT_TITLE)
    .fontSize(11)
    .fillColor(BLACK)
    .text(`${answer.questionNumber}.${headingSuffix}  [${totalMarks}]`, {
      width: CONTENT_WIDTH,
    });
  doc.moveDown(0.15);

  // Expected answer
  doc
    .font(FONT_TITLE)
    .fontSize(10)
    .fillColor(BLACK)
    .text('Answer: ', { continued: true });
  doc
    .font(FONT_NORMAL)
    .fontSize(11)
    .fillColor(BLACK)
    .text(answer.expectedAnswer, { width: CONTENT_WIDTH });
  doc.moveDown(0.2);

  // Mark allocation
  for (const m of answer.markAllocation ?? []) {
    doc
      .font(FONT_NORMAL)
      .fontSize(10)
      .fillColor(BLACK)
      .text(`  \u2022  ${m.criterion}  [${m.marks}]`, {
        width: CONTENT_WIDTH,
      });
  }

  if (answer.commonMistakes && answer.commonMistakes.length > 0) {
    doc.moveDown(0.2);
    doc
      .font(FONT_ITALIC)
      .fontSize(9)
      .fillColor(GRAY)
      .text('Common mistakes:', { width: CONTENT_WIDTH });
    for (const cm of answer.commonMistakes) {
      doc
        .font(FONT_NORMAL)
        .fontSize(9)
        .fillColor(GRAY)
        .text(`  \u2022  ${cm}`, { width: CONTENT_WIDTH });
    }
  }

  if (answer.acceptableAlternatives && answer.acceptableAlternatives.length > 0) {
    doc.moveDown(0.2);
    doc
      .font(FONT_ITALIC)
      .fontSize(9)
      .fillColor(GRAY)
      .text('Acceptable alternatives:', { width: CONTENT_WIDTH });
    for (const aa of answer.acceptableAlternatives) {
      doc
        .font(FONT_NORMAL)
        .fontSize(9)
        .fillColor(GRAY)
        .text(`  \u2022  ${aa}`, { width: CONTENT_WIDTH });
    }
  }

  doc.fillColor(BLACK);
  doc.moveDown(0.5);
}

// ─── Lookup / Helpers ─────────────────────────────────────────────────────────

// Memo questionNumber is "S.P" (1-indexed); paper question.position is
// 0-indexed within its section. We derive the position from the trailing
// segment.
function lookupPaperQuestionText(
  questionNumber: string,
  paperSection: IPaperSection | undefined,
): string {
  if (!paperSection) return '';
  const tail = questionNumber.split('.').pop() ?? '';
  const oneIndexed = Number(tail);
  if (!Number.isFinite(oneIndexed) || oneIndexed <= 0) return '';
  const position = oneIndexed - 1;
  const pq: IPaperQuestion | undefined = paperSection.questions.find(
    (q) => q.position === position,
  );
  return pq?.questionText ?? '';
}

function getRefName(ref: unknown): string {
  if (ref && typeof ref === 'object' && 'name' in ref) {
    const value = (ref as { name?: unknown }).name;
    return typeof value === 'string' ? value : String(value ?? '');
  }
  return '';
}

// Local-TZ date formatting. `toISOString()` is UTC and can be off by a
// day for users in positive UTC offsets near midnight.
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
