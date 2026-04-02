import { StudentPortfolio, Programme } from '../model.js';
import { NotFoundError } from '../../../common/errors.js';

// ─── APS Conversion Table (NSC) ────────────────────────────────────────────

interface APSEntry {
  min: number;
  max: number;
  rating: number;
  points: number;
  description: string;
}

const APS_TABLE: APSEntry[] = [
  { min: 80, max: 100, rating: 7, points: 7, description: 'Outstanding' },
  { min: 70, max: 79, rating: 6, points: 6, description: 'Meritorious' },
  { min: 60, max: 69, rating: 5, points: 5, description: 'Substantial' },
  { min: 50, max: 59, rating: 4, points: 4, description: 'Adequate' },
  { min: 40, max: 49, rating: 3, points: 3, description: 'Moderate' },
  { min: 30, max: 39, rating: 2, points: 2, description: 'Elementary' },
  { min: 0, max: 29, rating: 1, points: 1, description: 'Not Achieved' },
];

const MAX_APS = 42; // 6 subjects x 7 points

// ─── Helpers ────────────────────────────────────────────────────────────────

export function percentageToAPS(percentage: number): {
  rating: number;
  points: number;
  description: string;
} {
  const entry = APS_TABLE.find(
    (e) => percentage >= e.min && percentage <= e.max,
  );
  return entry
    ? { rating: entry.rating, points: entry.points, description: entry.description }
    : { rating: 1, points: 1, description: 'Not Achieved' };
}

function isLifeOrientation(name: string): boolean {
  return name.toLowerCase().includes('life orientation');
}

// ─── Service ────────────────────────────────────────────────────────────────

interface SubjectAPS {
  subjectId: string;
  name: string;
  percentage: number;
  apsPoints: number;
  description: string;
  isLifeOrientation: boolean;
  includedInTotal: boolean;
}

interface APSResult {
  totalAPS: number;
  maxAPS: number;
  lifeOrientationPoints: number;
  subjects: SubjectAPS[];
  year: number;
  grade: string;
}

interface SimulationChange {
  subjectId: string;
  name: string;
  currentPercentage: number;
  hypotheticalPercentage: number;
  currentPoints: number;
  newPoints: number;
  pointsGained: number;
}

interface SimulationResult {
  currentAPS: number;
  simulatedAPS: number;
  improvement: number;
  maxAPS: number;
  changes: SimulationChange[];
  newProgrammesUnlocked: number;
}

export class APSService {
  /**
   * Get the APS breakdown for a student's latest academic year.
   */
  static async getAPS(studentId: string): Promise<APSResult> {
    const portfolio = await StudentPortfolio.findOne({
      studentId,
      isDeleted: false,
    }).lean();

    if (!portfolio || portfolio.academicHistory.length === 0) {
      throw new NotFoundError('No academic history found for student');
    }

    // Get the latest academic year
    const sorted = [...portfolio.academicHistory].sort((a, b) => b.year - a.year);
    const latest = sorted[0];

    // Compute per-subject APS
    const subjects: SubjectAPS[] = latest.subjects.map((s) => {
      const aps = percentageToAPS(s.finalPercentage);
      return {
        subjectId: String(s.subjectId),
        name: s.name,
        percentage: s.finalPercentage,
        apsPoints: aps.points,
        description: aps.description,
        isLifeOrientation: isLifeOrientation(s.name),
        includedInTotal: false,
      };
    });

    // Separate LO and non-LO
    const loSubjects = subjects.filter((s) => s.isLifeOrientation);
    const nonLO = subjects.filter((s) => !s.isLifeOrientation);

    // Sort by points descending and take best 6
    nonLO.sort((a, b) => b.apsPoints - a.apsPoints);
    const best6 = nonLO.slice(0, 6);
    best6.forEach((s) => { s.includedInTotal = true; });

    const totalAPS = best6.reduce((sum, s) => sum + s.apsPoints, 0);
    const loPoints = loSubjects.reduce((sum, s) => sum + s.apsPoints, 0);

    return {
      totalAPS,
      maxAPS: MAX_APS,
      lifeOrientationPoints: loPoints,
      subjects,
      year: latest.year,
      grade: latest.grade,
    };
  }

  /**
   * Simulate APS with hypothetical percentage adjustments.
   */
  static async simulate(
    studentId: string,
    adjustments: { subjectId: string; hypotheticalPercentage: number }[],
  ): Promise<SimulationResult> {
    const currentResult = await APSService.getAPS(studentId);
    const currentAPS = currentResult.totalAPS;

    // Build adjusted subjects
    const adjustmentMap = new Map(
      adjustments.map((a) => [a.subjectId, a.hypotheticalPercentage]),
    );

    const changes: SimulationChange[] = [];
    const simulatedSubjects = currentResult.subjects.map((s) => {
      const newPct = adjustmentMap.get(s.subjectId);
      if (newPct !== undefined) {
        const newAps = percentageToAPS(newPct);
        changes.push({
          subjectId: s.subjectId,
          name: s.name,
          currentPercentage: s.percentage,
          hypotheticalPercentage: newPct,
          currentPoints: s.apsPoints,
          newPoints: newAps.points,
          pointsGained: newAps.points - s.apsPoints,
        });
        return { ...s, apsPoints: newAps.points, percentage: newPct };
      }
      return s;
    });

    // Recalculate total from best 6 non-LO
    const nonLO = simulatedSubjects
      .filter((s) => !s.isLifeOrientation)
      .sort((a, b) => b.apsPoints - a.apsPoints)
      .slice(0, 6);

    const simulatedAPS = nonLO.reduce((sum, s) => sum + s.apsPoints, 0);

    // Count newly unlocked programmes
    const newProgrammesUnlocked = await Programme.countDocuments({
      isDeleted: false,
      isActive: true,
      minimumAPS: { $lte: simulatedAPS, $gt: currentAPS },
    });

    return {
      currentAPS,
      simulatedAPS,
      improvement: simulatedAPS - currentAPS,
      maxAPS: MAX_APS,
      changes,
      newProgrammesUnlocked,
    };
  }
}
