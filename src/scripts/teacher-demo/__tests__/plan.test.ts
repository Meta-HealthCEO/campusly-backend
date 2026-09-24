import { describe, expect, it } from 'vitest';
import { DEMO_PERIODS, demoDates, planWeek } from '../plan.js';

const pairs = [
  { classId: 'g1a', subjectId: 'english', homeroom: true },
  { classId: 'g1a', subjectId: 'maths', homeroom: true },
  { classId: 'gra', subjectId: 'maths', homeroom: false },
  { classId: 'gra', subjectId: 'lifeskills', homeroom: false },
];

describe('planWeek', () => {
  const week = planWeek(pairs);

  it('fills every period of every school day', () => {
    expect(week).toHaveLength(5 * DEMO_PERIODS.length);
    expect(new Set(week.map((s) => s.day))).toEqual(new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']));
  });

  it("starts each day with the homeroom class, so there's a register to take", () => {
    for (const slot of week.filter((s) => s.period === 1)) expect(slot.classId).toBe('g1a');
  });

  it('never double-books a class in the same period (the timetable unique index)', () => {
    const keys = week.map((s) => `${s.classId}:${s.day}:${s.period}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('teaches every class and subject pair at least once a week', () => {
    for (const p of pairs) expect(week.some((s) => s.classId === p.classId && s.subjectId === p.subjectId)).toBe(true);
  });

  it('is the same every run (idempotent seeding)', () => {
    expect(planWeek(pairs)).toEqual(week);
  });
});

describe('demoDates', () => {
  it('works from the local school day', () => {
    const d = demoDates(new Date(2026, 8, 24, 7, 30));
    expect(d.weekday).toBe('thursday');
    expect(d.registerDate.toISOString()).toBe('2026-09-24T00:00:00.000Z');
    expect(d.dueToday.getDate()).toBe(24);
    expect(d.overdue.getDate()).toBe(22);
    expect(d.dueSoon.getDate()).toBe(27);
  });

  it('has no school weekday at the weekend', () => {
    expect(demoDates(new Date(2026, 8, 26, 9, 0)).weekday).toBeNull();
  });

  it('places a lesson at a period start on the given day', () => {
    const d = demoDates(new Date(2026, 8, 24, 7, 30));
    const at = d.atPeriod(d.today, 2);
    expect([at.getHours(), at.getMinutes()]).toEqual([8, 30]);
  });
});
