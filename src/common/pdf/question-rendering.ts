// src/common/pdf/question-rendering.ts
import {
  CONTENT_WIDTH,
  FONT_TITLE, FONT_NORMAL, FONT_ITALIC,
} from './constants.js';
import { checkPageSpace } from './primitives.js';
import { embedDiagram, type EmbedOptions } from './diagram.js';
import type { NormalisedSection, NormalisedQuestion, NormalisedQuestionOption } from './types.js';

export function renderQuestionSections(
  doc: PDFKit.PDFDocument,
  sections: NormalisedSection[],
  opts: EmbedOptions,
): void {
  for (const section of sections) {
    checkPageSpace(doc, 80);
    doc.font(FONT_TITLE).fontSize(13).text(section.title.toUpperCase());
    doc.moveDown(0.3);

    if (section.instructions) {
      doc.font(FONT_ITALIC).fontSize(9).text(section.instructions, { width: CONTENT_WIDTH });
      doc.moveDown(0.5);
    }

    for (const q of section.questions) {
      checkPageSpace(doc, 60);
      renderQuestion(doc, q, opts);
    }
    doc.moveDown(1);
  }
}

function renderQuestion(
  doc: PDFKit.PDFDocument,
  q: NormalisedQuestion,
  opts: EmbedOptions,
): void {
  doc.font(FONT_TITLE).fontSize(10).text(`Q${q.number}`, { continued: true });
  doc.font(FONT_NORMAL).fontSize(10).text(`  (${q.marks} mark${q.marks !== 1 ? 's' : ''})`);
  doc.moveDown(0.2);
  doc.font(FONT_NORMAL).fontSize(10).text(q.stem, { width: CONTENT_WIDTH - 20, indent: 20 });
  doc.moveDown(0.3);

  if (q.diagram) {
    checkPageSpace(doc, 260);
    // embedDiagram is async (SVG read) but its body is synchronous in practice,
    // so writes land in order. void lets us call it from this sync loop.
    void embedDiagram(doc, q.diagram, opts);
  }

  if (q.type === 'mcq' || q.type === 'true_false') {
    renderOptions(doc, q.options);
  }
  doc.moveDown(0.5);
}

function renderOptions(doc: PDFKit.PDFDocument, options: NormalisedQuestionOption[]): void {
  for (const opt of options) {
    doc.font(FONT_NORMAL).fontSize(10).text(
      `     ${opt.label}.  ${opt.text}`,
      { width: CONTENT_WIDTH - 40 },
    );
  }
}

export function renderMemoSections(
  doc: PDFKit.PDFDocument,
  sections: NormalisedSection[],
  opts: EmbedOptions,
): void {
  const mcqAnswers: Array<{ number: string; answer: string }> = [];

  for (const section of sections) {
    checkPageSpace(doc, 60);
    doc.font(FONT_TITLE).fontSize(13).text(section.title.toUpperCase());
    doc.moveDown(0.5);

    for (const q of section.questions) {
      if (q.type === 'mcq' || q.type === 'true_false') {
        const correct = q.options.find((o) => o.isCorrect);
        const answer = correct?.label ?? q.answer;
        mcqAnswers.push({ number: q.number, answer });
        renderMemoMcq(doc, q, answer);
      } else {
        checkPageSpace(doc, 60);
        renderMemoAnswer(doc, q, opts);
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

function renderMemoMcq(doc: PDFKit.PDFDocument, q: NormalisedQuestion, answer: string): void {
  doc.font(FONT_TITLE).fontSize(10).text(`Q${q.number}`, { continued: true });
  doc.font(FONT_NORMAL).fontSize(10).text(`  (${q.marks})  —  ${answer}`);
  doc.moveDown(0.2);
}

function renderMemoAnswer(
  doc: PDFKit.PDFDocument,
  q: NormalisedQuestion,
  opts: EmbedOptions,
): void {
  doc.font(FONT_TITLE).fontSize(10).text(`Q${q.number}`, { continued: true });
  doc.font(FONT_NORMAL).fontSize(10).text(`  (${q.marks} mark${q.marks !== 1 ? 's' : ''})`);
  doc.moveDown(0.2);

  if (q.diagram) {
    void embedDiagram(doc, q.diagram, opts);
  }

  if (q.answer) {
    doc.font(FONT_TITLE).fontSize(9).text('Answer:', { indent: 15 });
    doc.font(FONT_NORMAL).fontSize(9).text(q.answer, { width: CONTENT_WIDTH - 30, indent: 15 });
    doc.moveDown(0.2);
  }
  if (q.markingRubric) {
    doc.font(FONT_TITLE).fontSize(9).text('Marking Rubric:', { indent: 15 });
    doc.font(FONT_NORMAL).fontSize(9).text(q.markingRubric, { width: CONTENT_WIDTH - 30, indent: 15 });
    doc.moveDown(0.2);
  }
  doc.moveDown(0.3);
}
