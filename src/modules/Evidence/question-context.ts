// src/modules/Evidence/question-context.ts
//
// Stem, memo and guideline per question key (spec §6.5), resolved once per
// key per run from the key's owner: q: bank, p: paper, g: legacy paper,
// lq: Learning quiz, pr: practice, cb: library block.
import mongoose from 'mongoose';
import { AssessmentPaper, Question } from '../QuestionBank/model.js';
import { GeneratedPaper } from '../AITools/model.js';
import { Quiz } from '../Learning/model.js';
import { PracticeAttempt } from '../AITutor/model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import type { Oid } from './types.js';

export interface QuestionContext { stem: string; memo: string; guideline: string }
type Kind = 'q' | 'p' | 'g' | 'lq' | 'pr' | 'cb';
interface ParsedKey { kind: Kind; id: string; rest: string[] }

const KINDS: readonly Kind[] = ['q', 'p', 'g', 'lq', 'pr', 'cb'];
const MAX = 1500;
const clip = (s: unknown): string => String(s ?? '').slice(0, MAX);

export function parseQuestionKey(key: string): ParsedKey | null {
  const [kind, id, ...rest] = key.split(':');
  if (!KINDS.includes(kind as Kind) || !id || !mongoose.Types.ObjectId.isValid(id)) return null;
  return { kind: kind as Kind, id, rest };
}

interface Docs {
  q: Map<string, { stem: string; answer: string; markingRubric: string; options?: Array<{ label: string; text: string; isCorrect: boolean }> }>;
  p: Map<string, { sections: Array<{ questions: Array<{ position: number; questionText: string | null; modelAnswer: string | null; markingGuideline: string | null }> }> }>;
  g: Map<string, { sections: Array<{ questions: Array<{ questionNumber: number; questionText: string; modelAnswer: string; markingGuideline: string }> }> }>;
  lq: Map<string, { questions: Array<{ questionText: string; correctAnswer: string; explanation?: string }> }>;
  pr: Map<string, { questions: Array<{ questionText: string; correctAnswer: string; explanation: string }> }>;
  cb: Map<string, { blocks: Array<{ blockId: string; content: string }> }>;
}

function contextFor(p: ParsedKey, d: Docs): QuestionContext | null {
  const index = Number(p.rest[0]);
  switch (p.kind) {
    case 'q': {
      const q = d.q.get(p.id);
      const correct = q?.options?.find((o) => o.isCorrect);
      return q ? { stem: clip(q.stem), memo: clip(correct ? `${correct.label}. ${correct.text}` : q.answer), guideline: clip(q.markingRubric) } : null;
    }
    case 'p': {
      const [s, pos] = (p.rest[1] ?? '').split('.').map(Number);
      const pq = d.p.get(p.id)?.sections?.[s - 1]?.questions?.find((q) => q.position === pos - 1);
      return pq ? { stem: clip(pq.questionText), memo: clip(pq.modelAnswer), guideline: clip(pq.markingGuideline) } : null;
    }
    case 'g': {
      const q = d.g.get(p.id)?.sections?.flatMap((s) => s.questions).find((x) => x.questionNumber === index);
      return q ? { stem: clip(q.questionText), memo: clip(q.modelAnswer), guideline: clip(q.markingGuideline) } : null;
    }
    case 'lq': {
      const q = d.lq.get(p.id)?.questions?.[index];
      return q ? { stem: clip(q.questionText), memo: clip(q.correctAnswer), guideline: clip(q.explanation) } : null;
    }
    case 'pr': {
      const q = d.pr.get(p.id)?.questions?.[index];
      return q ? { stem: clip(q.questionText), memo: clip(q.correctAnswer), guideline: clip(q.explanation) } : null;
    }
    case 'cb': {
      const block = d.cb.get(p.id)?.blocks?.find((b) => b.blockId === p.rest[0]);
      return block ? { stem: clip(block.content), memo: '', guideline: '' } : null;
    }
  }
}

export async function questionContexts(keys: readonly string[], schoolId: Oid): Promise<Map<string, QuestionContext>> {
  const parsed = keys.map((k: string) => [k, parseQuestionKey(k)] as const)
    .filter((entry): entry is readonly [string, ParsedKey] => entry[1] !== null);
  const ids = (kind: Kind): mongoose.Types.ObjectId[] =>
    [...new Set(parsed.filter(([, p]) => p.kind === kind).map(([, p]) => p.id))].map((id: string) => new mongoose.Types.ObjectId(id));
  const live = { isDeleted: { $ne: true } };
  const visible = { $or: [{ schoolId }, { schoolId: null }], ...live };
  const own = { schoolId, ...live };
  const byId = <T>(docs: unknown[]): Map<string, T> => new Map((docs as Array<{ _id: unknown }>).map((d) => [String(d._id), d as T]));
  const [q, p, g, lq, pr, cb] = await Promise.all([
    Question.find({ _id: { $in: ids('q') }, ...visible }).select('stem answer markingRubric options').lean(),
    AssessmentPaper.find({ _id: { $in: ids('p') }, ...own }).select('sections').lean(),
    GeneratedPaper.find({ _id: { $in: ids('g') }, ...own }).select('sections').lean(),
    Quiz.find({ _id: { $in: ids('lq') }, ...own }).select('questions').lean(),
    PracticeAttempt.find({ _id: { $in: ids('pr') }, ...own }).select('questions').lean(),
    ContentResource.find({ _id: { $in: ids('cb') }, ...visible }).select('blocks').lean(),
  ]);
  const docs: Docs = { q: byId(q), p: byId(p), g: byId(g), lq: byId(lq), pr: byId(pr), cb: byId(cb) };
  const out = new Map<string, QuestionContext>();
  for (const [key, parsedKey] of parsed) {
    const ctx = contextFor(parsedKey, docs);
    if (ctx) out.set(key, ctx);
  }
  return out;
}
