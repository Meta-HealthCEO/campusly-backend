// src/modules/Readiness/calibration.ts
//
// Is the band honest? (spec §11): for each marked test covering ≥ 80% of a paper by topic marks, whether the mark
// fell inside the band predicted the day before. Pure.
export function testCoverage(topicMarks: ReadonlyMap<string, number>, hitTopics: ReadonlySet<string>, totalMarks: number): number {
  let covered = 0;
  for (const key of hitTopics) covered += topicMarks.get(key) ?? 0;
  return totalMarks > 0 ? covered / totalMarks : 0;
}

export function calibrate(results: ReadonlyArray<{ percent: number; band: { low: number; high: number } | null }>): { tests: number; inside: number; share: number | null } {
  const counted = results.filter((r): r is { percent: number; band: { low: number; high: number } } => r.band !== null);
  const inside = counted.filter((r) => r.percent >= r.band.low && r.percent <= r.band.high).length;
  return { tests: counted.length, inside, share: counted.length === 0 ? null : inside / counted.length };
}
