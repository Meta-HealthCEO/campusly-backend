import {
  Programme,
  type IProgramme,
  StudentPortfolio,
  type ISubjectRecord,
} from '../model.js';
import { NotFoundError } from '../../../common/errors.js';
import { paginationHelper } from '../../../common/utils.js';

// ─── APS Helpers ──────────────────────────────────────────────────────────

function percentageToAPS(pct: number): number {
  if (pct >= 80) return 7;
  if (pct >= 70) return 6;
  if (pct >= 60) return 5;
  if (pct >= 50) return 4;
  if (pct >= 40) return 3;
  if (pct >= 30) return 2;
  return 1;
}

function isLifeOrientation(name: string): boolean {
  return name.toLowerCase().includes('life orientation');
}

function computeAPS(subjects: ISubjectRecord[]): number {
  return subjects
    .filter((s: ISubjectRecord) => !isLifeOrientation(s.name))
    .map((s: ISubjectRecord) => s.apsPoints)
    .sort((a: number, b: number) => b - a)
    .slice(0, 6)
    .reduce((sum: number, pts: number) => sum + pts, 0);
}

// ─── Types ────────────────────────────────────────────────────────────────

type MatchStatus = 'eligible' | 'close' | 'not_eligible';

interface SubjectGap {
  subjectName: string;
  required: number;
  actual: number;
  shortfall: number;
}

interface ProgrammeMatch {
  programmeId: string;
  programmeName: string;
  universityId: string;
  faculty: string;
  qualificationType: string;
  minimumAPS: number;
  status: MatchStatus;
  overallFit: number;
  subjectGaps: SubjectGap[];
  missingSubjects: string[];
}

interface MatchFilters {
  status?: MatchStatus;
  universityId?: string;
  field?: string;
  page?: number;
  limit?: number;
}

interface MatchResult {
  studentAPS: number;
  summary: { eligible: number; close: number; total: number };
  matches: ProgrammeMatch[];
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Service ──────────────────────────────────────────────────────────────

export class MatcherService {
  static async matchProgrammes(
    studentId: string,
    filters: MatchFilters,
  ): Promise<MatchResult> {
    // 1. Get student portfolio
    const portfolio = await StudentPortfolio.findOne({
      studentId,
      isDeleted: false,
    }).lean();

    if (!portfolio || portfolio.academicHistory.length === 0) {
      throw new NotFoundError('No academic history found for student');
    }

    // Latest academic year
    const sorted = [...portfolio.academicHistory].sort(
      (a, b) => b.year - a.year,
    );
    const latest = sorted[0];
    const studentAPS = computeAPS(latest.subjects);

    // Build a lookup of student subjects (lowercase name -> percentage)
    const studentSubjects = new Map<string, number>();
    for (const s of latest.subjects) {
      studentSubjects.set(s.name.toLowerCase(), s.finalPercentage);
    }

    // 2. Get all active programmes
    const programmeFilter: Record<string, unknown> = {
      isActive: true,
      isDeleted: false,
    };
    if (filters.universityId) programmeFilter.universityId = filters.universityId;
    if (filters.field) programmeFilter.faculty = new RegExp(filters.field, 'i');

    const programmes = await Programme.find(programmeFilter).lean();

    // 3. Score each programme
    const allMatches: ProgrammeMatch[] = programmes.map(
      (prog: IProgramme & { _id: unknown }) => {
        const apsFit = Math.min(studentAPS / prog.minimumAPS, 1);

        // Check compulsory subject requirements
        const subjectGaps: SubjectGap[] = [];
        const missingSubjects: string[] = [];
        let compulsoryMet = 0;
        let compulsoryTotal = 0;

        for (const req of prog.subjectRequirements) {
          if (!req.isCompulsory) continue;
          compulsoryTotal++;

          const actual = studentSubjects.get(req.subjectName.toLowerCase());
          if (actual === undefined) {
            missingSubjects.push(req.subjectName);
          } else if (actual < req.minimumPercentage) {
            subjectGaps.push({
              subjectName: req.subjectName,
              required: req.minimumPercentage,
              actual,
              shortfall: req.minimumPercentage - actual,
            });
          } else {
            compulsoryMet++;
          }
        }

        const compulsoryShort = compulsoryTotal - compulsoryMet;
        const subjectFit =
          compulsoryTotal > 0 ? compulsoryMet / compulsoryTotal : 1;

        // Determine status
        let status: MatchStatus;
        if (
          studentAPS >= prog.minimumAPS &&
          compulsoryShort === 0 &&
          missingSubjects.length === 0
        ) {
          status = 'eligible';
        } else if (
          studentAPS >= prog.minimumAPS - 3 &&
          missingSubjects.length === 0 &&
          compulsoryShort <= 1 &&
          subjectGaps.every(
            (g: SubjectGap) => g.shortfall <= g.required * 0.1,
          )
        ) {
          status = 'close';
        } else {
          status = 'not_eligible';
        }

        const overallFit = Math.round((apsFit * 0.5 + subjectFit * 0.5) * 100);

        return {
          programmeId: String(prog._id),
          programmeName: prog.name,
          universityId: String(prog.universityId),
          faculty: prog.faculty,
          qualificationType: prog.qualificationType,
          minimumAPS: prog.minimumAPS,
          status,
          overallFit,
          subjectGaps,
          missingSubjects,
        };
      },
    );

    // 4. Filter by status if requested
    const filtered = filters.status
      ? allMatches.filter((m: ProgrammeMatch) => m.status === filters.status)
      : allMatches;

    // 5. Sort by overallFit descending
    filtered.sort((a: ProgrammeMatch, b: ProgrammeMatch) => b.overallFit - a.overallFit);

    // Summary (always from full set)
    const summary = {
      eligible: allMatches.filter((m: ProgrammeMatch) => m.status === 'eligible').length,
      close: allMatches.filter((m: ProgrammeMatch) => m.status === 'close').length,
      total: allMatches.length,
    };

    // 6. Paginate
    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const page = filters.page ?? 1;
    const paginated = filtered.slice(skip, skip + limit);
    const totalPages = Math.ceil(filtered.length / limit);

    return {
      studentAPS,
      summary,
      matches: paginated,
      page,
      limit,
      totalPages,
    };
  }
}
