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
  stem: string;
  options: Array<{ label: string; text: string; isCorrect: boolean }>;
}

/** Quick checks are marked by the chosen option: every question needs choices and exactly one right answer. */
export function checkQuestionsEdit(questions: Array<{ stem: unknown; options: Array<{ text: unknown; isCorrect: unknown }> }>): QuestionEdit[] {
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
    return { stem, options: options.map((o, j) => ({ label: LABELS[j], text: o.text, isCorrect: o.isCorrect })) };
  });
}
