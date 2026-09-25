// src/scripts/__tests__/evidence-args.test.ts
//
// Brought forward from Task 9 (its reconcile.test.ts holds the same cases),
// because Task 12's evidence:seed-taxonomy needs the parser before L-A lands.
import { describe, expect, it } from 'vitest';
import { parseEvidenceArgs } from '../evidence-args.js';

describe('parseEvidenceArgs', () => {
  it('reads every flag', () => {
    const args = parseEvidenceArgs(['--apply', '--school=66f0c0ffee0000000000abcd', '--source=homework', '--since=2026-09-01', '--limit=50', '--direct', '--yes', '--retry-skipped-budget']);
    expect(args).toMatchObject({ apply: true, direct: true, yes: true, retrySkippedBudget: true, school: '66f0c0ffee0000000000abcd', source: 'homework', limit: 50 });
    expect(args.since?.toISOString()).toBe('2026-09-01T00:00:00.000Z');
    expect(parseEvidenceArgs([])).toMatchObject({ apply: false, direct: false });
  });

  it('reads the subject list and a grounding file (Task 12)', () => {
    expect(parseEvidenceArgs(['--subject=CAPS-MATH-GR12,CAPS-PHSC-GR12', '--grounding=nsc-2025.txt']))
      .toMatchObject({ subject: 'CAPS-MATH-GR12,CAPS-PHSC-GR12', grounding: 'nsc-2025.txt' });
  });

  it.each([['--school=abc', '--school needs a school id'], ['--source=gradebook', '--source must be one of'], ['--since=soon', '--since must be YYYY-MM-DD']])(
    '%s is refused, never widened', (flag, message) => {
      expect(() => parseEvidenceArgs([flag])).toThrow(message);
    },
  );
});
