// src/modules/Course/outline.ts
//
// A class unit's outline, drafted by AI from CAPS topics. The AI points at
// topics by number; everything it returns is checked and clamped here before
// it becomes modules and items.

import { BadRequestError } from '../../common/errors.js';
import { ITEM_KINDS, type ItemKind } from './model.js';

export interface OutlineTopic {
  id: string;
  title: string;
  description: string;
  capsReference: string;
  weekNumbers: number[];
}

export interface OutlineItem {
  kind: ItemKind;
  title: string;
  minutes: number;
  objectives: string[];
  capsRef: string;
  /** One sentence telling the item generator what to write. */
  brief: string;
}

export interface OutlineModule {
  title: string;
  curriculumNodeId: string;
  weekNumbers: number[];
  objectives: string[];
  items: OutlineItem[];
}

export const MAX_MODULES = 8;
export const MAX_ITEMS_PER_MODULE = 6;
export const MIN_ITEM_MINUTES = 5;
export const MAX_ITEM_MINUTES = 10;
const DEFAULT_ITEM_MINUTES = 8;
const MAX_OBJECTIVES = 4;
const EMPTY_OUTLINE = 'The AI outline came back empty. Try again.';

type Loose = Record<string, unknown>;

const isObject = (v: unknown): v is Loose => typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function objectives(v: unknown): string[] {
  return list(v).map(text).filter(Boolean).slice(0, MAX_OBJECTIVES);
}

function minutes(v: unknown): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return DEFAULT_ITEM_MINUTES;
  return Math.min(MAX_ITEM_MINUTES, Math.max(MIN_ITEM_MINUTES, Math.round(v)));
}

function toItem(raw: unknown, capsRef: string): OutlineItem | null {
  if (!isObject(raw)) return null;
  const kind = text(raw.kind) as ItemKind;
  const title = text(raw.title);
  if (!ITEM_KINDS.includes(kind) || !title) return null;
  return { kind, title, minutes: minutes(raw.minutes), objectives: objectives(raw.objectives), capsRef, brief: text(raw.brief) };
}

function toModule(raw: unknown, topics: readonly OutlineTopic[]): OutlineModule | null {
  if (!isObject(raw)) return null;
  const index = typeof raw.topicIndex === 'number' ? raw.topicIndex - 1 : -1;
  const topic = topics[index];
  const title = text(raw.title);
  if (!topic || !title) return null;
  const capsRef = topic.capsReference || topic.title;
  const items = list(raw.items)
    .map((item: unknown) => toItem(item, capsRef))
    .filter((item): item is OutlineItem => item !== null)
    .slice(0, MAX_ITEMS_PER_MODULE);
  if (items.length === 0) return null;
  return { title, curriculumNodeId: topic.id, weekNumbers: [...topic.weekNumbers], objectives: objectives(raw.objectives), items };
}

/** The AI's outline, checked against the scope's topics and clamped to the unit's shape. */
export function normaliseOutline(raw: unknown, topics: readonly OutlineTopic[]): OutlineModule[] {
  const modules = isObject(raw)
    ? list(raw.modules)
      .map((m: unknown) => toModule(m, topics))
      .filter((m): m is OutlineModule => m !== null)
      .slice(0, MAX_MODULES)
    : [];
  if (modules.length === 0) throw new BadRequestError(EMPTY_OUTLINE);
  return modules;
}

const SYSTEM_PROMPT = [
  'You plan short, class-paced units of work for South African teachers, following CAPS.',
  'Return JSON only, no markdown, in exactly this shape:',
  '{"modules":[{"title":string,"topicIndex":number,"objectives":[string],"items":[{"kind":"notes"|"worked_example"|"quick_check","title":string,"minutes":number,"objectives":[string],"brief":string}]}]}',
  'Rules:',
  '- One module per CAPS topic you are given, in the order that best teaches them; topicIndex is the topic number from the list.',
  '- 3 to 6 items per module, each 5 to 10 minutes of a learner\'s time.',
  '- Start a module with notes, include a worked example where the topic has a method, and end with one quick_check.',
  '- Titles are short and specific (e.g. "Counting in tens to 99"); "brief" is one sentence telling a writer what the item must teach.',
  '- Objectives are learner-facing ("I can ..."), at most 3 per module and 2 per item.',
  '- Use South African English and the terms CAPS uses for this grade.',
].join('\n');

/** The system and user prompts that ask the AI for an outline. */
export function buildOutlinePrompt(
  scope: { subjectName: string; gradeName: string; termNumber: number },
  topics: readonly OutlineTopic[],
): { system: string; user: string } {
  const topicLines = topics.map((t: OutlineTopic, i: number) => {
    const weeks = t.weekNumbers.length > 0 ? ` (weeks ${t.weekNumbers[0]}–${t.weekNumbers[t.weekNumbers.length - 1]})` : '';
    const detail = t.description ? `: ${t.description}` : '';
    return `${i + 1}. ${t.title}${weeks}${detail}`;
  });
  const user = [
    `Plan a unit for ${scope.gradeName} ${scope.subjectName}, Term ${scope.termNumber}.`,
    'CAPS topics to cover:',
    ...topicLines,
  ].join('\n');
  return { system: SYSTEM_PROMPT, user };
}
