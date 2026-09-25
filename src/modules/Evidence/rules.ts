// src/modules/Evidence/rules.ts
//
// The diagnosis a row is born with (plan ruling P5): the no-AI rules run when
// the row is written, so a blank answer reads "Not answered" at once.
import type { IEvidenceDiagnosis } from './model.js';
import { isBlankAnswer } from './normalise.js';
import type { Oid } from './types.js';

export const UNANSWERED_EXPLANATION = 'Have a go at every question: even a first step can earn marks.';

export interface RuleInput {
  marksAwarded: number;
  marksAvailable: number;
  answerText: string;
  topicNodeId: Oid | null;
  cacheKey: string;
}

export function initialDiagnosis(input: RuleInput, unansweredTypeId: Oid): IEvidenceDiagnosis {
  const base: IEvidenceDiagnosis = {
    state: 'pending', typeId: null, explanation: '', confidence: null, cacheKey: input.cacheKey, skippedReason: null,
    requestId: null, attempts: 0, diagnosedAt: null, dismissedBy: null, dismissedAt: null,
  };
  if (input.marksAwarded >= input.marksAvailable) return { ...base, state: 'none' };
  if (isBlankAnswer(input.answerText)) {
    return { ...base, state: 'ready', typeId: unansweredTypeId, explanation: UNANSWERED_EXPLANATION, confidence: 1, diagnosedAt: new Date() };
  }
  if (!input.topicNodeId) return { ...base, state: 'skipped', skippedReason: 'no_topic' };
  return base;
}
