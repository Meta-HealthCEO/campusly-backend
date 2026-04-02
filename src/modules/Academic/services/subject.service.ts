import { Subject, ISubject } from '../model.js';
import { NotFoundError } from '../../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../../common/constants.js';
import { escapeRegex } from '../../../common/utils.js';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  const skip = (page - 1) * limit;
  const sortField = query.sort ?? '-createdAt';
  return { page, limit, skip, sortField };
}

export class SubjectService {
  static async createSubject(data: Partial<ISubject>): Promise<ISubject> {
    const subject = new Subject(data);
    return subject.save();
  }

  static async listSubjects(
    schoolId: string,
    query: ListQuery,
  ): Promise<PaginatedResult<ISubject>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (query.search) {
      filter.$or = [
        { name: new RegExp(escapeRegex(query.search), 'i') },
        { code: new RegExp(escapeRegex(query.search), 'i') },
      ];
    }

    const [data, total] = await Promise.all([
      Subject.find(filter)
        .populate('gradeIds', 'name level')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Subject.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getSubjectById(id: string): Promise<ISubject> {
    const subject = await Subject.findOne({ _id: id, isDeleted: false })
      .populate('gradeIds', 'name level')
      .lean();
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }

  static async updateSubject(id: string, data: Partial<ISubject>): Promise<ISubject> {
    const subject = await Subject.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('gradeIds', 'name level');
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }

  static async deleteSubject(id: string): Promise<ISubject> {
    const subject = await Subject.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }
}
