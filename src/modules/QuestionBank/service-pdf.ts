// src/modules/QuestionBank/service-pdf.ts
import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import type { IQuestion } from './model.js';
import { School } from '../School/model.js';
import { NotFoundError } from '../../common/errors.js';
import { collectPaperQuestions } from './service-papers-helpers.js';
import { createDocument, finalise } from '../../common/pdf/document.js';
import { renderTitlePage, renderMemoTitlePage, renderInstructions } from '../../common/pdf/primitives.js';
import { renderQuestionSections, renderMemoSections } from '../../common/pdf/question-rendering.js';
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

  static async generateMemoPdf(paperId: string, schoolId: string): Promise<Buffer> {
    const { meta, sections } = await load(paperId, schoolId);
    const doc = createDocument();
    renderMemoTitlePage(doc, meta);
    renderMemoSections(doc, sections, { baseDir: DIAGRAM_BASE_DIR, urlPrefix: URL_PREFIX });
    return finalise(doc);
  }
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

  const sections: NormalisedSection[] = (paper.sections ?? []).map((s) => ({
    title: s.title,
    instructions: s.instructions,
    questions: normaliseQuestions(s.questions, qMap),
  }));

  return { meta, sections };
}

function normaliseQuestions(
  sectionQuestions: Array<{ questionId: unknown; questionNumber: string; marks: number }>,
  qMap: Map<string, IQuestion>,
): NormalisedQuestion[] {
  const result: NormalisedQuestion[] = [];
  for (const pq of sectionQuestions) {
    const qId = resolveQuestionId(pq.questionId);
    const q = qMap.get(qId);
    if (!q) continue;

    const diagram: NormalisedDiagram | null = q.diagram ? {
      svgUrl: q.diagram.svgUrl ?? null,
      alt: q.diagram.alt ?? '',
      renderStatus: q.diagram.renderStatus ?? 'pending',
    } : null;

    result.push({
      number: pq.questionNumber,
      marks: pq.marks,
      stem: q.stem,
      type: mapType(q.type),
      options: (q.options ?? []).map((o) => ({
        label: o.label, text: o.text, isCorrect: o.isCorrect,
      })),
      answer: q.answer ?? '',
      markingRubric: q.markingRubric ?? '',
      diagram,
    });
  }
  return result;
}

function mapType(t: string): NormalisedQuestionType {
  if (t === 'mcq') return 'mcq';
  if (t === 'true_false') return 'true_false';
  if (t === 'long') return 'long';
  if (t === 'structured') return 'structured';
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
