// src/modules/Behaviour/legacy-map.ts
//
// How the old Merits and Discipline records read in the one behaviour log.
// Pure: service-migration.ts does the reading and writing.

import type { BehaviourKind, CheckedEntry, Severity } from './behaviour-rules.js';

const MAX_POINTS = 5;

const MERIT_CATEGORY: Record<string, string> = { academic: 'academic', behaviour: 'effort', sport: 'sport', service: 'service', leadership: 'leadership' };
const DEMERIT_FROM_MERIT: Record<string, string> = { academic: 'homework', behaviour: 'disruption' };
const DEMERIT_FROM_DISCIPLINE: Record<string, string> = { late: 'late', dress_code: 'uniform', misconduct: 'disruption' };
const INCIDENT_FROM_DISCIPLINE: Record<string, string> = { bullying: 'bullying', vandalism: 'property' };
const SEVERITY: Record<string, Severity> = { minor: 'low', moderate: 'medium', serious: 'high', critical: 'high' };
const ALWAYS_INCIDENT = new Set(['bullying', 'vandalism']);

const clampPoints = (n: unknown): number => Math.min(MAX_POINTS, Math.max(1, Math.round(Number(n) || 1)));

/** An old Merit record (merit or demerit, with unsigned points). */
export function fromMerit(m: { type: string; category: string; points: number; reason?: string }): CheckedEntry {
  const note = (m.reason ?? '').trim().slice(0, 500);
  if (m.type === 'demerit') {
    return { kind: 'demerit', category: DEMERIT_FROM_MERIT[m.category] ?? 'other', points: -clampPoints(m.points), severity: 'low', note };
  }
  return { kind: 'merit', category: MERIT_CATEGORY[m.category] ?? 'effort', points: clampPoints(m.points), severity: null, note };
}

/** An old Discipline record: minor or moderate matters are demerits; serious ones, bullying and vandalism are incidents. */
export function fromDiscipline(d: { type: string; severity: string; description?: string }): CheckedEntry {
  const severity = SEVERITY[d.severity] ?? 'low';
  const incident = ALWAYS_INCIDENT.has(d.type) || d.severity === 'serious' || d.severity === 'critical';
  const kind: BehaviourKind = incident ? 'incident' : 'demerit';
  const category = incident ? INCIDENT_FROM_DISCIPLINE[d.type] ?? 'other' : DEMERIT_FROM_DISCIPLINE[d.type] ?? 'other';
  return { kind, category, points: incident ? 0 : -1, severity, note: (d.description ?? '').trim().slice(0, 500) };
}
