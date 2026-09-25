// src/modules/Evidence/__tests__/normalise.test.ts
import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import {
  answerHash, capText, diagnosisCacheKey, isBlankAnswer, normaliseAnswer, normaliseQuestionNumber,
} from '../normalise.js';
import { UNANSWERED_EXPLANATION, initialDiagnosis } from '../rules.js';

describe('normaliseQuestionNumber', () => {
  it.each(['Q2.3', 'Question 2.3', '2.3.', ' 2.3 ', 'q 2.3', 'Q.2.3'])('%s → 2.3', (raw) => {
    expect(normaliseQuestionNumber(raw)).toBe('2.3');
  });
});

describe('normaliseAnswer and answerHash', () => {
  it('ignores case, spacing round operators and a trailing full stop', () => {
    expect(normaliseAnswer('  X = 2 + 3y. ', 'typed')).toBe('x=2+3y');
    expect(answerHash('X = 2.', 'typed')).toBe(answerHash('x=2', 'typed'));
  });
  it('folds full-width characters (NFKC)', () => {
    expect(normaliseAnswer('ｘ＝２', 'typed')).toBe('x=2');
  });
  it('turns a choice into its upper-case label', () => {
    expect(normaliseAnswer(' b ', 'choice')).toBe('B');
  });
  it('caps long text and says so', () => {
    expect(capText('abc', 2)).toEqual({ text: 'ab', truncated: true });
    expect(capText('ab', 2)).toEqual({ text: 'ab', truncated: false });
  });
});

describe('diagnosisCacheKey', () => {
  it('is per school, question, answer and mark', () => {
    const k = diagnosisCacheKey('s1', 'q:1', 'h', 1, 3);
    expect(k).toBe(diagnosisCacheKey('s1', 'q:1', 'h', 1, 3));
    expect(k).not.toBe(diagnosisCacheKey('s2', 'q:1', 'h', 1, 3));
    expect(k).not.toBe(diagnosisCacheKey('s1', 'q:1', 'h', 2, 3));
  });
});

describe('initialDiagnosis (write-time rules)', () => {
  const unanswered = new mongoose.Types.ObjectId();
  const topic = new mongoose.Types.ObjectId();
  const base = { marksAwarded: 1, marksAvailable: 3, answerText: 'x = 4', topicNodeId: topic, cacheKey: 'k' };

  it('full marks: nothing to diagnose', () => {
    expect(initialDiagnosis({ ...base, marksAwarded: 3 }, unanswered).state).toBe('none');
  });
  it.each(['', '  ', 'No answer provided', '(no answer provided)'])('a blank answer (%j) is "Not answered" at once', (answerText) => {
    const d = initialDiagnosis({ ...base, answerText, marksAwarded: 0 }, unanswered);
    expect(d).toMatchObject({ state: 'ready', typeId: unanswered, explanation: UNANSWERED_EXPLANATION, confidence: 1 });
  });
  it('no topic: skipped, still counted at subject level', () => {
    expect(initialDiagnosis({ ...base, topicNodeId: null }, unanswered)).toMatchObject({ state: 'skipped', skippedReason: 'no_topic' });
  });
  it('otherwise waits for the job', () => {
    expect(initialDiagnosis(base, unanswered)).toMatchObject({ state: 'pending', cacheKey: 'k', attempts: 0 });
  });
  it('isBlankAnswer', () => {
    expect(isBlankAnswer('(blank)')).toBe(true);
    expect(isBlankAnswer('0')).toBe(false);
  });
});
