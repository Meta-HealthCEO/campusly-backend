import { describe, it, expect } from 'vitest';
import {
  checkNotesEdit, checkQuestionsEdit, checkRewrittenBlocks, checkStepsEdit, mergeNotesBlocks, mergeStepsBlocks, questionsToRewrite,
  rewriteInstruction, REWRITE_ACTIONS, TRANSLATE_LANGUAGES,
} from '../item-edits.js';

describe('rewriteInstruction', () => {
  it('turns each action into a plain instruction for the AI', () => {
    expect(REWRITE_ACTIONS).toEqual(['regenerate', 'easier', 'harder', 'shorter', 'simpler_words', 'translate']);
    expect(rewriteInstruction('easier', { gradeName: 'Grade 1' })).toContain('easier for Grade 1');
    expect(rewriteInstruction('shorter', { gradeName: 'Grade 1' })).toContain('shorter');
    expect(rewriteInstruction('translate', { gradeName: 'Grade 1', language: 'zu' })).toContain('isiZulu');
  });

  it('needs a known language to translate', () => {
    expect(Object.keys(TRANSLATE_LANGUAGES)).toEqual(['af', 'zu', 'xh', 'st', 'tn']);
    expect(() => rewriteInstruction('translate', { gradeName: 'Grade 1' })).toThrow('Pick a language to translate into');
    expect(() => rewriteInstruction('translate', { gradeName: 'Grade 1', language: 'fr' })).toThrow('Pick a language to translate into');
  });
});

describe('checkNotesEdit', () => {
  it('keeps text blocks, trimmed, and refuses empty notes', () => {
    expect(checkNotesEdit([{ blockId: 'b1', type: 'text', content: '  Ten, twenty.  ' }])).toEqual([{ blockId: 'b1', type: 'text', content: 'Ten, twenty.' }]);
    expect(() => checkNotesEdit([{ blockId: 'b1', type: 'text', content: '   ' }])).toThrow('The notes are empty');
  });
});

describe('checkStepsEdit', () => {
  it('keeps steps with a title or content, and needs at least one', () => {
    expect(checkStepsEdit([{ title: 'Start', content: '47' }, { title: ' ', content: ' ' }])).toEqual([{ title: 'Start', content: '47' }]);
    expect(() => checkStepsEdit([])).toThrow('A worked example needs at least one step');
  });
});

describe('checkQuestionsEdit', () => {
  const q = (stem: string, options: Array<[string, boolean]>) => ({ stem, options: options.map(([text, isCorrect]) => ({ text, isCorrect })) });

  it('labels the options and keeps answerable questions', () => {
    expect(checkQuestionsEdit([q('What comes next? 10, 20, 30', [['40', true], ['50', false]])])).toEqual([
      { stem: 'What comes next? 10, 20, 30', options: [{ label: 'A', text: '40', isCorrect: true }, { label: 'B', text: '50', isCorrect: false }] },
    ]);
  });

  it('says what to fix, in plain words', () => {
    expect(() => checkQuestionsEdit([])).toThrow('Add at least one question');
    expect(() => checkQuestionsEdit([q('', [['a', true], ['b', false]])])).toThrow('Question 1 needs a question');
    expect(() => checkQuestionsEdit([q('Q', [['a', true]])])).toThrow('Question 1 needs at least 2 answer choices');
    expect(() => checkQuestionsEdit([q('Q', [['a', false], ['b', false]])])).toThrow('Question 1 needs exactly one right answer');
    expect(() => checkQuestionsEdit([q('Q', [['a', true], ['b', true]])])).toThrow('Question 1 needs exactly one right answer');
    expect(() => checkQuestionsEdit([q('Q', [['a', true], ['', false]])])).toThrow('Question 1 has an empty answer choice');
    expect(() => checkQuestionsEdit(Array.from({ length: 9 }, () => q('Q', [['a', true], ['b', false]])))).toThrow('A quick check has at most 8 questions');
  });
});

describe('saving edits keeps what the editor does not show', () => {
  const blocks = [
    { blockId: 't1', type: 'text', order: 0, content: 'Count in tens.' },
    { blockId: 'd1', type: 'image', order: 1, content: 'graph TD; A-->B', metadata: { renderer: 'mermaid' } },
    { blockId: 't2', type: 'text', order: 2, content: 'Try it.' },
    { blockId: 'q1', type: 'quiz', order: 3, content: 'What comes after 20?', points: 1 },
  ];

  it('updates text blocks in place and keeps the diagram and practice blocks where they were', () => {
    const merged = mergeNotesBlocks(blocks, [{ blockId: 't1', type: 'text', content: 'Count in tens: 10, 20.' }, { blockId: 't2', type: 'text', content: 'Try it.' }]);
    expect(merged.map((b) => [b.blockId, b.type, b.order])).toEqual([['t1', 'text', 0], ['d1', 'image', 1], ['t2', 'text', 2], ['q1', 'quiz', 3]]);
    expect(merged[0].content).toBe('Count in tens: 10, 20.');
    expect(merged[1]).toMatchObject({ metadata: { renderer: 'mermaid' } });
  });

  it('drops a text block the teacher removed and puts a new one after the one before it', () => {
    const merged = mergeNotesBlocks(blocks, [{ blockId: 't1', type: 'text', content: 'Count in tens.' }, { blockId: 'new', type: 'text', content: 'Well done!' }]);
    expect(merged.map((b) => b.blockId)).toEqual(['t1', 'new', 'd1', 'q1']);
    expect(merged.map((b) => b.order)).toEqual([0, 1, 2, 3]);
  });

  it('changes only the steps of a worked example', () => {
    const worked = [
      { blockId: 'p', type: 'text', order: 0, content: 'A taxi has 47 passengers.' },
      { blockId: 's', type: 'step_reveal', order: 1, content: JSON.stringify({ steps: [{ title: 'Old', content: 'x' }] }) },
      { blockId: 'f', type: 'fill_blank', order: 2, content: '47 + 3 = ___' },
    ];
    const merged = mergeStepsBlocks(worked, [{ title: 'Start at 47', content: 'Say 47.' }]);
    expect(merged.map((b) => b.blockId)).toEqual(['p', 's', 'f']);
    expect(JSON.parse(merged[1].content).steps).toEqual([{ title: 'Start at 47', content: 'Say 47.' }]);
  });

  it('adds the steps when a worked example has none', () => {
    const merged = mergeStepsBlocks([{ blockId: 'p', type: 'text', order: 0, content: 'A taxi.' }], [{ title: 'One', content: '1' }]);
    expect(merged.map((b) => b.type)).toEqual(['text', 'step_reveal']);
  });
});

describe('checkRewrittenBlocks', () => {
  it('refuses an empty or unusable rewrite', () => {
    expect(() => checkRewrittenBlocks('notes', [])).toThrow("The AI's version came back incomplete");
    expect(() => checkRewrittenBlocks('worked_example', [{ blockId: 'a', type: 'text', order: 0, content: 'Hi' }])).toThrow("The AI's version came back incomplete");
    expect(() => checkRewrittenBlocks('worked_example', [{ blockId: 'a', type: 'step_reveal', order: 0, content: '{"steps":[' }])).toThrow("The AI's version came back incomplete");
  });

  it('accepts notes with text and a worked example with steps', () => {
    expect(() => checkRewrittenBlocks('notes', [{ blockId: 'a', type: 'text', order: 0, content: 'Hi' }])).not.toThrow();
    expect(() => checkRewrittenBlocks('worked_example', [{ blockId: 'a', type: 'step_reveal', order: 0, content: JSON.stringify({ steps: [{ title: 'One', content: '1' }] }) }])).not.toThrow();
  });
});

describe('questionsToRewrite', () => {
  it('lists the current questions and marks the right answer, so a rewrite transforms them', () => {
    expect(questionsToRewrite([{ stem: 'What comes after 29?', options: [{ text: '30', isCorrect: true }, { text: '28', isCorrect: false }] }]))
      .toBe('1. What comes after 29? Choices: 30 (right), 28');
  });
});
