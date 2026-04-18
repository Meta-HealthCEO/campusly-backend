import {
  AgeGroupBenchmark,
  scoreAgainstBenchmark,
  type IAgeGroupBenchmark,
  type AgeGroup,
} from './model-benchmark.js';
import { FitnessTestResult, BiometricMeasurement } from './model-fitness.js';
import { Student } from '../Student/model.js';
import { Types } from 'mongoose';

export interface PlayerFitnessSnapshot {
  ageGroup: AgeGroup;
  bmi?: number;
  /** Map of testType → most recent value */
  latest: Record<string, { value: number; unit: string; date: Date }>;
  /** Map of testType → benchmark-driven score (0-99) */
  scores: Record<string, number>;
}

function ageToGroup(age: number | null): AgeGroup {
  if (age == null) return 'Open';
  if (age <= 11) return 'U11';
  if (age <= 13) return 'U13';
  if (age <= 15) return 'U15';
  if (age <= 17) return 'U17';
  if (age <= 19) return 'U19';
  return 'Open';
}

function calcAge(dob: Date | undefined | null): number | null {
  if (!dob) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

export class BenchmarkService {
  static async list(filters: {
    schoolId?: string;
    sportCode?: string;
    ageGroup?: string;
  } = {}): Promise<IAgeGroupBenchmark[]> {
    const query: Record<string, unknown> = { isDeleted: false };
    if (filters.sportCode) query.sportCode = filters.sportCode.toLowerCase();
    if (filters.ageGroup) query.ageGroup = filters.ageGroup;
    if (filters.schoolId) {
      query.$or = [{ schoolId: filters.schoolId }, { schoolId: null, isDefault: true }];
    } else {
      query.isDefault = true;
    }
    return AgeGroupBenchmark.find(query).sort({ sportCode: 1, ageGroup: 1, testType: 1 }).lean();
  }

  /**
   * Pick the right benchmark for a given test in a given context.
   * Prefers school-specific over default; falls back to next-older age group if exact missing.
   */
  static async findBenchmark(
    sportCode: string,
    ageGroup: AgeGroup,
    testType: string,
    schoolId?: string,
  ): Promise<IAgeGroupBenchmark | null> {
    const groupOrder: AgeGroup[] = ['U11', 'U13', 'U15', 'U17', 'U19', 'Open'];
    const idx = groupOrder.indexOf(ageGroup);
    const groupsToTry = idx >= 0 ? groupOrder.slice(idx) : ['Open' as AgeGroup];

    for (const g of groupsToTry) {
      const filters: Record<string, unknown> = {
        sportCode: sportCode.toLowerCase(),
        ageGroup: g,
        testType,
        isDeleted: false,
      };
      if (schoolId) {
        const own = await AgeGroupBenchmark.findOne({ ...filters, schoolId });
        if (own) return own;
      }
      const def = await AgeGroupBenchmark.findOne({ ...filters, schoolId: null, isDefault: true });
      if (def) return def;
    }
    return null;
  }

  /**
   * Build a snapshot of a player's most recent test scores, normalized 0-99 via benchmarks.
   */
  static async snapshotForPlayer(
    studentId: string,
    schoolId: string,
    sportCode: string,
  ): Promise<PlayerFitnessSnapshot> {
    const student = await Student.findOne({
      _id: studentId, schoolId, isDeleted: false,
    }).select('dateOfBirth').lean();

    const age = calcAge(student?.dateOfBirth);
    const ageGroup = ageToGroup(age);

    // Pick latest value per testType
    const tests = await FitnessTestResult.find({
      schoolId: new Types.ObjectId(schoolId),
      studentId: new Types.ObjectId(studentId),
      isDeleted: false,
    }).sort({ date: -1 }).lean();

    const latest: PlayerFitnessSnapshot['latest'] = {};
    for (const t of tests) {
      if (!latest[t.testType]) {
        latest[t.testType] = { value: t.value, unit: t.unit, date: t.date };
      }
    }

    const scores: Record<string, number> = {};
    for (const [testType, rec] of Object.entries(latest)) {
      const bench = await this.findBenchmark(sportCode, ageGroup, testType, schoolId);
      if (bench) {
        scores[testType] = scoreAgainstBenchmark(rec.value, bench);
      }
    }

    // BMI from latest biometric
    const latestBio = await BiometricMeasurement.findOne({
      schoolId: new Types.ObjectId(schoolId),
      studentId: new Types.ObjectId(studentId),
      isDeleted: false,
    }).sort({ date: -1 }).lean();
    let bmi: number | undefined;
    if (latestBio?.weightKg && latestBio?.heightCm) {
      const m = latestBio.heightCm / 100;
      bmi = Math.round((latestBio.weightKg / (m * m)) * 10) / 10;
    }

    return { ageGroup, bmi, latest, scores };
  }
}
