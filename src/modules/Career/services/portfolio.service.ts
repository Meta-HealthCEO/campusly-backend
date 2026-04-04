import {
  StudentPortfolio,
  type IStudentPortfolio,
  type ISubjectRecord,
  type IAcademicYear,
} from '../model.js';
import { NotFoundError, ConflictError } from '../../../common/errors.js';

// ─── APS Helper ─────────────────────────────────────────────────────────────

function percentageToAPS(percentage: number): number {
  if (percentage >= 80) return 7;
  if (percentage >= 70) return 6;
  if (percentage >= 60) return 5;
  if (percentage >= 50) return 4;
  if (percentage >= 40) return 3;
  if (percentage >= 30) return 2;
  return 1;
}

function computeTotalAPS(subjects: ISubjectRecord[]): number {
  const nonLO = subjects
    .filter((s) => !s.name.toLowerCase().includes('life orientation'))
    .map((s) => s.apsPoints)
    .sort((a, b) => b - a)
    .slice(0, 6);
  return nonLO.reduce((sum, pts) => sum + pts, 0);
}

// ─── Service ────────────────────────────────────────────────────────────────

export class PortfolioService {
  /**
   * Get a student's portfolio. Returns null if none exists.
   */
  static async getPortfolio(studentId: string, schoolId?: string): Promise<IStudentPortfolio | null> {
    const filter: Record<string, unknown> = { studentId, isDeleted: false };
    if (schoolId) filter.schoolId = schoolId;
    const portfolio = await StudentPortfolio.findOne(filter)
      .populate('studentId', 'firstName lastName grade')
      .lean();

    return portfolio as IStudentPortfolio | null;
  }

  /**
   * Create an academic-year snapshot and push to academicHistory.
   * Throws ConflictError if the year already exists.
   */
  static async createSnapshot(
    studentId: string,
    schoolId: string,
    year: number,
    grade: string,
    subjects: Omit<ISubjectRecord, 'apsPoints'>[],
    promoted: boolean,
    promotionStatus: 'promoted' | 'condoned' | 'retained' = 'promoted',
  ): Promise<IStudentPortfolio> {
    // Check for existing snapshot for this year
    const existing = await StudentPortfolio.findOne({
      studentId,
      isDeleted: false,
      'academicHistory.year': year,
    }).lean();

    if (existing) {
      throw new ConflictError(`Academic snapshot for year ${year} already exists`);
    }

    // Compute APS points per subject
    const enrichedSubjects: ISubjectRecord[] = subjects.map((s) => ({
      ...s,
      apsPoints: percentageToAPS(s.finalPercentage),
    }));

    const totalAPS = computeTotalAPS(enrichedSubjects);

    const snapshot: IAcademicYear = {
      year,
      grade,
      subjects: enrichedSubjects,
      totalAPS,
      promoted,
      promotionStatus,
    };

    // Upsert: create portfolio if it doesn't exist, then push snapshot
    const portfolio = await StudentPortfolio.findOneAndUpdate(
      { studentId, isDeleted: false },
      {
        $setOnInsert: {
          studentId,
          schoolId,
          extracurriculars: [],
          communityService: [],
        },
        $push: { academicHistory: snapshot },
      },
      { new: true, upsert: true },
    );

    if (!portfolio) {
      throw new NotFoundError('Failed to create or update portfolio');
    }

    return portfolio;
  }

  /**
   * Add an extracurricular activity to the student's portfolio.
   */
  static async addExtracurricular(
    studentId: string,
    schoolId: string,
    data: {
      year: number;
      activity: string;
      role: string;
      description: string;
      verifiedBy?: string;
    },
  ): Promise<IStudentPortfolio> {
    const portfolio = await StudentPortfolio.findOneAndUpdate(
      { studentId, isDeleted: false },
      {
        $setOnInsert: {
          studentId,
          schoolId,
          academicHistory: [],
          communityService: [],
        },
        $push: { extracurriculars: data },
      },
      { new: true, upsert: true },
    );

    if (!portfolio) {
      throw new NotFoundError('Failed to update portfolio');
    }

    return portfolio;
  }

  /**
   * Add a community service entry to the student's portfolio.
   */
  static async addCommunityService(
    studentId: string,
    schoolId: string,
    data: {
      year: number;
      organization: string;
      hours: number;
      description: string;
      verifiedBy?: string;
    },
  ): Promise<IStudentPortfolio> {
    const portfolio = await StudentPortfolio.findOneAndUpdate(
      { studentId, isDeleted: false },
      {
        $setOnInsert: {
          studentId,
          schoolId,
          academicHistory: [],
          extracurriculars: [],
        },
        $push: { communityService: data },
      },
      { new: true, upsert: true },
    );

    if (!portfolio) {
      throw new NotFoundError('Failed to update portfolio');
    }

    return portfolio;
  }

  /**
   * Generate a transcript object for the student.
   * TODO: Add PDFKit integration for actual PDF generation.
   */
  static async generateTranscript(studentId: string, schoolId?: string): Promise<{
    student: unknown;
    academicHistory: IAcademicYear[];
    extracurriculars: IStudentPortfolio['extracurriculars'];
    communityService: IStudentPortfolio['communityService'];
    generatedAt: Date;
  }> {
    const transcriptFilter: Record<string, unknown> = { studentId, isDeleted: false };
    if (schoolId) transcriptFilter.schoolId = schoolId;
    const portfolio = await StudentPortfolio.findOne(transcriptFilter)
      .populate('studentId', 'firstName lastName grade dateOfBirth idNumber')
      .lean();

    if (!portfolio) {
      throw new NotFoundError('Student portfolio not found');
    }

    return {
      student: portfolio.studentId,
      academicHistory: portfolio.academicHistory,
      extracurriculars: portfolio.extracurriculars,
      communityService: portfolio.communityService,
      generatedAt: new Date(),
    };
  }
}
