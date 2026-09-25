// src/modules/Readiness/blueprint-validate.ts
//
// The blueprint file and its checks (spec §2.3). Pure: the caller loads the nodes.
import { z } from 'zod/v4';
import { CAPS_LEVELS } from '../QuestionBank/model.js';
import type { BlueprintData, BlueprintPaper, BlueprintTopic, MappedNode } from './types.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const KEY = /^[A-Z0-9-]{3,60}$/;

export const blueprintFileSchema = z.object({
  family: z.string().regex(KEY), examBody: z.literal('DBE'), qualification: z.literal('NSC'), session: z.literal('november'),
  subjectKey: z.string().regex(KEY), slug: z.string().regex(/^[a-z0-9-]{2,40}$/), subjectTitle: z.string().min(2).max(60),
  grade: z.number().int().min(10).max(12), examYear: z.number().int().min(2024).max(2100),
  sources: z.array(z.object({
    ref: z.string().min(1).max(20), title: z.string().min(1).max(200), edition: z.string().max(80), publisher: z.string().max(100),
  })).max(20),
  cognitiveScheme: z.object({
    key: z.string().min(1).max(40),
    levels: z.array(z.object({
      key: z.string().min(1).max(40), label: z.string().min(1).max(60), percent: z.number().min(0).max(100),
      fromStored: z.array(z.enum(CAPS_LEVELS)).min(1), sourceRef: z.string().max(80).default(''), verified: z.boolean().default(false),
    })).min(1).max(8),
  }),
  papers: z.array(z.object({
    key: z.string().regex(/^P[1-9]$/), title: z.string().min(1).max(60),
    totalMarks: z.number().int().positive(), durationMinutes: z.number().int().positive(),
    examDate: z.string().regex(DATE).nullable().default(null), sitting: z.enum(['morning', 'afternoon']).nullable().default(null),
    sourceRef: z.string().max(80).default(''), verified: z.boolean().default(false),
    topics: z.array(z.object({
      key: z.string().regex(/^P[1-9]\.[A-Z0-9]{2,12}$/), label: z.string().min(1).max(80), group: z.string().min(1).max(80),
      marks: z.number().int().positive(), tolerance: z.number().int().min(0).nullable().default(null),
      sourceRef: z.string().max(80).default(''), verified: z.boolean().default(false), note: z.string().max(400).default(''),
      nodes: z.array(z.string().min(3).max(80)).min(1),
    })).min(1),
  })).min(1).max(4),
}).strict();
export type BlueprintFile = z.infer<typeof blueprintFileSchema>;

export interface NodeInfo {
  id: string; code: string; type: string; title: string; parentId: string | null; termNumber: number | null; system: boolean; deleted: boolean;
}
export interface ValidationReport { errors: string[]; warnings: string[]; unverified: string[]; data: BlueprintData | null }

/** A whole title that is not content (spec §2.3). "Measurement (Revision)" is content. */
export const NON_CONTENT_TITLE = /^(revision|revision and trial examination|trial examination|final (nsc|ncs) examination|planning\b.*)$/i;

export function gradeOfCode(code: string): number | null {
  const m = code.match(/-GR(\d{1,2})(?=-|$)/);
  return m ? Number(m[1]) : null;
}

const dupes = (keys: readonly string[]): string[] => keys.filter((k: string, i: number) => keys.indexOf(k) !== i);

function resolveTopic(
  file: BlueprintFile, paperKey: string, topic: BlueprintFile['papers'][number]['topics'][number],
  byCode: ReadonlyMap<string, NodeInfo>, seen: Set<string>, mapped: Set<string>, errors: string[], warnings: string[],
): BlueprintTopic {
  const nodes = topic.nodes.flatMap((code: string): MappedNode[] => {
    if (seen.has(code)) {
      errors.push(`${paperKey}: ${code} is mapped twice`);
      return [];
    }
    seen.add(code);
    const node = byCode.get(code);
    if (!code.startsWith(`${file.subjectKey}-`)) {
      errors.push(`${topic.key}: ${code} is not a ${file.subjectKey} node`);
      return [];
    }
    if (!node || node.deleted || !node.system) {
      errors.push(`${topic.key}: no live system node ${code}`);
      return [];
    }
    if (node.type !== 'topic' && node.type !== 'subtopic') {
      errors.push(`${topic.key}: ${code} is a ${node.type}, not a topic or subtopic`);
      return [];
    }
    if (NON_CONTENT_TITLE.test(node.title.trim())) warnings.push(`${topic.key}: ${code} "${node.title}" is not content`);
    mapped.add(node.id);
    return [{ code, nodeId: node.id, level: node.type, grade: gradeOfCode(code) ?? file.grade, termNumber: node.termNumber }];
  });
  return {
    key: topic.key, label: topic.label, group: topic.group, marks: topic.marks, tolerance: topic.tolerance,
    sourceRef: topic.sourceRef, verified: topic.verified, note: topic.note, nodes,
  };
}

function coverageWarnings(familyNodes: readonly NodeInfo[], mapped: ReadonlySet<string>): string[] {
  const children = new Map<string, NodeInfo[]>();
  for (const n of familyNodes) if (n.parentId) children.set(n.parentId, [...(children.get(n.parentId) ?? []), n]);
  return familyNodes
    .filter((n: NodeInfo) => !n.deleted && !NON_CONTENT_TITLE.test(n.title.trim()))
    .filter((n: NodeInfo) => !(mapped.has(n.id)
      || (n.type === 'subtopic' && n.parentId !== null && mapped.has(n.parentId))
      || (n.type === 'topic' && (children.get(n.id) ?? []).some((c: NodeInfo) => mapped.has(c.id)))))
    .map((n: NodeInfo) => `Not in any paper: ${n.code} "${n.title}"`);
}

export function validateBlueprint(
  file: BlueprintFile, nodesByCode: ReadonlyMap<string, NodeInfo>, familyNodes: readonly NodeInfo[],
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const unverified: string[] = [];
  const levelSum = file.cognitiveScheme.levels.reduce((s: number, l) => s + l.percent, 0);
  if (levelSum !== 100) errors.push(`Cognitive levels add up to ${levelSum}%, not 100%`);
  for (const k of dupes(file.cognitiveScheme.levels.map((l) => l.key))) errors.push(`Level key ${k} is used twice`);
  for (const k of dupes(file.papers.map((p) => p.key))) errors.push(`Paper key ${k} is used twice`);
  for (const k of dupes(file.papers.flatMap((p) => p.topics.map((t) => t.key)))) errors.push(`Topic key ${k} is used twice`);

  const mapped = new Set<string>();
  const papers = file.papers.map((paper): BlueprintPaper => {
    const sum = paper.topics.reduce((s: number, t) => s + t.marks, 0);
    if (sum !== paper.totalMarks) errors.push(`${paper.key}: topic marks add up to ${sum}, not ${paper.totalMarks}`);
    if (paper.examDate && Number(paper.examDate.slice(0, 4)) !== file.examYear) {
      errors.push(`${paper.key}: exam date ${paper.examDate} is not in ${file.examYear}`);
    }
    if (!paper.verified) unverified.push(`${paper.key}: total, duration`);
    if (!paper.examDate) unverified.push(`${paper.key}: exam date missing`);
    const seen = new Set<string>();
    const topics = paper.topics.map((t) => resolveTopic(file, paper.key, t, nodesByCode, seen, mapped, errors, warnings));
    for (const t of topics) if (!t.verified) unverified.push(`${t.key}: marks and nodes`);
    return {
      key: paper.key, title: paper.title, totalMarks: paper.totalMarks, durationMinutes: paper.durationMinutes,
      examDate: paper.examDate, sitting: paper.sitting, sourceRef: paper.sourceRef, verified: paper.verified, topics,
    };
  });
  for (const l of file.cognitiveScheme.levels) if (!l.verified) unverified.push(`Level ${l.key}: ${l.percent}%`);
  warnings.push(...coverageWarnings(familyNodes, mapped));

  const data: BlueprintData | null = errors.length > 0 ? null : {
    family: file.family, examBody: file.examBody, qualification: file.qualification, session: file.session,
    subjectKey: file.subjectKey, slug: file.slug, subjectTitle: file.subjectTitle, grade: file.grade, examYear: file.examYear,
    sources: file.sources, cognitiveScheme: file.cognitiveScheme, papers,
  };
  return { errors, warnings, unverified, data };
}

/** Learners see a blueprint only when every value is verified and every paper has a date (spec §2.4, ruling RP7). */
export function isBlueprintVerified(bp: Pick<BlueprintData, 'papers' | 'cognitiveScheme'>): boolean {
  return bp.cognitiveScheme.levels.every((l) => l.verified)
    && bp.papers.every((p) => p.verified && p.examDate !== null && p.topics.every((t) => t.verified));
}
