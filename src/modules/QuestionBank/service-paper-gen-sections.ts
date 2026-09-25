// src/modules/QuestionBank/service-paper-gen-sections.ts
//
// From generated or picked questions to paper questions and sections. Moved
// unchanged from service-paper-gen-helpers.ts (a pure move, to stay under
// 350 lines); service-paper-gen-helpers.ts re-exports it.
import mongoose from 'mongoose';
import type { CapsLevel, IPaperQuestion, IPaperSection, IQuestion, QuestionType } from './model.js';

const SECTION_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple Choice',
  true_false: 'True or False',
  short_answer: 'Short Answer',
  structured: 'Structured Questions',
  essay: 'Essay Questions',
  match: 'Matching',
  fill_blank: 'Fill in the Blank',
  calculation: 'Calculations',
  diagram_label: 'Diagram Labelling',
  case_study: 'Case Study',
};

/**
 * Marker tag attached to in-memory IQuestion-shaped objects produced by
 * the AI generator. The organise* functions inspect this tag to decide
 * whether to write a question as INLINE on the paper (questionText, no
 * questionId, no Question doc anywhere) or as a BANK-REF.
 */
export const INLINE_ONLY_TAG = '__inline_only';

export function isInlineOnly(q: IQuestion): boolean {
  return Array.isArray(q.tags) && q.tags.includes(INLINE_ONLY_TAG);
}

/** An AI-written question is about the topic its prompt described (topicIds[0]); never the Subject-id fallback. */
function generatorTags(q: IQuestion): Pick<IPaperQuestion, 'curriculumNodeId' | 'capsLevel' | 'tagFrom'> {
  const node = q.curriculumNodeId && String(q.curriculumNodeId) !== String(q.subjectId)
    ? (q.curriculumNodeId as mongoose.Types.ObjectId)
    : null;
  const level = q.cognitiveLevel?.caps ?? null;
  return { curriculumNodeId: node, capsLevel: level, tagFrom: node || level ? 'generator' : null };
}

/**
 * Build the IPaperQuestion sub-doc from a source question. Inline-tagged
 * questions become INLINE on the paper (no questionId — the bank doesn't
 * know about them); plain bank questions become BANK-REF (questionId set,
 * downstream features like usage tracking can follow them).
 */
export function toPaperQuestion(q: IQuestion, position: number): IPaperQuestion {
  const inline = isInlineOnly(q);
  return {
    questionId: inline ? null : (q._id as mongoose.Types.ObjectId),
    questionText: q.stem,
    options: q.options ?? [],
    marks: q.marks,
    position,
    modelAnswer: q.answer ?? null,
    markingGuideline: q.markingRubric ?? null,
    diagram: null,
    ...(inline ? generatorTags(q) : {}),
  };
}

// ─── Section Organisation ──────────────────────────────────────────────────

export function organiseSections(questions: IQuestion[]): IPaperSection[] {
  const groups = new Map<QuestionType, IQuestion[]>();
  for (const q of questions) {
    const existing = groups.get(q.type);
    if (existing) existing.push(q);
    else groups.set(q.type, [q]);
  }

  const sections: IPaperSection[] = [];
  let sectionIndex = 1;
  const sectionLetter = (idx: number) => String.fromCharCode(64 + idx);

  for (const [type, qs] of groups) {
    const label = SECTION_LABELS[type] ?? type.replace(/_/g, ' ');
    const sectionQuestions: IPaperQuestion[] = qs.map((q, i) => toPaperQuestion(q, i));

    sections.push({
      title: `Section ${sectionLetter(sectionIndex)}: ${label}`,
      instructions: getSectionInstructions(type, qs.length),
      order: sectionIndex - 1,
      questions: sectionQuestions,
    });
    sectionIndex++;
  }

  return sections;
}

function getSectionInstructions(type: QuestionType, count: number): string {
  switch (type) {
    case 'mcq': return `Answer ALL ${count} questions. Choose the correct answer (A, B, C or D).`;
    case 'true_false': return `Indicate whether the following ${count} statements are TRUE or FALSE.`;
    case 'short_answer': return `Answer ALL ${count} questions in the space provided.`;
    case 'structured': return `Answer ALL ${count} questions. Show all working where applicable.`;
    case 'essay': return `Answer the following essay question(s). Pay attention to structure and content.`;
    case 'calculation': return `Answer ALL questions. Show ALL calculations clearly.`;
    default: return `Answer ALL ${count} questions.`;
  }
}

export function capsToDefaultBlooms(caps: CapsLevel): string {
  const map: Record<CapsLevel, string> = {
    knowledge: 'remember', routine: 'apply', complex: 'analyse', problem_solving: 'evaluate',
  };
  return map[caps];
}
