// src/modules/AITools/service-pdf.ts
import mongoose from 'mongoose';
import { GeneratedPaper } from './model.js';
import { School } from '../School/model.js';
import { NotFoundError } from '../../common/errors.js';
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

export class AIPdfService {
  static async generatePaperPdf(paperId: string, schoolId: string): Promise<Buffer> {
    const { meta, sections } = await loadAndNormalise(paperId, schoolId);
    const doc = createDocument();
    renderTitlePage(doc, meta);
    renderInstructions(doc, meta.instructions);
    renderQuestionSections(doc, sections, { baseDir: DIAGRAM_BASE_DIR, urlPrefix: URL_PREFIX });
    return finalise(doc);
  }

  static async generateMemoPdf(paperId: string, schoolId: string): Promise<Buffer> {
    const { meta, sections } = await loadAndNormalise(paperId, schoolId);
    const doc = createDocument();
    renderMemoTitlePage(doc, meta);
    renderMemoSections(doc, sections, { baseDir: DIAGRAM_BASE_DIR, urlPrefix: URL_PREFIX });
    return finalise(doc);
  }
}

interface LoadResult {
  meta: NormalisedPaperMeta;
  sections: NormalisedSection[];
}

async function loadAndNormalise(paperId: string, schoolId: string): Promise<LoadResult> {
  const oid = new mongoose.Types.ObjectId(paperId);
  const soid = new mongoose.Types.ObjectId(schoolId);

  const paper = await GeneratedPaper.findOne({ _id: oid, schoolId: soid, isDeleted: false }).lean();
  if (!paper) throw new NotFoundError('Generated paper not found');

  const school = await School.findOne({ _id: soid, isDeleted: false }).lean();
  const schoolName = school?.name ?? 'School';

  const meta: NormalisedPaperMeta = {
    schoolName,
    subject: paper.subject,
    gradeLabel: `Grade ${paper.grade}`,
    term: paper.term,
    totalMarks: paper.totalMarks,
    duration: paper.duration,
    paperTypeLabel: paper.topic ? `Topic: ${paper.topic}` : undefined,
    instructions: undefined,
  };

  const sections: NormalisedSection[] = (paper.sections ?? []).map((s) => ({
    title: s.sectionLabel,
    instructions: '',
    questions: normaliseQuestions(s.questions, s.questionType),
  }));

  return { meta, sections };
}

function normaliseQuestions(
  rawQuestions: Array<Record<string, unknown>> | Array<unknown>,
  sectionType: string,
): NormalisedQuestion[] {
  const type = mapType(sectionType);
  return (rawQuestions as Array<Record<string, unknown>>).map((raw) => {
    const diagramRaw = raw.diagram as Record<string, unknown> | null | undefined;
    const diagram: NormalisedDiagram | null = diagramRaw ? {
      svgUrl: (diagramRaw.svgUrl as string | null) ?? null,
      alt: String(diagramRaw.alt ?? ''),
      renderStatus: (diagramRaw.renderStatus as 'pending' | 'rendered' | 'failed') ?? 'pending',
    } : null;

    return {
      number: String(raw.questionNumber ?? ''),
      marks: Number(raw.marks ?? 0),
      stem: String(raw.questionText ?? ''),
      type,
      options: [],
      answer: String(raw.modelAnswer ?? ''),
      markingRubric: String(raw.markingGuideline ?? ''),
      diagram,
    };
  });
}

function mapType(sectionType: string): NormalisedQuestionType {
  const t = sectionType.toLowerCase();
  if (t.includes('multiple choice') || t === 'mcq') return 'mcq';
  if (t.includes('true') || t.includes('false')) return 'true_false';
  if (t.includes('long')) return 'long';
  if (t.includes('structured')) return 'structured';
  return 'short';
}
