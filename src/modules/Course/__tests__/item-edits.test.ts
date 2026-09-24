import { describe, it, expect } from 'vitest';
import { checkNotesEdit, checkQuestionsEdit, checkStepsEdit, rewriteInstruction, REWRITE_ACTIONS, TRANSLATE_LANGUAGES } from '../item-edits.js';

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
