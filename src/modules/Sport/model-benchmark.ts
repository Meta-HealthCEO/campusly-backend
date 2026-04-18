import mongoose, { Schema, Document, Types } from 'mongoose';

export const AGE_GROUPS = ['U11', 'U13', 'U15', 'U17', 'U19', 'Open'] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const BENCHMARK_DIRECTIONS = ['lower_is_better', 'higher_is_better'] as const;
export type BenchmarkDirection = (typeof BENCHMARK_DIRECTIONS)[number];

/**
 * A benchmark defines how a raw fitness-test value maps to a 0–99 attribute score.
 * Four cutoffs define tier thresholds; values between cutoffs are linearly interpolated.
 *
 * Example — U15 Soccer 40m sprint (lower_is_better):
 *   eliteValue = 5.0s  (→ score 95)
 *   goldValue  = 5.5s  (→ score 80)
 *   silverValue = 6.0s (→ score 60)
 *   bronzeValue = 7.0s (→ score 35)
 *
 * A value better than `eliteValue` clamps at 99; worse than `bronzeValue` clamps at 10.
 */
export interface IAgeGroupBenchmark extends Document {
  schoolId?: Types.ObjectId | null;
  sportCode: string;
  ageGroup: AgeGroup;
  testType: string;
  unit: string;
  direction: BenchmarkDirection;
  eliteValue: number;
  goldValue: number;
  silverValue: number;
  bronzeValue: number;
  attributeKey?: string;
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const benchmarkSchema = new Schema<IAgeGroupBenchmark>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null },
    sportCode: { type: String, required: true, trim: true, lowercase: true },
    ageGroup: { type: String, enum: AGE_GROUPS, required: true },
    testType: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    direction: { type: String, enum: BENCHMARK_DIRECTIONS, required: true },
    eliteValue: { type: Number, required: true },
    goldValue: { type: Number, required: true },
    silverValue: { type: Number, required: true },
    bronzeValue: { type: Number, required: true },
    attributeKey: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

benchmarkSchema.index(
  { schoolId: 1, sportCode: 1, ageGroup: 1, testType: 1 },
  { unique: true },
);

export const AgeGroupBenchmark = mongoose.model<IAgeGroupBenchmark>(
  'AgeGroupBenchmark',
  benchmarkSchema,
);

/**
 * Convert a raw test value to a 0–99 score using a benchmark's four cutoffs.
 * Linear interpolation between bronze→silver→gold→elite, clamped at the ends.
 */
export function scoreAgainstBenchmark(
  rawValue: number,
  benchmark: Pick<IAgeGroupBenchmark,
    'direction' | 'eliteValue' | 'goldValue' | 'silverValue' | 'bronzeValue'>,
): number {
  const ELITE = 95, GOLD = 80, SILVER = 60, BRONZE = 35, FLOOR = 10;
  const better = benchmark.direction === 'higher_is_better'
    ? (a: number, b: number) => a >= b
    : (a: number, b: number) => a <= b;

  const lerp = (
    val: number, lo: number, hi: number, scoreLo: number, scoreHi: number,
  ): number => {
    if (lo === hi) return scoreHi;
    const t = (val - lo) / (hi - lo);
    return scoreLo + t * (scoreHi - scoreLo);
  };

  if (better(rawValue, benchmark.eliteValue)) return Math.min(99, ELITE + 4);
  if (better(rawValue, benchmark.goldValue)) {
    return Math.round(lerp(rawValue, benchmark.goldValue, benchmark.eliteValue, GOLD, ELITE));
  }
  if (better(rawValue, benchmark.silverValue)) {
    return Math.round(lerp(rawValue, benchmark.silverValue, benchmark.goldValue, SILVER, GOLD));
  }
  if (better(rawValue, benchmark.bronzeValue)) {
    return Math.round(lerp(rawValue, benchmark.bronzeValue, benchmark.silverValue, BRONZE, SILVER));
  }
  // Worse than bronze threshold — degrade smoothly toward floor.
  return Math.max(FLOOR, BRONZE - 5);
}
