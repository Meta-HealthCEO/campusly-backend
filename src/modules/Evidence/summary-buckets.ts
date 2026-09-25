// src/modules/Evidence/summary-buckets.ts
//
// Pure summing for Phase R's evidence contract (spec §7.2). Raw sums only:
// weighting, decay and confidence are R's decisions.
import { CAPS_LEVELS } from '../QuestionBank/model-shared.js';
import { SOURCE_TYPES, type SourceType, type TopicFrom } from './types.js';
import type { TypeKind } from './model-taxonomy.js';

export interface Bucket { awarded: number; available: number; answers: number }
export const LEVEL_KEYS = [...CAPS_LEVELS, 'unknown'] as const;
export type LevelKey = (typeof LEVEL_KEYS)[number];
export const WEEKS = 26;
const SAST_MS = 2 * 3600_000;
const WEEK_MS = 7 * 24 * 3600_000;

export function sastWeekStart(d: Date): string {
  const local = new Date(d.getTime() + SAST_MS);
  const back = (local.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - back)).toISOString().slice(0, 10);
}

export interface SummaryRow {
  studentId: string; topicNodeId: string | null; subtopicNodeId: string | null; cognitiveLevel: string | null;
  sourceType: SourceType; marksAwarded: number; marksAvailable: number; markedAt: Date; topicFrom: TopicFrom;
  typeId: string | null; diagnosisState: string;
}

export interface TypeInfo { code: string; label: string; learnerLabel: string; kind: TypeKind; learnerVisible: boolean }
export interface Lookups { titles: Map<string, string>; codes: Map<string, string>; types: Map<string, TypeInfo> }

export interface TopicEvidence {
  topicNodeId: string; topicTitle: string; topicCode: string;
  marksAwarded: number; marksAvailable: number; answers: number; learners?: number;
  firstAnsweredAt: string; lastAnsweredAt: string;
  byLevel: Record<LevelKey, Bucket>;
  bySource: Record<SourceType, Bucket>;
  weekly: Array<{ weekStart: string } & Bucket>;
  subtopics: Array<{ subtopicNodeId: string; title: string } & Bucket>;
  misconceptions: Array<{ typeId: string; code: string; label: string; learnerLabel: string; kind: TypeKind; count: number; lastSeenAt: string }>;
  aiTaggedShare: number;
}

const empty = (): Bucket => ({ awarded: 0, available: 0, answers: 0 });
const add = (b: Bucket, r: SummaryRow): Bucket => ({ awarded: b.awarded + r.marksAwarded, available: b.available + r.marksAvailable, answers: b.answers + 1 });
const tally = (rows: readonly SummaryRow[]): Bucket => rows.reduce(add, empty());
const bucketsBy = (rows: readonly SummaryRow[], keyOf: (r: SummaryRow) => string | null): Map<string, SummaryRow[]> => {
  const out = new Map<string, SummaryRow[]>();
  for (const r of rows) {
    const k = keyOf(r);
    if (k !== null) out.set(k, [...(out.get(k) ?? []), r]);
  }
  return out;
};

function misconceptions(rows: readonly SummaryRow[], lookups: Lookups, countLearners: boolean, learnerView: boolean): TopicEvidence['misconceptions'] {
  const shown = rows.filter((r) => r.diagnosisState === 'ready' && r.typeId);
  return [...bucketsBy(shown, (r) => r.typeId).entries()].flatMap(([typeId, rs]) => {
    const t = lookups.types.get(typeId);
    if (!t || t.code === 'GEN.possible-marking-error' || (learnerView && !t.learnerVisible)) return [];
    const count = countLearners ? new Set(rs.map((r) => r.studentId)).size : rs.length;
    const last = Math.max(...rs.map((r) => r.markedAt.getTime()));
    return [{ typeId, code: t.code, label: learnerView ? t.learnerLabel : t.label, learnerLabel: t.learnerLabel, kind: t.kind, count, lastSeenAt: new Date(last).toISOString() }];
  }).sort((a, b) => b.count - a.count);
}

export function summariseTopics(
  rows: readonly SummaryRow[], lookups: Lookups, options: { now: Date; countLearners: boolean; learnerView: boolean },
): { topics: TopicEvidence[]; untagged: Bucket } {
  const since = options.now.getTime() - WEEKS * WEEK_MS;
  const topics = [...bucketsBy(rows, (r) => r.topicNodeId).entries()].map(([topicNodeId, rs]): TopicEvidence => {
    const times = rs.map((r) => r.markedAt.getTime());
    const total = tally(rs);
    return {
      topicNodeId, topicTitle: lookups.titles.get(topicNodeId) ?? '', topicCode: lookups.codes.get(topicNodeId) ?? '',
      marksAwarded: total.awarded, marksAvailable: total.available, answers: total.answers,
      ...(options.countLearners ? { learners: new Set(rs.map((r) => r.studentId)).size } : {}),
      firstAnsweredAt: new Date(Math.min(...times)).toISOString(), lastAnsweredAt: new Date(Math.max(...times)).toISOString(),
      byLevel: Object.fromEntries(LEVEL_KEYS.map((k) => [k, tally(rs.filter((r) => (r.cognitiveLevel ?? 'unknown') === k))])) as Record<LevelKey, Bucket>,
      bySource: Object.fromEntries(SOURCE_TYPES.map((s) => [s, tally(rs.filter((r) => r.sourceType === s))])) as Record<SourceType, Bucket>,
      weekly: [...bucketsBy(rs.filter((r) => r.markedAt.getTime() >= since), (r) => sastWeekStart(r.markedAt)).entries()]
        .sort(([a], [b]) => a.localeCompare(b)).map(([weekStart, ws]) => ({ weekStart, ...tally(ws) })),
      subtopics: [...bucketsBy(rs, (r) => r.subtopicNodeId).entries()]
        .map(([subtopicNodeId, ss]) => ({ subtopicNodeId, title: lookups.titles.get(subtopicNodeId) ?? '', ...tally(ss) })),
      misconceptions: misconceptions(rs, lookups, options.countLearners, options.learnerView),
      aiTaggedShare: rs.filter((r) => r.topicFrom === 'ai_tag').length / rs.length,
    };
  }).sort((a, b) => a.topicTitle.localeCompare(b.topicTitle));
  return { topics, untagged: tally(rows.filter((r) => !r.topicNodeId)) };
}
