// src/services/ai-semaphore.ts
//
// The per-process limit on concurrent Claude calls AIService makes, and its
// bounded wait queue. Moved out of ai.service.ts unchanged so that file stays
// under 350 lines (Phase E); ai.service.ts re-exports AI_MAX_QUEUED.
import { logger } from '../common/logger.js';
import { aiAppError } from './ai-errors.js';

const MAX_CONCURRENT = 5;

let activeCalls = 0;
const waitQueue: Array<() => void> = [];

/**
 * At most this many calls wait for a free slot. Beyond it a new call is
 * refused at once with the plain "AI is busy" error (503 AI_BUSY) instead of
 * queueing without bound (release review I1).
 */
export const AI_MAX_QUEUED = 200;

export function acquireSemaphore(): Promise<void> {
  if (activeCalls < MAX_CONCURRENT) {
    activeCalls++;
    return Promise.resolve();
  }
  if (waitQueue.length >= AI_MAX_QUEUED) {
    logger.warn({ waiting: waitQueue.length }, '[AIService] wait queue full; refusing a call as busy');
    return Promise.reject(aiAppError('BUSY'));
  }
  return new Promise<void>((resolve) => {
    waitQueue.push(() => {
      activeCalls++;
      resolve();
    });
  });
}

export function releaseSemaphore(): void {
  activeCalls--;
  const next = waitQueue.shift();
  if (next) next();
}
