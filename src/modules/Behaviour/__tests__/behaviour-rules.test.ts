import { describe, it, expect } from 'vitest';
import { behaviourSummary, checkEntry, timeline, BEHAVIOUR_CATEGORIES } from '../behaviour-rules.js';

describe('checkEntry', () => {
  it('signs points by kind: merits add, demerits take away, incidents carry none', () => {
    expect(checkEntry({ kind: 'merit', category: 'kindness', points: 2 })).toEqual({ kind: 'merit', category: 'kindness', points: 2, severity: null, note: '' });
    expect(checkEntry({ kind: 'demerit', category: 'late', note: 'Late after break.' })).toEqual({ kind: 'demerit', category: 'late', points: -1, severity: 'low', note: 'Late after break.' });
    expect(checkEntry({ kind: 'incident', category: 'fighting', points: 3, note: 'Pushed a learner.' })).toMatchObject({ points: 0, severity: 'medium' });
  });

  it('refuses what it cannot record, in plain words', () => {
    expect(() => checkEntry({ kind: 'praise', category: 'kindness' })).toThrow('Pick merit, demerit or incident.');
    expect(() => checkEntry({ kind: 'merit', category: 'late' })).toThrow('Pick what the merit is for.');
    expect(() => checkEntry({ kind: 'demerit', category: 'late', note: '  ' })).toThrow('Say briefly what happened.');
    expect(() => checkEntry({ kind: 'merit', category: 'effort', points: 9 })).toThrow('Points are from 1 to 5.');
    expect(() => checkEntry({ kind: 'incident', category: 'bullying', note: 'x', severity: 'extreme' })).toThrow('Pick how serious it was: low, medium or high.');
  });

  it('offers categories for each kind', () => {
    expect(BEHAVIOUR_CATEGORIES.merit.map((c) => c.value)).toContain('kindness');
    expect(BEHAVIOUR_CATEGORIES.demerit.map((c) => c.value)).toContain('late');
    expect(BEHAVIOUR_CATEGORIES.incident.map((c) => c.value)).toContain('bullying');
  });
});

describe('behaviourSummary', () => {
  it('counts each kind and nets the points', () => {
    expect(behaviourSummary([
      { kind: 'merit', points: 2 }, { kind: 'merit', points: 1 }, { kind: 'demerit', points: -1 }, { kind: 'incident', points: 0 },
    ])).toEqual({ merits: 2, demerits: 1, incidents: 1, net: 2 });
  });
});

describe('timeline', () => {
  it('puts behaviour and referrals in one list, newest first, in plain words', () => {
    const items = timeline(
      [
        { id: 'e1', kind: 'merit', category: 'kindness', points: 2, note: 'Helped a friend.', occurredAt: new Date('2026-09-20T09:00:00Z'), loggedByName: 'Thandi Molefe' },
        { id: 'e2', kind: 'demerit', category: 'late', points: -1, note: 'Late after break.', occurredAt: new Date('2026-09-22T11:00:00Z'), loggedByName: 'Thandi Molefe' },
      ],
      [{ id: 'r1', reason: 'emotional', status: 'in_progress', createdAt: new Date('2026-09-21T08:00:00Z') }],
    );
    expect(items.map((i) => [i.id, i.kind, i.label])).toEqual([
      ['e2', 'demerit', 'Demerit −1 · Late'],
      ['r1', 'referral', 'Referred to the counsellor · Emotional'],
      ['e1', 'merit', 'Merit +2 · Kindness'],
    ]);
    expect(items[0]).toMatchObject({ detail: 'Late after break.', by: 'Thandi Molefe', at: '2026-09-22T11:00:00.000Z' });
    expect(items[1]).toMatchObject({ detail: 'In progress' });
  });
});
