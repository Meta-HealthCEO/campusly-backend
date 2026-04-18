import { Subject, ISubject, Timetable } from '../model.js';
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
    filters?: { teacherId?: string; gradeId?: string },
  ): Promise<PaginatedResult<ISubject>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (filters?.teacherId) {
      const subjectIds = await Timetable.distinct('subjectId', {
        schoolId,
        teacherId: filters.teacherId,
        isDeleted: false,
      });
      filter._id = { $in: subjectIds };
    }

    // Filter to subjects that include this grade in their gradeIds array
    if (filters?.gradeId) {
      filter.gradeIds = filters.gradeId;
    }

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

  static async getSubjectById(id: string, schoolId: string): Promise<ISubject> {
    const subject = await Subject.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('gradeIds', 'name level')
      .lean();
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }

  static async updateSubject(id: string, schoolId: string, data: Partial<ISubject>): Promise<ISubject> {
    const subject = await Subject.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('gradeIds', 'name level');
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }

  static async deleteSubject(id: string, schoolId: string): Promise<ISubject> {
    const subject = await Subject.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }
}
