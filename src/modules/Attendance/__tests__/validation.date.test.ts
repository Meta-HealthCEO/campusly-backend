import { describe, it, expect } from 'vitest';
import { bulkAttendanceSchema, recordAttendanceSchema } from '../validation.js';

const baseStudentId = '0123456789abcdef01234567';
const baseClassId = 'fedcba9876543210fedcba98';

describe('attendanceDateSchema accepts both date-only and ISO datetime', () => {
  it('accepts YYYY-MM-DD in bulk schema', () => {
    const parsed = bulkAttendanceSchema.safeParse({
      classId: baseClassId,
      date: '2026-05-15',
      period: 1,
      records: [{ studentId: baseStudentId, status: 'present' }],
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts ISO datetime in bulk schema (backward compat)', () => {
    const parsed = bulkAttendanceSchema.safeParse({
      classId: baseClassId,
      date: '2026-05-15T00:00:00.000Z',
      period: 1,
      records: [{ studentId: baseStudentId, status: 'present' }],
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts YYYY-MM-DD in single record schema', () => {
    const parsed = recordAttendanceSchema.safeParse({
      studentId: baseStudentId,
      classId: baseClassId,
      date: '2026-05-15',
      period: 1,
      status: 'present',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects malformed date strings', () => {
    expect(bulkAttendanceSchema.safeParse({
      classId: baseClassId,
      date: '2026-13-99',
      period: 1,
      records: [{ studentId: baseStudentId, status: 'present' }],
    }).success).toBe(false);

    expect(bulkAttendanceSchema.safeParse({
      classId: baseClassId,
      date: 'not-a-date',
      period: 1,
      records: [{ studentId: baseStudentId, status: 'present' }],
    }).success).toBe(false);
  });

  it('rejects future dates', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().slice(0, 10);
    expect(bulkAttendanceSchema.safeParse({
      classId: baseClassId,
      date: future,
      period: 1,
      records: [{ studentId: baseStudentId, status: 'present' }],
    }).success).toBe(false);
  });
});
