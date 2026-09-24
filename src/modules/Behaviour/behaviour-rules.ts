// src/modules/Behaviour/behaviour-rules.ts
//
// One behaviour log (programme phase 4): a teacher notes a merit, a demerit
// or an incident for a learner. These are the rules and the wording: what can
// be recorded, how points are signed, the learner's summary, and the one
// timeline that also shows counsellor referrals.

import { BadRequestError } from '../../common/errors.js';

export const BEHAVIOUR_KINDS = ['merit', 'demerit', 'incident'] as const;
export type BehaviourKind = (typeof BEHAVIOUR_KINDS)[number];
export const SEVERITIES = ['low', 'medium', 'high'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const BEHAVIOUR_CATEGORIES: Record<BehaviourKind, Array<{ value: string; label: string }>> = {
  merit: [
    { value: 'effort', label: 'Effort' },
    { value: 'kindness', label: 'Kindness' },
    { value: 'academic', label: 'Good work' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'service', label: 'Helping out' },
    { value: 'sport', label: 'Sport and culture' },
  ],
  demerit: [
    { value: 'late', label: 'Late' },
    { value: 'homework', label: 'Homework not done' },
    { value: 'disruption', label: 'Disrupting class' },
    { value: 'uniform', label: 'Uniform' },
    { value: 'respect', label: 'Disrespect' },
    { value: 'language', label: 'Bad language' },
    { value: 'other', label: 'Other' },
  ],
  incident: [
    { value: 'fighting', label: 'Fighting' },
    { value: 'bullying', label: 'Bullying' },
    { value: 'property', label: 'Damage or theft' },
    { value: 'safety', label: 'Safety' },
    { value: 'other', label: 'Other' },
  ],
};

const KIND_LABEL: Record<BehaviourKind, string> = { merit: 'Merit', demerit: 'Demerit', incident: 'Incident' };
const DEFAULT_SEVERITY: Record<BehaviourKind, Severity | null> = { merit: null, demerit: 'low', incident: 'medium' };
const MAX_POINTS = 5;
const MAX_NOTE = 500;

const REFERRAL_REASON: Record<string, string> = {
  academic: 'Academic', behavioural: 'Behaviour', emotional: 'Emotional', social: 'Social', family: 'Family',
  substance: 'Substance use', bullying: 'Bullying', self_harm: 'Self-harm', other: 'Other',
};
const REFERRAL_STATUS: Record<string, string> = {
  referred: 'Waiting for the counsellor', acknowledged: 'Seen by the counsellor', in_progress: 'In progress', resolved: 'Resolved', closed: 'Closed',
};

export interface EntryInput {
  kind: unknown;
  category: unknown;
  points?: unknown;
  severity?: unknown;
  note?: unknown;
}

export interface CheckedEntry {
  kind: BehaviourKind;
  category: string;
  /** Signed: merits add, demerits take away, incidents carry none. */
  points: number;
  severity: Severity | null;
  note: string;
}

const categoryLabel = (kind: BehaviourKind, category: string): string =>
  BEHAVIOUR_CATEGORIES[kind].find((c) => c.value === category)?.label ?? category;

/** What a teacher logged, checked, in plain words when it can't be recorded. */
export function checkEntry(input: EntryInput): CheckedEntry {
  const kind = input.kind as BehaviourKind;
  if (!BEHAVIOUR_KINDS.includes(kind)) throw new BadRequestError('Pick merit, demerit or incident.');
  const category = typeof input.category === 'string' ? input.category : '';
  if (!BEHAVIOUR_CATEGORIES[kind].some((c) => c.value === category)) throw new BadRequestError(`Pick what the ${kind} is for.`);
  const note = typeof input.note === 'string' ? input.note.trim().slice(0, MAX_NOTE) : '';
  if (kind !== 'merit' && !note) throw new BadRequestError('Say briefly what happened.');

  const raw = input.points === undefined || input.points === null ? 1 : Number(input.points);
  if (kind !== 'incident' && (!Number.isInteger(raw) || raw < 1 || raw > MAX_POINTS)) throw new BadRequestError(`Points are from 1 to ${MAX_POINTS}.`);
  const points = kind === 'merit' ? raw : kind === 'demerit' ? -raw : 0;

  let severity = DEFAULT_SEVERITY[kind];
  if (kind !== 'merit' && input.severity !== undefined && input.severity !== null) {
    if (!SEVERITIES.includes(input.severity as Severity)) throw new BadRequestError('Pick how serious it was: low, medium or high.');
    severity = input.severity as Severity;
  }
  return { kind, category, points, severity, note };
}

export function behaviourSummary(entries: Array<{ kind: string; points: number }>): { merits: number; demerits: number; incidents: number; net: number } {
  return {
    merits: entries.filter((e) => e.kind === 'merit').length,
    demerits: entries.filter((e) => e.kind === 'demerit').length,
    incidents: entries.filter((e) => e.kind === 'incident').length,
    net: entries.reduce((sum, e) => sum + e.points, 0),
  };
}

export interface TimelineItem {
  id: string;
  kind: BehaviourKind | 'referral';
  at: string;
  label: string;
  detail: string;
  by: string | null;
}

const signed = (n: number): string => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

/** A learner's behaviour and referrals in one list, newest first. */
export function timeline(
  entries: Array<{ id: string; kind: BehaviourKind; category: string; points: number; note: string; occurredAt: Date; loggedByName: string | null }>,
  referrals: Array<{ id: string; reason: string; status: string; createdAt: Date }>,
): TimelineItem[] {
  const fromEntries = entries.map((e) => ({
    id: e.id,
    kind: e.kind,
    at: e.occurredAt.toISOString(),
    label: e.kind === 'incident'
      ? `${KIND_LABEL[e.kind]} · ${categoryLabel(e.kind, e.category)}`
      : `${KIND_LABEL[e.kind]} ${signed(e.points)} · ${categoryLabel(e.kind, e.category)}`,
    detail: e.note,
    by: e.loggedByName,
  }));
  const fromReferrals = referrals.map((r) => ({
    id: r.id,
    kind: 'referral' as const,
    at: r.createdAt.toISOString(),
    label: `Referred to the counsellor · ${REFERRAL_REASON[r.reason] ?? r.reason}`,
    detail: REFERRAL_STATUS[r.status] ?? r.status,
    by: null,
  }));
  return [...fromEntries, ...fromReferrals].sort((a, b) => b.at.localeCompare(a.at));
}
