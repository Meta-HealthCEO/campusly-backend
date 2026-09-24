import { describe, it, expect } from 'vitest';
import { normaliseOutline, buildOutlinePrompt, type OutlineTopic } from '../outline.js';

const topics: OutlineTopic[] = [
  { id: 't1', title: 'Numbers, Operations and Relationships', description: 'Count to 99', capsReference: 'NOR', weekNumbers: [1, 2, 3] },
  { id: 't2', title: 'Patterns', description: 'Number patterns', capsReference: '', weekNumbers: [4] },
];

describe('normaliseOutline', () => {
  it('maps modules to their CAPS topic and clamps items', () => {
    const out = normaliseOutline({ modules: [
      { title: ' Counting to 99 ', topicIndex: 1, objectives: ['Count forwards', 3], items: [
        { kind: 'notes', title: 'Counting in tens', minutes: 14, objectives: ['a'], brief: 'Tens' },
        { kind: 'quick_check', title: 'Check', minutes: 2, objectives: [], brief: '' },
        { kind: 'video', title: 'Nope', minutes: 5 },
      ] },
      { title: 'Patterns', topicIndex: 2, items: [{ kind: 'worked_example', title: 'Extend a pattern' }] },
    ] }, topics);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ title: 'Counting to 99', curriculumNodeId: 't1', weekNumbers: [1, 2, 3], objectives: ['Count forwards'] });
    expect(out[0].items.map((i) => [i.kind, i.minutes, i.capsRef])).toEqual([['notes', 10, 'NOR'], ['quick_check', 5, 'NOR']]);
    expect(out[1].items[0]).toMatchObject({ kind: 'worked_example', minutes: 8, capsRef: 'Patterns' });
  });

  it('drops modules that point at no topic, and caps sizes', () => {
    const many = Array.from({ length: 9 }, (_, i) => ({
      title: `M${i}`, topicIndex: 1,
      items: Array.from({ length: 8 }, (_, j) => ({ kind: 'notes', title: `I${j}` })),
    }));
    const out = normaliseOutline({ modules: [{ title: 'Ghost', topicIndex: 7, items: [{ kind: 'notes', title: 'x' }] }, ...many] }, topics);
    expect(out).toHaveLength(8);
    expect(out[0].title).toBe('M0');
    expect(out[0].items).toHaveLength(6);
  });

  it('refuses an empty outline in plain words', () => {
    expect(() => normaliseOutline({ modules: [] }, topics)).toThrow('The AI outline came back empty. Try again.');
    expect(() => normaliseOutline('nonsense', topics)).toThrow('The AI outline came back empty. Try again.');
    expect(() => normaliseOutline({ modules: [{ title: 'No items', topicIndex: 1, items: [] }] }, topics))
      .toThrow('The AI outline came back empty. Try again.');
  });
});

describe('buildOutlinePrompt', () => {
  it('numbers the CAPS topics so the AI can point at them', () => {
    const { user, system } = buildOutlinePrompt({ subjectName: 'Mathematics', gradeName: 'Grade 1', termNumber: 3 }, topics);
    expect(user).toContain('1. Numbers, Operations and Relationships');
    expect(user).toContain('2. Patterns');
    expect(user).toContain('Grade 1 Mathematics, Term 3');
    expect(system).toContain('JSON');
  });
});
