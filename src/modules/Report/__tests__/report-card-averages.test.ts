import { describe, expect, it } from 'vitest';
import { applyTermWeightings } from '../services/report-card-averages.js';

const subject = (subjectId: string, weightedPercentage: number) => ({ subjectId, subjectName: subjectId, weightedPercentage });

describe('applyTermWeightings', () => {
  it("uses the gradebook's weighted average where the school has set weightings", () => {
    const { subjects } = applyTermWeightings(
      [subject('eng', 60), subject('ls', 80)],
      [{ subjectId: 'eng', missingWeighting: false }, { subjectId: 'ls', missingWeighting: true }],
      { eng: 72.345, ls: 90 },
    );
    expect(subjects[0]).toMatchObject({ subjectId: 'eng', weightedPercentage: 72.35, weightingSource: 'school' });
    expect(subjects[1]).toMatchObject({ subjectId: 'ls', weightedPercentage: 80, weightingSource: 'assessment' });
  });

  it('keeps its own number when the learner has no weighted average yet', () => {
    const { subjects } = applyTermWeightings([subject('eng', 60)], [{ subjectId: 'eng', missingWeighting: false }], { eng: null });
    expect(subjects[0]).toMatchObject({ weightedPercentage: 60, weightingSource: 'assessment' });
  });

  it('recomputes the overall average from the subjects it returns', () => {
    const { overallAverage } = applyTermWeightings(
      [subject('eng', 60), subject('maths', 70)],
      [{ subjectId: 'eng', missingWeighting: false }],
      { eng: 80 },
    );
    expect(overallAverage).toBe(75);
  });

  it('is zero with no subjects', () => {
    expect(applyTermWeightings([], [], {}).overallAverage).toBe(0);
  });
});
