import { describe, expect, it } from 'vitest';
import { misfiledMarks } from '../audit-paper-marks-core.js';

describe('misfiledMarks', () => {
  it("finds marks filed under another class's paper assessment", () => {
    const found = misfiledMarks(
      { assessmentId: 'a1', paperId: 'p1', classId: 'cA' },
      [{ markId: 'm1', studentId: 's1', studentClassId: 'cA' }, { markId: 'm2', studentId: 's2', studentClassId: 'cB' }],
    );
    expect(found).toEqual([{ markId: 'm2', studentId: 's2', paperId: 'p1', filedUnderClassId: 'cA', belongsToClassId: 'cB' }]);
  });

  it('ignores learners whose class is unknown', () => {
    expect(misfiledMarks({ assessmentId: 'a1', paperId: 'p1', classId: 'cA' }, [{ markId: 'm1', studentId: 's1', studentClassId: null }])).toEqual([]);
  });
});
