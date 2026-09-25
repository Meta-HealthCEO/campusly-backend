// src/modules/Evidence/diagnosis-prompt.ts
//
// The diagnosis request (spec §6.5). The system prompt is identical for every
// request (a cacheable prefix); the user message is the topic block, then up
// to 10 answers. No names, ids or school ever go in.
import { z } from 'zod/v4';
import { GENERIC_TYPES, genericCode } from './taxonomy-generic.js';

export const MAX_ITEMS_PER_REQUEST = 10;

const CHOOSABLE_GENERIC = GENERIC_TYPES.filter((t) => t.slug !== 'unanswered' && t.slug !== 'possible-marking-error');

export const DIAGNOSIS_SYSTEM = [
  'You explain why a South African learner lost marks on one school test question at a time.',
  'For each item choose the single most specific code, from the topic codes or the general codes, that explains the lost marks.',
  'If no listed code fits, set "code" to null and propose one in "proposed": {"slug","kind","label","learnerLabel","description"}. kind is misconception or procedural; slug is lower-case letters, digits and hyphens; label and learnerLabel at most 60 characters; description at most 300 characters, generalised, never quoting the answer.',
  'explanation: one sentence to the learner, second person, at most 30 words: what went wrong and what to do instead. Do not mention marks, do not quote the answer back at length, never use a name.',
  'confidence: a number from 0 to 1, how sure you are.',
  'checkMark: true only when the answer seems to deserve the marks it lost.',
  'Return JSON only: {"items":[{"ref":"a1","code":"<code or null>","proposed":null,"explanation":"...","confidence":0.8,"checkMark":false}]}.',
  '',
  'General codes:',
  ...CHOOSABLE_GENERIC.map((t) => `- ${genericCode(t.slug)}: ${t.label}. ${t.description}`),
].join('\n');

export interface TopicBlock {
  subject: string; grade: string; topic: string; subtopics: string[];
  types: Array<{ code: string; label: string; description: string }>;
}

export interface DiagnosisPromptItem {
  ref: string; stem: string; memo: string; guideline: string; awarded: number; available: number; markerNote: string; answer: string;
}

export function diagnosisUserPrompt(topic: TopicBlock, items: readonly DiagnosisPromptItem[]): string {
  return [
    `Subject: ${topic.subject}`, `Grade: ${topic.grade}`, `Topic: ${topic.topic}`,
    `Subtopics: ${topic.subtopics.join('; ') || 'none listed'}`, '', 'Topic codes:',
    ...topic.types.map((t) => `- ${t.code}: ${t.label}. ${t.description}`), '', 'Items:',
    ...items.map((i) => [
      `[${i.ref}]`, `Question: ${i.stem}`, `Memo: ${i.memo || 'none'}`, `Marking guideline: ${i.guideline || 'none'}`,
      `Marks: ${i.awarded} of ${i.available}`, `Marker's note: ${i.markerNote || 'none'}`, `Learner's answer: ${i.answer || '(blank)'}`, '',
    ].join('\n')),
  ].join('\n');
}

export const diagnosisMaxTokens = (items: number): number => 200 + 120 * items;

const clip = (n: number) => z.string().transform((s: string) => s.slice(0, n));

export const DiagnosisReplySchema = z.object({
  items: z.array(z.object({
    ref: z.string(),
    code: z.string().nullable().optional(),
    proposed: z.object({
      slug: z.string(), kind: z.enum(['misconception', 'procedural']), label: clip(60), learnerLabel: clip(60), description: clip(300),
    }).nullable().optional(),
    explanation: clip(240),
    confidence: z.number().min(0).max(1),
    checkMark: z.boolean().default(false),
  })),
});
export type DiagnosisReplyItem = z.infer<typeof DiagnosisReplySchema>['items'][number];
