import { School, ISchool } from './model.js';
import { NotFoundError, ConflictError } from '../../common/errors.js';
import type { CreateSchoolInput, UpdateSchoolInput, UpdateSettingsInput } from './validation.js';

interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export class SchoolService {
  static async create(data: CreateSchoolInput): Promise<ISchool> {
    const existing = await School.findOne({ name: data.name, isDeleted: false });
    if (existing) {
      throw new ConflictError('A school with this name already exists');
    }

    const school = await School.create(data);
    return school;
  }

  static async list(params: PaginationParams): Promise<PaginatedResult<ISchool>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isDeleted: false };

    if (params.search) {
      filter.name = { $regex: params.search, $options: 'i' };
    }

    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (params.sort) {
      const direction = params.sort.startsWith('-') ? -1 : 1;
      const field = params.sort.replace(/^-/, '');
      sortObj = { [field]: direction };
    }

    const [data, total] = await Promise.all([
      School.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      School.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string): Promise<ISchool> {
    const school = await School.findOne({ _id: id, isDeleted: false });
    if (!school) {
      throw new NotFoundError('School not found');
    }
    return school;
  }

  static async update(id: string, data: UpdateSchoolInput): Promise<ISchool> {
    const school = await School.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!school) {
      throw new NotFoundError('School not found');
    }

    return school;
  }

  static async delete(id: string): Promise<void> {
    const school = await School.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, isActive: false } },
      { new: true },
    );

    if (!school) {
      throw new NotFoundError('School not found');
    }
  }

  static async updateSettings(id: string, data: UpdateSettingsInput): Promise<ISchool> {
    const updateFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateFields[`settings.${key}`] = value;
      }
    }

    const school = await School.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!school) {
      throw new NotFoundError('School not found');
    }

    return school;
  }
}
