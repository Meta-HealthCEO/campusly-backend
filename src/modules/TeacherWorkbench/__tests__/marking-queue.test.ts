import { describe, expect, it } from 'vitest';
import { calcPriority, paperQueueItems, type PaperClassInput } from '../services/marking-queue.js';

const now = new Date('2026-09-24T10:00:00+02:00');
const day = 24 * 60 * 60 * 1000;
const base = (over: Partial<PaperClassInput>): PaperClassInput => ({
  paperId: 'p1', title: 'Term 3 maths test', subjectName: 'Mathematics', totalMarks: 30,
  classId: 'c1', className: 'Grade 1 - A', mode: 'paper', dueAt: new Date(now.getTime() - day),
  students: [
    { studentId: 's1', submissionStatus: null, markingStatus: null },
    { studentId: 's2', submissionStatus: null, markingStatus: 'published' },
    { studentId: 's3', submissionStatus: null, markingStatus: 'completed' },
  ],
  ...over,
});

describe('paperQueueItems', () => {
  it('counts every learner without an issued mark once a handwritten paper has been written', () => {
    const [item] = paperQueueItems([base({})], now);
    expect(item).toMatchObject({
      id: 'paper:p1:c1', type: 'paper', pendingCount: 2, totalCount: 3, paperId: 'p1', classId: 'c1',
      href: '/teacher/papers/p1?tab=marking&classId=c1', priority: 'high',
    });
  });

  it('leaves a handwritten paper out until its due date', () => {
    expect(paperQueueItems([base({ dueAt: new Date(now.getTime() + 2 * day) })], now)).toEqual([]);
  });

  it('treats a handwritten paper with no due date as written', () => {
    expect(paperQueueItems([base({ dueAt: null })], now)[0].pendingCount).toBe(2);
  });

  it('counts only learners who submitted a digital paper and have no issued mark', () => {
    const [item] = paperQueueItems([base({
      mode: 'digital',
      students: [
        { studentId: 's1', submissionStatus: 'in_progress', markingStatus: null },
        { studentId: 's2', submissionStatus: 'submitted', markingStatus: null },
        { studentId: 's3', submissionStatus: 'graded', markingStatus: 'completed' },
        { studentId: 's4', submissionStatus: 'graded', markingStatus: 'published' },
      ],
    })], now);
    expect(item.pendingCount).toBe(2);
    expect(item.totalCount).toBe(4);
  });

  it('drops a class with nothing left to mark', () => {
    const done = base({ students: [{ studentId: 's1', submissionStatus: null, markingStatus: 'published' }] });
    expect(paperQueueItems([done], now)).toEqual([]);
  });

  it('gives each class of a shared paper its own item', () => {
    const items = paperQueueItems([base({}), base({ classId: 'c2', className: 'Grade 1 - B' })], now);
    expect(items.map((i) => i.id)).toEqual(['paper:p1:c1', 'paper:p1:c2']);
  });
});

describe('calcPriority', () => {
  it('is high inside a day (including overdue), medium inside three, else low', () => {
    expect(calcPriority(new Date(now.getTime() - day), now)).toBe('high');
    expect(calcPriority(new Date(now.getTime() + 2 * day), now)).toBe('medium');
    expect(calcPriority(new Date(now.getTime() + 5 * day), now)).toBe('low');
    expect(calcPriority(null, now)).toBe('low');
  });
});
