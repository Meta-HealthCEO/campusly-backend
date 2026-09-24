import { describe, it, expect } from 'vitest';
import { mostMissed, orderLearners, stuckReason, STUCK_IDLE_DAYS } from '../insight.js';

const now = new Date('2026-09-24T10:00:00Z');
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

describe('stuckReason', () => {
  it('flags a learner who has failed the same quick check twice without passing', () => {
    expect(stuckReason({
      status: 'active', lastActivityAt: daysAgo(1),
      attempts: [{ lessonId: 'q1', lessonTitle: 'Check: counting', passed: false }, { lessonId: 'q1', lessonTitle: 'Check: counting', passed: false }],
    }, now)).toEqual({ kind: 'failed_check', itemTitle: 'Check: counting', count: 2 });
  });

  it('does not flag a learner who passed in the end', () => {
    expect(stuckReason({
      status: 'active', lastActivityAt: daysAgo(1),
      attempts: [false, false, true].map((passed) => ({ lessonId: 'q1', lessonTitle: 'Check', passed })),
    }, now)).toBeNull();
  });

  it(`flags ${STUCK_IDLE_DAYS} days without progress, but never a finished learner`, () => {
    expect(stuckReason({ status: 'active', lastActivityAt: daysAgo(9), attempts: [] }, now)).toEqual({ kind: 'idle', days: 9 });
    expect(stuckReason({ status: 'active', lastActivityAt: daysAgo(3), attempts: [] }, now)).toBeNull();
    expect(stuckReason({ status: 'completed', lastActivityAt: daysAgo(30), attempts: [] }, now)).toBeNull();
  });
});

describe('mostMissed', () => {
  it('ranks questions by how often they were answered wrong, leaving out deleted ones', () => {
    const attempts = [
      { lessonTitle: 'Check: counting', answers: [{ questionId: 'a', isCorrect: false }, { questionId: 'b', isCorrect: true }, { questionId: 'gone', isCorrect: false }] },
      { lessonTitle: 'Check: counting', answers: [{ questionId: 'a', isCorrect: false }, { questionId: 'b', isCorrect: false }] },
      { lessonTitle: 'Check: counting', answers: [{ questionId: 'a', isCorrect: true }, { questionId: 'b', isCorrect: true }] },
    ];
    const stems = new Map([['a', 'What comes next? 10, 20, 30'], ['b', 'One more than 79?']]);
    expect(mostMissed(attempts, stems, 5)).toEqual([
      { questionId: 'a', stem: 'What comes next? 10, 20, 30', itemTitle: 'Check: counting', answered: 3, wrong: 2, wrongPercent: 67 },
      { questionId: 'b', stem: 'One more than 79?', itemTitle: 'Check: counting', answered: 3, wrong: 1, wrongPercent: 33 },
    ]);
  });

  it('leaves out questions nobody got wrong', () => {
    expect(mostMissed([{ lessonTitle: 'C', answers: [{ questionId: 'a', isCorrect: true }] }], new Map([['a', 'Q']]), 5)).toEqual([]);
  });
});

describe('orderLearners', () => {
  it('puts stuck learners first, then the least far along', () => {
    const order = orderLearners([
      { name: 'Ann', progressPercent: 80, stuck: null },
      { name: 'Ben', progressPercent: 20, stuck: null },
      { name: 'Cal', progressPercent: 50, stuck: { kind: 'idle', days: 8 } },
    ]);
    expect(order.map((l) => l.name)).toEqual(['Cal', 'Ben', 'Ann']);
  });
});
