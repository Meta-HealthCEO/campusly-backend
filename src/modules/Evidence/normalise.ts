// src/modules/Evidence/normalise.ts
//
// Pure helpers (spec §3, §6.1): the same answer written differently hashes the
// same, so identical wrong answers share one diagnosis per school.
import crypto from 'node:crypto';
import type { AnswerKind } from './types.js';

export const MAX_ANSWER_CHARS = 2000;
export const MAX_NOTE_CHARS = 500;

const AROUND_OPERATORS = /\s*([=+\-×÷/^(),;])\s*/g;
const BLANK = new Set(['', 'no answer provided', '(no answer provided)', '(blank)', '[blank]']);

export function normaliseAnswer(text: string, kind: AnswerKind): string {
  const base = text.normalize('NFKC').trim();
  if (kind === 'choice') return base.toUpperCase();
  return base.toLowerCase().replace(/\s+/g, ' ').replace(AROUND_OPERATORS, '$1').replace(/\.$/, '');
}

export function answerHash(text: string, kind: AnswerKind): string {
  return crypto.createHash('sha256').update(normaliseAnswer(text, kind)).digest('hex');
}

export function capText(text: string, max: number): { text: string; truncated: boolean } {
  return text.length > max ? { text: text.slice(0, max), truncated: true } : { text, truncated: false };
}

/** "Q2.3", "Question 2.3", "2.3." and " 2.3 " → "2.3" (the paper's `section.position` label). */
export function normaliseQuestionNumber(raw: string): string {
  return raw.normalize('NFKC').replace(/^\s*(question|q)\.?\s*/i, '').replace(/\s+/g, '').replace(/\.+$/, '');
}

/** Empty, or the words a marker writes for an empty answer. */
export function isBlankAnswer(text: string): boolean {
  return BLANK.has(text.trim().toLowerCase());
}

/** The same answer to the same question at the same mark, in the same school, is diagnosed once. */
export function diagnosisCacheKey(schoolId: string, questionKey: string, hash: string, awarded: number, available: number): string {
  return crypto.createHash('sha256').update(`${schoolId}|${questionKey}|${hash}|${awarded}/${available}`).digest('hex');
}
