import mongoose from 'mongoose';
import { Question } from './model.js';
import type {
  IQuestion,
  QuestionType,
  CapsLevel,
  IPaperSection,
  IPaperQuestion,
} from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIService } from '../../services/ai.service.js';
import {
  resolveTextbookContextForTopic,
  renderTextbookSourceSection,
} from '../Textbook/service-textbook-context.js';
import {
  resolveLessonContextForTopic,
  renderLessonSourceSection,
} from '../Lesson/service-lesson-context.js';
import type { GeneratePaperInput, PaperQuestionType } from './validation.js';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CognitiveWeighting {
  knowledge: number;
  routine: number;
  complex: number;
  problemSolving: number;
}

interface ParsedGenQuestion {
  stem: string;
  type: QuestionType;
  options: Array<{ label: string; text: string; isCorrect: boolean }>;
  answer: string;
  markingRubric: string;
  marks: number;
  capsLevel: CapsLevel;
}

const CAPS_TO_QUERY: Record<string, CapsLevel> = {
  knowledge: 'knowledge',
  routine: 'routine',
  complex: 'complex',
  problemSolving: 'problem_solving',
};

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

// ─── Question Selection ────────────────────────────────────────────────────

export interface QuestionTypeWeight {
  type: PaperQuestionType;
  weight: number;
}

/**
 * Convert a question-type weighting (percentages summing to ~100) into
 * concrete mark targets per type. Uses largest-remainder rounding so the
 * per-type targets sum to exactly `totalMarks`.
 */
function computeTypeMarkTargets(
  mix: QuestionTypeWeight[],
  totalMarks: number,
): Map<PaperQuestionType, number> {
  const raw = mix.map((m) => ({
    type: m.type,
    exact: (m.weight / 100) * totalMarks,
  }));
  const floored = raw.map((r) => ({ type: r.type, marks: Math.floor(r.exact), rem: r.exact - Math.floor(r.exact) }));
  let assigned = floored.reduce((sum, f) => sum + f.marks, 0);
  const order = [...floored].sort((a, b) => b.rem - a.rem);
  for (const entry of order) {
    if (assigned >= totalMarks) break;
    entry.marks += 1;
    assigned += 1;
  }
  const result = new Map<PaperQuestionType, number>();
  for (const f of floored) result.set(f.type, f.marks);
  return result;
}

export function selectQuestions(
  questions: IQuestion[],
  targetMarks: number,
  weighting: CognitiveWeighting,
  difficulty: string,
  typeMix?: QuestionTypeWeight[],
): IQuestion[] {
  const cognitiveTargets: Record<string, number> = {
    knowledge: Math.round((weighting.knowledge / 100) * targetMarks),
    routine: Math.round((weighting.routine / 100) * targetMarks),
    complex: Math.round((weighting.complex / 100) * targetMarks),
    problemSolving: Math.round((weighting.problemSolving / 100) * targetMarks),
  };

  const sorted = [...questions].sort((a, b) => {
    if (difficulty === 'easy') return a.difficulty - b.difficulty;
    if (difficulty === 'hard') return b.difficulty - a.difficulty;
    return Math.abs(a.difficulty - 3) - Math.abs(b.difficulty - 3);
  });

  const selected: IQuestion[] = [];
  const cognitiveAllocated: Record<string, number> = {
    knowledge: 0, routine: 0, complex: 0, problemSolving: 0,
  };
  const typeAllocated = new Map<string, number>();
  let totalAllocated = 0;

  // Pass 1 — fit both cognitive AND (if supplied) type targets.
  const typeTargets = typeMix ? computeTypeMarkTargets(typeMix, targetMarks) : null;
  for (const q of sorted) {
    if (totalAllocated >= targetMarks) break;
    const capsKey = q.cognitiveLevel.caps === 'problem_solving'
      ? 'problemSolving' : q.cognitiveLevel.caps;
    if (cognitiveAllocated[capsKey] >= (cognitiveTargets[capsKey] ?? 0)) continue;
    if (totalAllocated + q.marks > targetMarks) continue;
    if (typeTargets) {
      const cap = typeTargets.get(q.type as PaperQuestionType);
      if (cap === undefined) continue; // type not in requested mix
      const allocated = typeAllocated.get(q.type) ?? 0;
      if (allocated >= cap) continue;
      typeAllocated.set(q.type, allocated + q.marks);
    }
    selected.push(q);
    cognitiveAllocated[capsKey] += q.marks;
    totalAllocated += q.marks;
  }

  // Pass 2 — top up remaining marks. Respect type caps but ignore cognitive
  // targets that are already saturated.
  for (const q of sorted) {
    if (totalAllocated >= targetMarks) break;
    if (selected.includes(q)) continue;
    if (totalAllocated + q.marks > targetMarks) continue;
    if (typeTargets) {
      const cap = typeTargets.get(q.type as PaperQuestionType);
      if (cap === undefined) continue;
      const allocated = typeAllocated.get(q.type) ?? 0;
      if (allocated >= cap) continue;
      typeAllocated.set(q.type, allocated + q.marks);
    }
    selected.push(q);
    totalAllocated += q.marks;
  }

  return selected;
}

// ─── AI Generation of Missing Questions ────────────────────────────────────

export async function generateMissingQuestions(
  schoolId: string,
  userId: string,
  data: GeneratePaperInput,
  weighting: CognitiveWeighting,
  deficit: number,
  existingQuestions: IQuestion[],
  typeMix?: QuestionTypeWeight[],
): Promise<IQuestion[]> {
  const existingMarks: Record<string, number> = {
    knowledge: 0, routine: 0, complex: 0, problemSolving: 0,
  };
  for (const q of existingQuestions) {
    const key = q.cognitiveLevel.caps === 'problem_solving'
      ? 'problemSolving' : q.cognitiveLevel.caps;
    existingMarks[key] += q.marks;
  }

  // Compute remaining type deficits when a mix was requested, so we can ask
  // the AI for the right blend of new questions.
  let typeDeficits: Array<{ type: PaperQuestionType; marks: number }> | undefined;
  if (typeMix) {
    const targets = computeTypeMarkTargets(typeMix, data.totalMarks);
    const existingByType = new Map<PaperQuestionType, number>();
    for (const q of existingQuestions) {
      const t = q.type as PaperQuestionType;
      existingByType.set(t, (existingByType.get(t) ?? 0) + q.marks);
    }
    typeDeficits = [];
    for (const [type, target] of targets.entries()) {
      const remaining = target - (existingByType.get(type) ?? 0);
      if (remaining > 0) typeDeficits.push({ type, marks: remaining });
    }
    if (typeDeficits.length === 0) typeDeficits = undefined;
  }

  // Topic IDs — Task 2 introduced `topicIds` as the canonical field. The legacy
  // `topicNodeIds` is still in the validation schema (optional) for backward
  // compatibility — callers may pass either. Normalise to a single array here.
  const topicIds = (data.topicIds ?? data.topicNodeIds ?? []) as string[];

  let topicContext = 'General curriculum topic';
  let groundingBlocks = '';
  if (topicIds.length > 0) {
    const node = await CurriculumNode.findOne({
      _id: new mongoose.Types.ObjectId(topicIds[0]),
      isDeleted: false,
    }).lean();
    if (node) topicContext = `${node.title}${node.description ? ` — ${node.description}` : ''}`;

    // Pull the school's textbook section AND the teacher's own finalised
    // lessons for this topic so Claude grounds its questions in actual
    // teaching material rather than its general CAPS knowledge.
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const [textbookCtx, lessonCtx] = await Promise.all([
      resolveTextbookContextForTopic(topicIds[0], schoolOid).catch(() => null),
      resolveLessonContextForTopic(topicIds[0], schoolOid).catch(() => null),
    ]);
    const blocks: string[] = [];
    if (textbookCtx) blocks.push(renderTextbookSourceSection(textbookCtx));
    if (lessonCtx) blocks.push(renderLessonSourceSection(lessonCtx));
    groundingBlocks = blocks.filter(Boolean).join('\n');
  }

  const neededLevels = Object.entries(weighting)
    .filter(([key]) => {
      const target = Math.round((weighting[key as keyof CognitiveWeighting] / 100) * data.totalMarks);
      return existingMarks[key] < target;
    })
    .map(([key, pct]) => {
      const target = Math.round((pct / 100) * data.totalMarks);
      const remaining = target - existingMarks[key];
      return { key, capsLevel: CAPS_TO_QUERY[key] ?? ('routine' as CapsLevel), marks: Math.max(remaining, 0) };
    })
    .filter((l) => l.marks > 0);

  if (neededLevels.length === 0) {
    neededLevels.push({ key: 'routine', capsLevel: 'routine' as CapsLevel, marks: deficit });
  }

  const aiResponse = await callAIForQuestions(
    topicContext, deficit, neededLevels, data.difficulty, typeDeficits, groundingBlocks,
  );
  const parsed = parseGeneratedQuestions(aiResponse);
  if (parsed.length === 0) return [];

  // Build in-memory IQuestion objects WITHOUT persisting to the bank. The
  // organise* functions detect the INLINE_ONLY_TAG and emit them as paper
  // questionText (no Question doc anywhere). The teacher promotes individual
  // ones to the bank via the per-question Save-to-bank button on the paper.
  return buildInlineQuestions(parsed, schoolId, userId, data);
}

async function callAIForQuestions(
  topicContext: string,
  deficit: number,
  neededLevels: Array<{ capsLevel: CapsLevel; marks: number }>,
  difficulty: string,
  typeDeficits?: Array<{ type: PaperQuestionType; marks: number }>,
  groundingBlocks?: string,
): Promise<string> {
  const systemPrompt = [
    'You are an expert assessment question creator for South African CAPS curriculum.',
    'When TEXTBOOK SOURCE or TEACHER LESSON CONTEXT blocks are supplied, anchor your questions to them — use their vocabulary, examples, and emphasis. Where the source is silent you may extend with CAPS-aligned content but never contradict it.',
    'Respond ONLY with a valid JSON array of question objects.',
    'Each object: { "stem": string, "type": "mcq"|"structured"|"short_answer"|"essay"|"calculation", "options": [{label,text,isCorrect}] (4 options for MCQ, empty for others),',
    '"answer": string, "markingRubric": string, "marks": number, "capsLevel": "knowledge"|"routine"|"complex"|"problem_solving" }',
  ].join(' ');

  const levelDetails = neededLevels.map((l) => `${l.capsLevel}: ~${l.marks} marks`).join(', ');
  const typeMixLine = typeDeficits && typeDeficits.length > 0
    ? `Required question-type mix: ${typeDeficits.map((t) => `${t.type} ~${t.marks} marks`).join(', ')}. Honour these targets — don't substitute one type for another.`
    : 'Mix of question types: MCQ (1-2 marks each), structured (3-5 marks), short answer (2-3 marks).';
  const userPromptParts = [
    `Generate questions totalling approximately ${deficit} marks for:`,
    `Topic: ${topicContext}`,
    `Cognitive levels needed: ${levelDetails}`,
    `Difficulty preference: ${difficulty}`,
    typeMixLine,
    `Ensure total marks across all questions is close to ${deficit}.`,
  ];
  // Append grounding blocks AFTER the targets so they're the last thing in
  // the prompt — recency bias keeps Claude leaning on the supplied source.
  if (groundingBlocks && groundingBlocks.trim()) {
    userPromptParts.push('', groundingBlocks);
  }

  return AIService.generateCompletion(systemPrompt, userPromptParts.join('\n'), {
    maxTokens: 4096,
    temperature: 0.7,
  });
}

/**
 * Marker tag attached to in-memory IQuestion-shaped objects produced by
 * the AI generator. The organise* functions inspect this tag to decide
 * whether to write a question as INLINE on the paper (questionText, no
 * questionId, no Question doc anywhere) or as a BANK-REF.
 */
export const INLINE_ONLY_TAG = '__inline_only';

/**
 * Build IQuestion-shaped objects for the AI's parsed output WITHOUT writing
 * them to the Question collection. Generates fresh ObjectIds purely so the
 * objects can be referenced through the rest of the in-memory pipeline
 * (memo builder, section organiser); those ids never land in the bank.
 */
function buildInlineQuestions(
  parsed: ParsedGenQuestion[],
  schoolId: string,
  userId: string,
  data: GeneratePaperInput,
): IQuestion[] {
  const soid = new mongoose.Types.ObjectId(schoolId);
  const uoid = new mongoose.Types.ObjectId(userId);
  const suboid = new mongoose.Types.ObjectId(data.subjectId);
  const groid = new mongoose.Types.ObjectId(data.gradeId);
  const topicIds = (data.topicIds ?? data.topicNodeIds ?? []) as string[];
  const nodeId = topicIds.length > 0
    ? new mongoose.Types.ObjectId(topicIds[0])
    : suboid;

  return parsed.map((q) => ({
    _id: new mongoose.Types.ObjectId(),
    curriculumNodeId: nodeId,
    schoolId: soid,
    subjectId: suboid,
    gradeId: groid,
    type: q.type,
    stem: q.stem,
    media: [],
    options: q.options,
    answer: q.answer,
    markingRubric: q.markingRubric,
    marks: q.marks,
    cognitiveLevel: { caps: q.capsLevel, blooms: capsToDefaultBlooms(q.capsLevel) },
    difficulty: data.difficulty === 'easy' ? 2 : data.difficulty === 'hard' ? 4 : 3,
    tags: [INLINE_ONLY_TAG, 'ai_paper_generation'],
    source: 'ai_generated' as const,
    status: 'draft' as const,
    createdBy: uoid,
  })) as unknown as IQuestion[];
}

export function isInlineOnly(q: IQuestion): boolean {
  return Array.isArray(q.tags) && q.tags.includes(INLINE_ONLY_TAG);
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

// ─── Parse Helpers ─────────────────────────────────────────────────────────

function parseGeneratedQuestions(response: string): ParsedGenQuestion[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed: unknown[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: unknown) => {
      const q = item as Record<string, unknown>;
      const options = Array.isArray(q.options)
        ? (q.options as unknown[]).map((opt: unknown) => {
            const o = opt as Record<string, unknown>;
            return {
              label: typeof o.label === 'string' ? o.label : '',
              text: typeof o.text === 'string' ? o.text : '',
              isCorrect: typeof o.isCorrect === 'boolean' ? o.isCorrect : false,
            };
          })
        : [];

      const validTypes: QuestionType[] = ['mcq', 'structured', 'short_answer', 'essay', 'calculation'];
      const rawType = typeof q.type === 'string' ? q.type : 'structured';
      const type: QuestionType = validTypes.includes(rawType as QuestionType)
        ? (rawType as QuestionType) : 'structured';

      const validCaps: CapsLevel[] = ['knowledge', 'routine', 'complex', 'problem_solving'];
      const rawCaps = typeof q.capsLevel === 'string' ? q.capsLevel : 'routine';
      const capsLevel: CapsLevel = validCaps.includes(rawCaps as CapsLevel)
        ? (rawCaps as CapsLevel) : 'routine';

      return {
        stem: typeof q.stem === 'string' ? q.stem : 'Generated question',
        type, options,
        answer: typeof q.answer === 'string' ? q.answer : '',
        markingRubric: typeof q.markingRubric === 'string' ? q.markingRubric : '',
        marks: typeof q.marks === 'number' && q.marks >= 1 ? q.marks : 2,
        capsLevel,
      };
    });
  } catch {
    return [];
  }
}

function capsToDefaultBlooms(caps: CapsLevel): string {
  const map: Record<CapsLevel, string> = {
    knowledge: 'remember', routine: 'apply', complex: 'analyse', problem_solving: 'evaluate',
  };
  return map[caps];
}
