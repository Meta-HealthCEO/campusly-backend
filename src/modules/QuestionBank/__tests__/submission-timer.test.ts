import { describe, it, expect } from 'vitest';
import { isPastHardTimeLimit } from '../service-submissions-student.js';

const T0 = Date.parse('2026-07-27T08:00:00.000Z');
const MIN = 60_000;

describe('isPastHardTimeLimit', () => {
  it('allows saves within the paper duration', () => {
    expect(isPastHardTimeLimit(new Date(T0), 60, T0 + 45 * MIN)).toBe(false);
  });

  it('allows saves inside the grace window after time expires', () => {
    // 60min paper + default 10min grace → 65min elapsed is still allowed
    expect(isPastHardTimeLimit(new Date(T0), 60, T0 + 65 * MIN)).toBe(false);
  });

  it('rejects saves after duration plus grace', () => {
    expect(isPastHardTimeLimit(new Date(T0), 60, T0 + 71 * MIN)).toBe(true);
  });

  it('boundary: exactly at duration + grace is still allowed', () => {
    expect(isPastHardTimeLimit(new Date(T0), 60, T0 + 70 * MIN)).toBe(false);
  });

  it('treats a missing startedAt as untimed (never expires)', () => {
    expect(isPastHardTimeLimit(undefined, 60, T0 + 500 * MIN)).toBe(false);
  });

  it('treats a non-positive duration as untimed (never expires)', () => {
    expect(isPastHardTimeLimit(new Date(T0), 0, T0 + 500 * MIN)).toBe(false);
  });
});
