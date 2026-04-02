import { Programme, University, type IProgramme } from '../model.js';
import { NotFoundError } from '../../../common/errors.js';
import { paginationHelper } from '../../../common/utils.js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProgrammeListQuery {
  universityId?: string;
  faculty?: string;
  qualificationType?: string;
  maxAPS?: number;
  field?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ProgrammeListResult {
  data: IProgramme[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CSVImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

// ─── Service ────────────────────────────────────────────────────────────────

export class ProgrammeService {
  /**
   * List programmes with filters, search, and pagination.
   * Populates university name and logo.
   */
  static async list(query: ProgrammeListQuery): Promise<ProgrammeListResult> {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { isDeleted: false, isActive: true };

    if (query.universityId) {
      filter.universityId = query.universityId;
    }
    if (query.faculty) {
      filter.faculty = new RegExp(query.faculty, 'i');
    }
    if (query.qualificationType) {
      filter.qualificationType = query.qualificationType;
    }
    if (query.maxAPS !== undefined) {
      filter.minimumAPS = { $lte: query.maxAPS };
    }
    if (query.field) {
      filter.careerOutcomes = new RegExp(query.field, 'i');
    }
    if (query.search) {
      filter.name = new RegExp(query.search, 'i');
    }

    const [programmes, total] = await Promise.all([
      Programme.find(filter)
        .populate('universityId', 'name shortName logo')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Programme.countDocuments(filter),
    ]);

    const page = query.page ?? 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data: programmes as IProgramme[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get a single programme by ID with university details.
   */
  static async getById(id: string): Promise<IProgramme> {
    const programme = await Programme.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate('universityId', 'name shortName logo type province city website applicationPortalUrl')
      .lean();

    if (!programme) {
      throw new NotFoundError('Programme not found');
    }

    return programme as IProgramme;
  }

  /**
   * Create a new programme. Verifies the university exists first.
   */
  static async create(data: Partial<IProgramme>): Promise<IProgramme> {
    if (data.universityId) {
      const university = await University.findOne({
        _id: data.universityId,
        isDeleted: false,
      }).lean();

      if (!university) {
        throw new NotFoundError('University not found');
      }
    }

    const programme = await Programme.create(data);
    return programme;
  }

  /**
   * Update a programme.
   */
  static async update(
    id: string,
    data: Partial<IProgramme>,
  ): Promise<IProgramme> {
    const programme = await Programme.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      { new: true },
    );

    if (!programme) {
      throw new NotFoundError('Programme not found');
    }

    return programme;
  }

  /**
   * Soft-delete a programme.
   */
  static async delete(id: string): Promise<IProgramme> {
    const programme = await Programme.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );

    if (!programme) {
      throw new NotFoundError('Programme not found');
    }

    return programme;
  }

  /**
   * Import programmes from CSV rows.
   * Each row should have: universityName, faculty, name, qualificationType,
   * duration, minimumAPS, and optionally department, careerOutcomes (semicolon-separated).
   */
  static async importFromCSV(
    rows: Record<string, string>[],
  ): Promise<CSVImportResult> {
    const result: CSVImportResult = { imported: 0, skipped: 0, errors: [] };

    // Pre-fetch universities for name resolution
    const universities = await University.find({ isDeleted: false })
      .select('_id name shortName')
      .lean();

    const uniMap = new Map<string, string>();
    for (const uni of universities) {
      uniMap.set(uni.name.toLowerCase(), String(uni._id));
      uniMap.set(uni.shortName.toLowerCase(), String(uni._id));
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      try {
        const uniName = row.universityName?.trim();
        if (!uniName) {
          result.errors.push({ row: rowNum, reason: 'Missing universityName' });
          result.skipped++;
          continue;
        }

        const universityId = uniMap.get(uniName.toLowerCase());
        if (!universityId) {
          result.errors.push({ row: rowNum, reason: `University not found: ${uniName}` });
          result.skipped++;
          continue;
        }

        const name = row.name?.trim();
        const faculty = row.faculty?.trim();
        const qualificationType = row.qualificationType?.trim();
        const duration = row.duration?.trim();
        const minimumAPS = Number(row.minimumAPS);

        if (!name || !faculty || !qualificationType || !duration || isNaN(minimumAPS)) {
          result.errors.push({ row: rowNum, reason: 'Missing required fields' });
          result.skipped++;
          continue;
        }

        const careerOutcomes = row.careerOutcomes
          ? row.careerOutcomes.split(';').map((s) => s.trim()).filter(Boolean)
          : [];

        await Programme.create({
          universityId,
          faculty,
          department: row.department?.trim() || undefined,
          name,
          qualificationType,
          duration,
          minimumAPS,
          careerOutcomes,
          subjectRequirements: [],
          nbtRequired: { al: false, ql: false, mat: false },
          nbtMinimumScores: { al: 0, ql: 0, mat: 0 },
          linkedBursaries: [],
        });

        result.imported++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        result.errors.push({ row: rowNum, reason: message });
        result.skipped++;
      }
    }

    return result;
  }
}
