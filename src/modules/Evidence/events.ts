// src/modules/Evidence/events.ts
//
// The hook Phase R subscribes to (Phase R spec): whenever a learner's FINAL
// evidence is written, changed or removed, E announces `readiness:recompute`
// with the learner and subject. E registers no consumer; R adds one (for
// example, one that enqueues its readiness job). A failing subscriber is
// logged and never fails the evidence write.
import { logger } from '../../common/logger.js';

export const READINESS_RECOMPUTE = 'readiness:recompute';

export interface ReadinessRecompute { schoolId: string; studentId: string; subjectId: string | null }
type Listener = (event: ReadinessRecompute) => Promise<void> | void;

const listeners = new Set<Listener>();

/** Subscribe; returns the unsubscribe function. */
export function onReadinessRecompute(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export async function announceReadinessRecompute(event: ReadinessRecompute): Promise<void> {
  for (const listener of listeners) {
    try {
      await listener(event);
    } catch (err: unknown) {
      logger.error({ err, event: READINESS_RECOMPUTE, ...event }, '[Evidence] a readiness subscriber failed');
    }
  }
}
