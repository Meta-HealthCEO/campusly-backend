import { describe, it, expect } from 'vitest';
import { canCopyFrom, copyTitle, libraryEntry } from '../unit-copy.js';

describe('copyTitle', () => {
  it('keeps the title, and moves it to the new term', () => {
    expect(copyTitle('Numbers to 99 · Grade 1 Mathematics · Term 3', 3, 3)).toBe('Numbers to 99 · Grade 1 Mathematics · Term 3');
    expect(copyTitle('Numbers to 99 · Grade 1 Mathematics · Term 3', 4, 3)).toBe('Numbers to 99 · Grade 1 Mathematics · Term 4');
    expect(copyTitle('Fractions', 2, 1)).toBe('Fractions · Term 2');
  });
});

describe('canCopyFrom', () => {
  const unit = { kind: 'class_unit', status: 'draft', outlineStatus: 'approved' };

  it('lets anyone in the school copy a released unit', () => {
    expect(canCopyFrom({ ...unit, status: 'published' }, false)).toEqual({ ok: true });
  });

  it("lets the unit's own teacher copy it once the outline is approved", () => {
    expect(canCopyFrom(unit, true)).toEqual({ ok: true });
    expect(canCopyFrom({ ...unit, outlineStatus: 'drafted' }, true)).toEqual({ ok: false, reason: 'Approve the outline before copying this unit.' });
  });

  it("refuses someone else's unreleased unit, and catalogue courses", () => {
    expect(canCopyFrom(unit, false)).toEqual({ ok: false, reason: 'Only released units can be copied.' });
    expect(canCopyFrom({ ...unit, kind: 'catalogue', status: 'published' }, true)).toEqual({ ok: false, reason: 'Only class units can be copied.' });
  });
});

describe('libraryEntry', () => {
  it('describes a released unit for the school library', () => {
    const entry = libraryEntry(
      { _id: 'c1', title: 'Numbers to 99', createdBy: 'u1', publishedAt: new Date('2026-09-20T08:00:00Z'), scope: { termNumber: 3, gradeId: 'g1' } },
      { gradeName: 'Grade 1', subjectName: 'Mathematics', authorName: 'Thandi Molefe', items: 6, minutes: 37, viewerId: 'u1' },
    );
    expect(entry).toEqual({
      id: 'c1', title: 'Numbers to 99', gradeId: 'g1', gradeName: 'Grade 1', subjectName: 'Mathematics', termNumber: 3,
      authorName: 'Thandi Molefe', items: 6, minutes: 37, releasedAt: '2026-09-20T08:00:00.000Z', mine: true,
    });
    expect(libraryEntry({ _id: 'c1', title: 'x', createdBy: 'u2', publishedAt: null, scope: null }, { gradeName: '', subjectName: '', authorName: '', items: 0, minutes: 0, viewerId: 'u1' }))
      .toMatchObject({ mine: false, releasedAt: null, termNumber: null, gradeId: null });
  });
});
