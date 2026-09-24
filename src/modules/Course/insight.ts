// src/modules/Course/insight.ts
//
// Pure rules behind a unit's insight view: who is stuck and why, which quick
// check questions the class gets wrong most, and the order learners are shown.

/** A learner who has failed one quick check this many times without passing is stuck. */
export const STUCK_FAILED_ATTEMPTS = 2;
/** An active learner with no progress for this many days is stuck. */
export const STUCK_IDLE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type StuckReason =
  | { kind: 'failed_check'; itemTitle: string; count: number }
  | { kind: 'idle'; days: number };

export interface StuckInput {
  status: 'active' | 'completed' | 'dropped';
  lastActivityAt: Date | null;
  /** The learner's quick-check attempts, oldest first. */
  attempts: Array<{ lessonId: string; lessonTitle: string; passed: boolean }>;
}

/** Why a learner is stuck, or null when they're moving (or done). */
export function stuckReason(input: StuckInput, now: Date = new Date()): StuckReason | null {
  if (input.status !== 'active') return null;
  const byCheck = new Map<string, { title: string; failed: number; passed: boolean }>();
  for (const a of input.attempts) {
    const entry = byCheck.get(a.lessonId) ?? { title: a.lessonTitle, failed: 0, passed: false };
    if (a.passed) entry.passed = true;
    else entry.failed += 1;
    byCheck.set(a.lessonId, entry);
  }
  for (const check of byCheck.values()) {
    if (!check.passed && check.failed >= STUCK_FAILED_ATTEMPTS) {
      return { kind: 'failed_check', itemTitle: check.title, count: check.failed };
    }
  }
  if (input.lastActivityAt) {
    const days = Math.floor((now.getTime() - input.lastActivityAt.getTime()) / DAY_MS);
    if (days >= STUCK_IDLE_DAYS) return { kind: 'idle', days };
  }
  return null;
}

export interface MissedQuestion {
  questionId: string;
  stem: string;
  itemTitle: string;
  answered: number;
  wrong: number;
  wrongPercent: number;
}

/**
 * The questions the class gets wrong most: by share wrong, then by how often
 * they were answered. Questions no longer in the bank (no stem) are left out.
 */
export function mostMissed(
  attempts: Array<{ lessonTitle: string; answers: Array<{ questionId: string; isCorrect: boolean }> }>,
  stems: ReadonlyMap<string, string>,
  limit: number,
): MissedQuestion[] {
  const tally = new Map<string, { itemTitle: string; answered: number; wrong: number }>();
  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      if (!stems.has(answer.questionId)) continue;
      const t = tally.get(answer.questionId) ?? { itemTitle: attempt.lessonTitle, answered: 0, wrong: 0 };
      t.answered += 1;
      if (!answer.isCorrect) t.wrong += 1;
      tally.set(answer.questionId, t);
    }
  }
  return [...tally.entries()]
    .filter(([, t]) => t.wrong > 0)
    .map(([questionId, t]) => ({
      questionId,
      stem: stems.get(questionId) ?? '',
      itemTitle: t.itemTitle,
      answered: t.answered,
      wrong: t.wrong,
      wrongPercent: Math.round((t.wrong / t.answered) * 100),
    }))
    .sort((a, b) => b.wrongPercent - a.wrongPercent || b.answered - a.answered)
    .slice(0, limit);
}

/** Stuck learners first, then the least far along. */
export function orderLearners<T extends { progressPercent: number; stuck: StuckReason | null; name: string }>(learners: T[]): T[] {
  return [...learners].sort((a, b) =>
    Number(b.stuck !== null) - Number(a.stuck !== null)
    || a.progressPercent - b.progressPercent
    || a.name.localeCompare(b.name));
}
