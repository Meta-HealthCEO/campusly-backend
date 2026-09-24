// src/modules/Course/item-edits.ts
//
// What a teacher may change in a unit item, checked in plain words, and the
// wording of the AI rewrite actions (easier, harder, shorter, simpler words,
// translate, regenerate).

import { BadRequestError } from '../../common/errors.js';

export const REWRITE_ACTIONS = ['regenerate', 'easier', 'harder', 'shorter', 'simpler_words', 'translate'] as const;
export type RewriteAction = (typeof REWRITE_ACTIONS)[number];

/** The most-used South African home languages after English. */
export const TRANSLATE_LANGUAGES: Record<string, string> = {
  af: 'Afrikaans',
  zu: 'isiZulu',
  xh: 'isiXhosa',
  st: 'Sesotho',
  tn: 'Setswana',
};

export const MAX_QUESTIONS = 8;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;
const MAX_STEPS = 12;
const LABELS = 'ABCDE';

/** The instruction an AI rewrite follows. */
export function rewriteInstruction(action: RewriteAction, ctx: { gradeName: string; language?: string }): string {
  switch (action) {
    case 'regenerate':
      return `Write this again from scratch for ${ctx.gradeName}, covering the same ideas in a fresh way.`;
    case 'easier':
      return `Make this easier for ${ctx.gradeName} learners who are struggling: smaller steps, simpler numbers and more examples.`;
    case 'harder':
      return `Make this harder for ${ctx.gradeName} learners who are ready for a challenge, still within the same CAPS topic.`;
    case 'shorter':
      return 'Make this shorter: keep only what a learner needs, in fewer words.';
    case 'simpler_words':
      return `Rewrite this in simpler words for ${ctx.gradeName}: short sentences and everyday words, the same ideas.`;
    case 'translate': {
      const language = ctx.language ? TRANSLATE_LANGUAGES[ctx.language] : undefined;
      if (!language) throw new BadRequestError('Pick a language to translate into');
      return `Translate this into ${language} for ${ctx.gradeName} learners. Keep numbers and maths notation as they are.`;
    }
    default:
      throw new BadRequestError('Pick a rewrite');
  }
}

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export interface NotesBlockEdit { blockId: string; type: 'text'; content: string }

/** Notes are text blocks; at least one must say something. */
export function checkNotesEdit(blocks: Array<{ blockId: string; type: string; content: unknown }>): NotesBlockEdit[] {
  const kept = blocks
    .filter((b) => b.type === 'text')
    .map((b) => ({ blockId: b.blockId, type: 'text' as const, content: text(b.content) }))
    .filter((b) => b.content.length > 0);
  if (kept.length === 0) throw new BadRequestError('The notes are empty. Add some text.');
  return kept;
}

/** A worked example is 1 to 12 steps, each with a title or some content. */
export function checkStepsEdit(steps: Array<{ title: unknown; content: unknown }>): Array<{ title: string; content: string }> {
  const kept = steps
    .map((s) => ({ title: text(s.title), content: text(s.content) }))
    .filter((s) => s.title || s.content);
  if (kept.length === 0) throw new BadRequestError('A worked example needs at least one step.');
  if (kept.length > MAX_STEPS) throw new BadRequestError(`A worked example has at most ${MAX_STEPS} steps.`);
  return kept;
}

export interface QuestionEdit {
  /** The question this was, when the teacher edited an existing one. */
  id?: string;
  stem: string;
  options: Array<{ label: string; text: string; isCorrect: boolean }>;
}

/** Quick checks are marked by the chosen option: every question needs choices and exactly one right answer. */
export function checkQuestionsEdit(questions: Array<{ id?: unknown; stem: unknown; options: Array<{ text: unknown; isCorrect: unknown }> }>): QuestionEdit[] {
  if (questions.length === 0) throw new BadRequestError('Add at least one question.');
  if (questions.length > MAX_QUESTIONS) throw new BadRequestError(`A quick check has at most ${MAX_QUESTIONS} questions.`);
  return questions.map((q, i) => {
    const n = i + 1;
    const stem = text(q.stem);
    if (!stem) throw new BadRequestError(`Question ${n} needs a question.`);
    const options = (q.options ?? []).map((o) => ({ text: text(o.text), isCorrect: o.isCorrect === true }));
    if (options.length < MIN_OPTIONS) throw new BadRequestError(`Question ${n} needs at least ${MIN_OPTIONS} answer choices.`);
    if (options.length > MAX_OPTIONS) throw new BadRequestError(`Question ${n} has more than ${MAX_OPTIONS} answer choices.`);
    if (options.some((o) => !o.text)) throw new BadRequestError(`Question ${n} has an empty answer choice.`);
    if (options.filter((o) => o.isCorrect).length !== 1) throw new BadRequestError(`Question ${n} needs exactly one right answer.`);
    const id = typeof q.id === 'string' && q.id ? q.id : undefined;
    return { ...(id ? { id } : {}), stem, options: options.map((o, j) => ({ label: LABELS[j], text: o.text, isCorrect: o.isCorrect })) };
  });
}

/** A content block as stored: the editor changes only text and steps, and every other field rides along. */
export interface StoredBlock {
  blockId: string;
  type: string;
  order: number;
  content: string;
  [key: string]: unknown;
}

const renumber = (blocks: StoredBlock[]): StoredBlock[] => blocks.map((b, i) => ({ ...b, order: i }));

/**
 * The notes with the teacher's text edits applied. Text blocks they kept are
 * updated in place, text blocks they removed go, and a new text block goes
 * right after the one before it. Diagrams and practice blocks, which the
 * editor doesn't show, stay where they were.
 */
export function mergeNotesBlocks(existing: StoredBlock[], edited: NotesBlockEdit[]): StoredBlock[] {
  const textIds = new Set(existing.filter((b) => b.type === 'text').map((b) => b.blockId));
  const byId = new Map(edited.filter((e) => textIds.has(e.blockId)).map((e) => [e.blockId, e]));
  const merged: StoredBlock[] = [];
  for (const block of existing) {
    if (block.type !== 'text') merged.push(block);
    else if (byId.has(block.blockId)) merged.push({ ...block, content: byId.get(block.blockId)!.content });
  }
  let anchor: string | null = null;
  for (const e of edited) {
    if (!byId.has(e.blockId)) {
      const at = anchor === null ? 0 : merged.findIndex((b) => b.blockId === anchor) + 1;
      merged.splice(at, 0, { blockId: e.blockId, type: 'text', order: 0, content: e.content });
    }
    anchor = e.blockId;
  }
  return renumber(merged);
}

/** A worked example with new steps: only its steps change; the problem and any practice stay. */
export function mergeStepsBlocks(existing: StoredBlock[], steps: Array<{ title: string; content: string }>, newBlockId = 'steps'): StoredBlock[] {
  const content = JSON.stringify({ steps });
  const at = existing.findIndex((b) => b.type === 'step_reveal');
  if (at === -1) return renumber([...existing, { blockId: newBlockId, type: 'step_reveal', order: 0, content }]);
  return renumber(existing.map((b, i) => (i === at ? { ...b, content } : b)));
}

const INCOMPLETE = "The AI's version came back incomplete, so the item wasn't changed. Try again.";

function hasSteps(block: StoredBlock): boolean {
  try {
    const parsed = JSON.parse(block.content) as { steps?: unknown };
    return Array.isArray(parsed.steps) && parsed.steps.length > 0;
  } catch {
    return false;
  }
}

/** An AI rewrite is saved only when it is a usable item of the same kind. */
export function checkRewrittenBlocks(itemKind: string | null | undefined, blocks: StoredBlock[]): void {
  if (blocks.length === 0 || blocks.every((b) => !text(b.content))) throw new BadRequestError(INCOMPLETE);
  if (itemKind === 'worked_example' && !blocks.some((b) => b.type === 'step_reveal' && hasSteps(b))) throw new BadRequestError(INCOMPLETE);
}

/** The current questions, written out for the AI to transform rather than replace. */
export function questionsToRewrite(questions: Array<{ stem: string; options: Array<{ text: string; isCorrect: boolean }> }>): string {
  return questions
    .map((q, i) => `${i + 1}. ${q.stem} Choices: ${q.options.map((o) => (o.isCorrect ? `${o.text} (right)` : o.text)).join(', ')}`)
    .join('\n');
}
