import { University, Programme, type IUniversity } from '../model.js';
import { NotFoundError } from '../../../common/errors.js';
import { paginationHelper } from '../../../common/utils.js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface UniversityListQuery {
  type?: string;
  province?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UniversityListResult {
  items: (IUniversity & { programmeCount: number })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Service ────────────────────────────────────────────────────────────────

export class UniversityService {
  /**
   * List universities with optional filters, search, and pagination.
   */
  static async list(query: UniversityListQuery): Promise<UniversityListResult> {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { isDeleted: false, isActive: true };

    if (query.type) {
      filter.type = query.type;
    }
    if (query.province) {
      filter.province = query.province;
    }
    if (query.search) {
      filter.name = new RegExp(query.search, 'i');
    }

    const [universities, total] = await Promise.all([
      University.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      University.countDocuments(filter),
    ]);

    // Count programmes per university
    const uniIds = universities.map((u) => u._id);
    const programmeCounts = await Programme.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { universityId: { $in: uniIds }, isDeleted: false, isActive: true } },
      { $group: { _id: '$universityId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      programmeCounts.map((pc) => [String(pc._id), pc.count]),
    );

    const data = universities.map((u) => ({
      ...u,
      programmeCount: countMap.get(String(u._id)) ?? 0,
    })) as unknown as (IUniversity & { programmeCount: number })[];

    const page = query.page ?? 1;
    const totalPages = Math.ceil(total / limit);

    return { items: data, total, page, limit, totalPages };
  }

  /**
   * Get a single university by ID.
   */
  static async getById(id: string): Promise<IUniversity> {
    const university = await University.findOne({
      _id: id,
      isDeleted: false,
    }).lean();

    if (!university) {
      throw new NotFoundError('University not found');
    }

    return university as IUniversity;
  }

  /**
   * Create a new university.
   */
  static async create(
    data: Partial<IUniversity>,
  ): Promise<IUniversity> {
    const university = await University.create(data);
    return university;
  }

  /**
   * Update a university.
   */
  static async update(
    id: string,
    data: Partial<IUniversity>,
  ): Promise<IUniversity> {
    const university = await University.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      { new: true },
    );

    if (!university) {
      throw new NotFoundError('University not found');
    }

    return university;
  }

  /**
   * Soft-delete a university.
   */
  static async delete(id: string): Promise<IUniversity> {
    const university = await University.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );

    if (!university) {
      throw new NotFoundError('University not found');
    }

    return university;
  }
}
