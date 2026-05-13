// src/modules/QuestionBank/service-pdf.ts
import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import type { IQuestion, IPaperQuestion } from './model.js';
import { School } from '../School/model.js';
import { NotFoundError } from '../../common/errors.js';
import { collectPaperQuestions } from './service-papers-helpers.js';
import { createDocument, finalise } from '../../common/pdf/document.js';
import { renderTitlePage, renderInstructions } from '../../common/pdf/primitives.js';
import { renderQuestionSections } from '../../common/pdf/question-rendering.js';
import type {
  NormalisedPaperMeta, NormalisedSection, NormalisedQuestion,
  NormalisedDiagram, NormalisedQuestionType,
} from '../../common/pdf/types.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const URL_PREFIX = '/uploads/diagrams';
const DIAGRAM_BASE_DIR = `${UPLOAD_DIR}/diagrams`;

export class PdfService {
  static async generatePaperPdf(paperId: string, schoolId: string): Promise<Buffer> {
    const { meta, sections } = await load(paperId, schoolId);
    const doc = createDocument();
    renderTitlePage(doc, meta);
    renderInstructions(doc, meta.instructions);
    renderQuestionSections(doc, sections, { baseDir: DIAGRAM_BASE_DIR, urlPrefix: URL_PREFIX });
    return finalise(doc);
  }
  // Memo PDF generation lives in service-memo-pdf.ts (Task 8). The legacy
  // PdfService.generateMemoPdf method that operated on paper rubric data
  // was removed in Task 12 — the canonical replacement consumes IPaperMemo
  // and is the single source of truth.
}

async function load(
  paperId: string,
  schoolId: string,
): Promise<{ meta: NormalisedPaperMeta; sections: NormalisedSection[] }> {
  const oid = new mongoose.Types.ObjectId(paperId);
  const soid = new mongoose.Types.ObjectId(schoolId);

  const paper = await AssessmentPaper.findOne({
    _id: oid, schoolId: soid, isDeleted: false,
  })
    .populate([
      { path: 'subjectId', select: 'name' },
      { path: 'gradeId', select: 'name level' },
    ])
    .lean();

  if (!paper) throw new NotFoundError('Assessment paper not found');

  const allQuestions = await collectPaperQuestions(paper.sections, schoolId);
  const qMap = new Map<string, IQuestion>();
  for (const q of allQuestions) qMap.set(q._id.toString(), q);

  const school = await School.findOne({ _id: soid, isDeleted: false }).lean();

  const meta: NormalisedPaperMeta = {
    schoolName: school?.name ?? 'School',
    subject: getRefName(paper.subjectId),
    gradeLabel: getRefName(paper.gradeId),
    term: (paper.term as number | string) ?? '',
    year: paper.year as number | string | undefined,
    totalMarks: paper.totalMarks ?? 0,
    duration: paper.duration ?? 0,
    paperTypeLabel: formatPaperType(paper.paperType),
    instructions: paper.instructions,
  };

  const sections: NormalisedSection[] = (paper.sections ?? []).map((s, sectionIdx) => ({
    title: s.title,
    instructions: s.instructions,
    questions: normaliseQuestions(s.questions, qMap, sectionIdx),
  }));

  return { meta, sections };
}

function normaliseQuestions(
  sectionQuestions: IPaperQuestion[],
  qMap: Map<string, IQuestion>,
  sectionIdx: number,
): NormalisedQuestion[] {
  const result: NormalisedQuestion[] = [];
  // Sort by position so display order matches stored order even if the
  // array was persisted out-of-order.
  const ordered = [...sectionQuestions].sort((a, b) => a.position - b.position);
  for (const pq of ordered) {
    // Display label: section + position (1-indexed). Matches Task 1 spec.
    const number = `${sectionIdx + 1}.${pq.position + 1}`;

    // Bank-ref question: pull stem/options/answer/diagram from the bank.
    if (pq.questionId) {
      const qId = resolveQuestionId(pq.questionId);
      const q = qMap.get(qId);
      const stem = q?.stem ?? pq.questionText ?? '';
      if (!stem) continue;

      const diagram: NormalisedDiagram | null = pickDiagram(pq, q ?? null);

      const options = (q?.options?.length ? q.options : pq.options ?? []).map((o) => ({
        label: o.label,
        text: o.text,
        isCorrect: o.isCorrect,
      }));

      result.push({
        number,
        marks: pq.marks,
        stem,
        type: q ? mapType(q.type) : options.length > 0 ? 'mcq' : 'short',
        options,
        answer: pq.modelAnswer ?? q?.answer ?? '',
        markingRubric: pq.markingGuideline ?? q?.markingRubric ?? '',
        diagram,
      });
      continue;
    }

    // Inline question: questionText/modelAnswer/markingGuideline are
    // authoritative; no bank lookup. Skip if neither id nor text is set
    // (defensive — schema XOR refinement should have prevented this).
    if (!pq.questionText) continue;

    result.push({
      number,
      marks: pq.marks,
      stem: pq.questionText,
      type: 'short',
      options: (pq.options ?? []).map((o) => ({
        label: o.label,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
      answer: pq.modelAnswer ?? '',
      markingRubric: pq.markingGuideline ?? '',
      diagram: pickDiagram(pq, null),
    });
  }
  return result;
}

// Prefer the paper-question's own diagram override (caption) over the
// bank diagram (alt). Either may be absent.
function pickDiagram(
  pq: IPaperQuestion,
  bankQuestion: IQuestion | null,
): NormalisedDiagram | null {
  if (pq.diagram) {
    return {
      svgUrl: pq.diagram.svgUrl ?? null,
      alt: pq.diagram.caption ?? '',
      renderStatus: pq.diagram.renderStatus ?? 'pending',
    };
  }
  if (bankQuestion?.diagram) {
    return {
      svgUrl: bankQuestion.diagram.svgUrl ?? null,
      alt: bankQuestion.diagram.alt ?? '',
      renderStatus: bankQuestion.diagram.renderStatus ?? 'pending',
    };
  }
  return null;
}

function mapType(t: string): NormalisedQuestionType {
  if (t === 'mcq') return 'mcq';
  if (t === 'true_false') return 'true_false';
  if (t === 'long' || t === 'essay') return 'long';
  if (t === 'structured' || t === 'calculation') return 'structured';
  // short_answer + anything else falls through to 'short'.
  return 'short';
}

function resolveQuestionId(questionId: unknown): string {
  if (questionId && typeof questionId === 'object' && questionId !== null) {
    return String((questionId as { _id?: unknown })._id ?? questionId);
  }
  return String(questionId);
}

function getRefName(ref: unknown): string {
  if (ref && typeof ref === 'object' && 'name' in ref) {
    return String((ref as { name?: unknown }).name ?? '');
  }
  return String(ref ?? '');
}

function formatPaperType(paperType: unknown): string {
  return String(paperType ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
