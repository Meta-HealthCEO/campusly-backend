// src/modules/AITutor/__tests__/tutor-request.test.ts
import { describe, expect, it } from 'vitest';
import { MAX_CONTEXT_MESSAGES, buildTutorRequest } from '../tutor-request.js';
import type { TutorPromptContext } from '../prompts.js';

const ctx = (over: Partial<TutorPromptContext> = {}): TutorPromptContext => ({
  grade: 10, subjectName: 'Mathematics', marksSummary: 'Algebra test: 14/20 (70%)', surfaceContext: 'The student is currently on a homework page.', ...over,
});
const turns = (n: number) => Array.from({ length: n }, (_, i) => ({ role: (i % 2 === 0 ? 'student' : 'assistant') as 'student' | 'assistant', content: `turn ${i}` }));
const withoutCache = (v: unknown) => JSON.parse(JSON.stringify(v, (k, val) => (k === 'cache_control' ? undefined : val)));

describe('buildTutorRequest (ruling R19)', () => {
  it('puts the fixed instructions first, cached, with nothing about this learner in them', () => {
    const req = buildTutorRequest('chat', ctx(), [], 'What is slope?');
    expect(req.system[0]).toMatchObject({ type: 'text', cache_control: { type: 'ephemeral' } });
    expect(req.system[0]?.text).not.toContain('Algebra test');
    expect(req.system[0]?.text).not.toContain('Grade 10');
    expect(req.system[1]?.text).toContain('Grade 10 Mathematics');
    expect(buildTutorRequest('chat', ctx({ grade: 7, subjectName: 'English' }), [], 'x').system[0]).toEqual(req.system[0]);
  });

  it("puts this turn's context and the learner's words in the last user message, not in system", () => {
    const req = buildTutorRequest('chat', ctx(), turns(2), 'What is slope?');
    const last = req.messages.at(-1)!;
    expect(last.role).toBe('user');
    expect(JSON.stringify(last.content)).toContain('Algebra test: 14/20');
    expect(JSON.stringify(last.content)).toContain('What is slope?');
    expect(JSON.stringify(req.system)).not.toContain('Algebra test');
  });

  it('caches the history at its last block and keeps only the last 20 messages', () => {
    const req = buildTutorRequest('chat', ctx(), turns(30), 'Next?');
    expect(req.messages).toHaveLength(MAX_CONTEXT_MESSAGES + 1);
    const lastHistory = req.messages[MAX_CONTEXT_MESSAGES - 1]!;
    expect(lastHistory.content).toEqual([{ type: 'text', text: 'turn 29', cache_control: { type: 'ephemeral' } }]);
  });

  it("repeats the previous turn's prefix byte for byte, even when marks and page change", () => {
    const first = buildTutorRequest('homework_help', ctx(), turns(4), 'Hint please');
    const second = buildTutorRequest('homework_help', ctx({ marksSummary: 'New mark: 18/20', surfaceContext: 'Another page.' }),
      [...turns(4), { role: 'student', content: 'Hint please' }, { role: 'assistant', content: 'Try factorising.' }], 'And now?');
    expect(withoutCache(second.system)).toEqual(withoutCache(first.system));
    expect(withoutCache(second.messages.slice(0, 4))).toEqual(withoutCache(first.messages.slice(0, 4)));
  });

  it('keeps the no-answers rule in system while an assessment is active', () => {
    const req = buildTutorRequest('homework_help', ctx({ isAssessmentActive: true }), [], 'Answer?');
    expect(req.system[1]?.text).toContain('Do not reveal the final answer');
  });
});
