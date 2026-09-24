import { describe, expect, it } from 'vitest';
import { redactStudent360ForRole } from '../student360-redaction.js';

const full = {
  student: { id: 's1' },
  academic: { termAverage: 71 },
  fees: { outstanding: 1200 },
  wallet: { balance: 35 },
  library: { borrowed: 1, overdue: 0 },
  parents: [{ userId: 'u1', name: 'Bongiwe Mthembu', relationship: 'mother' }],
};

describe('redactStudent360ForRole', () => {
  it("hides a learner's fees and wallet from their teacher", () => {
    const view = redactStudent360ForRole(full, 'teacher');
    expect(view).not.toHaveProperty('fees');
    expect(view).not.toHaveProperty('wallet');
    expect(view).toMatchObject({ student: { id: 's1' }, academic: { termAverage: 71 } });
  });

  it('keeps everything for school admins, and the parents list for teachers', () => {
    expect(redactStudent360ForRole(full, 'school_admin')).toEqual(full);
    expect(redactStudent360ForRole(full, 'teacher')).toHaveProperty('parents');
  });

  it("never shows a parent the other adults linked to their child", () => {
    const view = redactStudent360ForRole(full, 'parent');
    expect(view).not.toHaveProperty('parents');
    expect(view).toMatchObject({ fees: { outstanding: 1200 }, wallet: { balance: 35 } });
  });

  it('does not change the original object', () => {
    redactStudent360ForRole(full, 'teacher');
    expect(full).toHaveProperty('fees');
  });
});
