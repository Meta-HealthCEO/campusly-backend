import { Bursary, type IBursary, StudentPortfolio } from '../model.js';
import { NotFoundError } from '../../../common/errors.js';
import { paginationHelper, escapeRegex } from '../../../common/utils.js';

// ─── Types ────────────────────────────────────────────────────────────────

interface ListQuery {
  field?: string;
  provider?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface BursaryInput {
  name: string;
  provider: string;
  description?: string;
  eligibilityCriteria?: string;
  minimumAPS?: number;
  fieldOfStudy?: string[];
  coverageDetails?: string;
  applicationOpenDate?: Date;
  applicationCloseDate?: Date;
  applicationUrl?: string;
  linkedUniversities?: string[];
  annualValue?: number;
}

interface CSVRow {
  name?: string;
  provider?: string;
  description?: string;
  eligibilityCriteria?: string;
  minimumAPS?: string | number;
  fieldOfStudy?: string;
  coverageDetails?: string;
  applicationOpenDate?: string;
  applicationCloseDate?: string;
  applicationUrl?: string;
  annualValue?: string | number;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

// MatchedBursary wrapper removed — frontend expects flat IBursary[]

// ─── Helpers ──────────────────────────────────────────────────────────────

function percentageToAPS(pct: number): number {
  if (pct >= 80) return 7;
  if (pct >= 70) return 6;
  if (pct >= 60) return 5;
  if (pct >= 50) return 4;
  if (pct >= 40) return 3;
  if (pct >= 30) return 2;
  return 1;
}

function computeStudentAPS(
  subjects: { name: string; apsPoints: number }[],
): number {
  return subjects
    .filter(
      (s: { name: string; apsPoints: number }) =>
        !s.name.toLowerCase().includes('life orientation'),
    )
    .map((s: { name: string; apsPoints: number }) => s.apsPoints)
    .sort((a: number, b: number) => b - a)
    .slice(0, 6)
    .reduce((sum: number, pts: number) => sum + pts, 0);
}

// ─── Service ──────────────────────────────────────────────────────────────

export class BursaryService {
  /**
   * List bursaries with filters and pagination.
   */
  static async list(query: ListQuery) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = { isActive: true, isDeleted: false };

    if (query.field) {
      filter.fieldOfStudy = query.field;
    }
    if (query.provider) {
      filter.provider = new RegExp(escapeRegex(query.provider), 'i');
    }
    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: regex }, { provider: regex }, { description: regex }];
    }

    const [data, total] = await Promise.all([
      Bursary.find(filter).sort({ applicationCloseDate: 1 }).skip(skip).limit(limit).lean(),
      Bursary.countDocuments(filter),
    ]);

    const page = query.page ?? 1;
    return { items: data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get a single bursary by ID.
   */
  static async getById(id: string): Promise<IBursary> {
    const bursary = await Bursary.findOne({ _id: id, isDeleted: false }).lean();
    if (!bursary) throw new NotFoundError('Bursary not found');
    return bursary as IBursary;
  }

  /**
   * Create a new bursary.
   */
  static async create(data: BursaryInput): Promise<IBursary> {
    return Bursary.create(data);
  }

  /**
   * Update an existing bursary.
   */
  static async update(
    id: string,
    data: Partial<BursaryInput>,
  ): Promise<IBursary> {
    const bursary = await Bursary.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      { new: true },
    );
    if (!bursary) throw new NotFoundError('Bursary not found');
    return bursary;
  }

  /**
   * Match bursaries for a student based on their APS.
   */
  static async matchForStudent(
    studentId: string,
  ): Promise<IBursary[]> {
    const portfolio = await StudentPortfolio.findOne({
      studentId,
      isDeleted: false,
    }).lean();

    if (!portfolio || portfolio.academicHistory.length === 0) {
      throw new NotFoundError('No academic history found for student');
    }

    const sorted = [...portfolio.academicHistory].sort(
      (a, b) => b.year - a.year,
    );
    const latest = sorted[0];
    const studentAPS = computeStudentAPS(latest.subjects);

    // Find bursaries where minimumAPS <= studentAPS or no minimumAPS set
    const bursaries = await Bursary.find({
      isActive: true,
      isDeleted: false,
      $or: [
        { minimumAPS: { $exists: false } },
        { minimumAPS: null },
        { minimumAPS: { $lte: studentAPS } },
      ],
    })
      .sort({ annualValue: -1 })
      .lean();

    return bursaries as IBursary[];
  }

  /**
   * Import bursaries from CSV rows. Returns count of imported, skipped, and errors.
   */
  static async importFromCSV(rows: CSVRow[]): Promise<ImportResult> {
    let imported = 0;
    let skipped = 0;
    const errors: { row: number; reason: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      if (!row.name || !row.provider) {
        errors.push({ row: rowNum, reason: 'Missing required fields (name, provider)' });
        skipped++;
        continue;
      }

      try {
        const bursaryData: BursaryInput = {
          name: row.name.trim(),
          provider: row.provider.trim(),
          description: row.description?.trim(),
          eligibilityCriteria: row.eligibilityCriteria?.trim(),
          coverageDetails: row.coverageDetails?.trim(),
          applicationUrl: row.applicationUrl?.trim(),
        };

        if (row.minimumAPS) {
          const aps = Number(row.minimumAPS);
          if (!isNaN(aps)) bursaryData.minimumAPS = aps;
        }

        if (row.annualValue) {
          const val = Number(row.annualValue);
          if (!isNaN(val)) bursaryData.annualValue = val;
        }

        if (row.fieldOfStudy) {
          bursaryData.fieldOfStudy = row.fieldOfStudy
            .split(',')
            .map((f: string) => f.trim())
            .filter((f: string) => f.length > 0);
        }

        if (row.applicationOpenDate) {
          const d = new Date(row.applicationOpenDate);
          if (!isNaN(d.getTime())) bursaryData.applicationOpenDate = d;
        }

        if (row.applicationCloseDate) {
          const d = new Date(row.applicationCloseDate);
          if (!isNaN(d.getTime())) bursaryData.applicationCloseDate = d;
        }

        await Bursary.create(bursaryData);
        imported++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ row: rowNum, reason: message });
        skipped++;
      }
    }

    return { imported, skipped, errors };
  }
}
