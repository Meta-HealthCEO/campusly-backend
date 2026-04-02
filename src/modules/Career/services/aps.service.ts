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
  level: string;
  currentPercentage: number;
  rating: number;
  apsPoints: number;
  description: string;
  isLifeOrientation: boolean;
  includedInTotal: boolean;
}

interface LifeOrientationInfo {
  percentage: number;
  apsPoints: number;
  note?: string;
}

interface APSConversionEntry {
  min: number;
  max: number;
  rating: number;
  points: number;
  description: string;
}

interface APSResult {
  totalAPS: number;
  maxAPS: number;
  lifeOrientation: LifeOrientationInfo;
  subjects: SubjectAPS[];
  apsConversionTable: APSConversionEntry[];
  year: number;
  grade: string;
}

interface SimulationSubject {
  name: string;
  currentPercentage: number;
  hypotheticalPercentage: number;
  currentAPS: number;
  simulatedAPS: number;
  change: string;
}

interface SimulationResult {
  currentAPS: number;
  simulatedAPS: number;
  improvement: number;
  subjects: SimulationSubject[];
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
        level: s.level,
        currentPercentage: s.finalPercentage,
        rating: aps.rating,
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
    const loPercentage = loSubjects.length > 0 ? loSubjects[0].currentPercentage : 0;

    return {
      totalAPS,
      maxAPS: MAX_APS,
      lifeOrientation: {
        percentage: loPercentage,
        apsPoints: loPoints,
        note: 'Excluded from total (most universities)',
      },
      subjects,
      apsConversionTable: APS_TABLE,
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

    const simSubjects: SimulationSubject[] = [];
    const simulatedSubjects = currentResult.subjects.map((s) => {
      const newPct = adjustmentMap.get(s.subjectId);
      if (newPct !== undefined) {
        const newAps = percentageToAPS(newPct);
        const pointsGained = newAps.points - s.apsPoints;
        simSubjects.push({
          name: s.name,
          currentPercentage: s.currentPercentage,
          hypotheticalPercentage: newPct,
          currentAPS: s.apsPoints,
          simulatedAPS: newAps.points,
          change: pointsGained > 0 ? `+${pointsGained}` : String(pointsGained),
        });
        return { ...s, apsPoints: newAps.points, currentPercentage: newPct };
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
      subjects: simSubjects,
      newProgrammesUnlocked,
    };
  }
}
