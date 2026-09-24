// src/modules/Report/services/report-card-averages.ts
//
// A report card should show the same subject averages as the gradebook.
// Where the school has set weightings for a subject, the term summary's
// weighted average wins; otherwise the report card keeps its own
// per-assessment-weight average.

export interface ReportSubjectSummary {
  subjectId: string;
  weightedPercentage: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function applyTermWeightings<T extends ReportSubjectSummary>(
  subjects: T[],
  termSubjects: Array<{ subjectId: string; missingWeighting: boolean }>,
  studentAverages: Record<string, number | null>,
): { subjects: Array<T & { weightingSource: 'school' | 'assessment' }>; overallAverage: number } {
  const weighted = new Set(termSubjects.filter((s) => !s.missingWeighting).map((s) => s.subjectId));
  const result = subjects.map((subject) => {
    const average = studentAverages[subject.subjectId];
    if (weighted.has(subject.subjectId) && average !== null && average !== undefined) {
      return { ...subject, weightedPercentage: round2(average), weightingSource: 'school' as const };
    }
    return { ...subject, weightingSource: 'assessment' as const };
  });
  const overallAverage = result.length > 0
    ? round2(result.reduce((sum, s) => sum + s.weightedPercentage, 0) / result.length)
    : 0;
  return { subjects: result, overallAverage };
}
