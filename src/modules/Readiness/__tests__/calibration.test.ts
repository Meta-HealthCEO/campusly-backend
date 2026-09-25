// src/modules/Readiness/__tests__/calibration.test.ts
import { describe, expect, it } from 'vitest';
import { calibrate, testCoverage } from '../calibration.js';

describe('calibration (spec §11)', () => {
  it('measures how much of a paper a test covered, by the marks of the topics it hit', () => {
    const marks = new Map([['P1.FUNC', 40], ['P1.CALC', 35], ['P1.PROB', 25]]);
    expect(testCoverage(marks, new Set(['P1.FUNC', 'P1.CALC']), 100)).toBe(0.75);
    expect(testCoverage(marks, new Set(['P1.FUNC', 'P1.CALC', 'P1.PROB']), 100)).toBe(1);
  });

  it('counts marks inside the band predicted the day before; tests with no band are not counted', () => {
    expect(calibrate([{ percent: 55, band: { low: 50, high: 60 } }, { percent: 70, band: { low: 50, high: 60 } }, { percent: 40, band: null }]))
      .toEqual({ tests: 2, inside: 1, share: 0.5 });
    expect(calibrate([])).toEqual({ tests: 0, inside: 0, share: null });
  });
});
