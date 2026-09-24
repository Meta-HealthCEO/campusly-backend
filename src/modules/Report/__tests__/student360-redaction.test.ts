import { describe, expect, it } from 'vitest';
import { redactStudent360ForRole } from '../student360-redaction.js';

const full = {
  student: { id: 's1' },
  academic: { termAverage: 71 },
  fees: { outstanding: 1200 },
  wallet: { balance: 35 },
  library: { borrowed: 1, overdue: 0 },
};

describe('redactStudent360ForRole', () => {
  it("hides a learner's fees and wallet from their teacher", () => {
    const view = redactStudent360ForRole(full, 'teacher');
    expect(view).not.toHaveProperty('fees');
    expect(view).not.toHaveProperty('wallet');
    expect(view).toMatchObject({ student: { id: 's1' }, academic: { termAverage: 71 } });
  });

  it('keeps everything for parents and school admins', () => {
    expect(redactStudent360ForRole(full, 'parent')).toEqual(full);
    expect(redactStudent360ForRole(full, 'school_admin')).toEqual(full);
  });

  it('does not change the original object', () => {
    redactStudent360ForRole(full, 'teacher');
    expect(full).toHaveProperty('fees');
  });
});
