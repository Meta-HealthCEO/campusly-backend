import crypto from 'crypto';
import { Grade, IGrade, Class, IClass } from '../model.js';
import { NotFoundError } from '../../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../../common/constants.js';
import { escapeRegex } from '../../../common/utils.js';

function generateClassroomCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

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

export class GradeService {
  // ─── Grade CRUD ──────────────────────────────────────────────────────────

  static async createGrade(data: Partial<IGrade>): Promise<IGrade> {
    const grade = new Grade(data);
    return grade.save();
  }

  static async listGrades(
    schoolId: string,
    query: ListQuery,
  ): Promise<PaginatedResult<IGrade>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (query.search) {
      filter.name = new RegExp(escapeRegex(query.search), 'i');
    }

    const [data, total] = await Promise.all([
      Grade.find(filter).sort(sortField).skip(skip).limit(limit).lean().exec(),
      Grade.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getGradeById(id: string, schoolId: string): Promise<IGrade> {
    const grade = await Grade.findOne({ _id: id, schoolId, isDeleted: false }).lean();
    if (!grade) throw new NotFoundError('Grade not found');
    return grade;
  }

  static async updateGrade(id: string, schoolId: string, data: Partial<IGrade>): Promise<IGrade> {
    const grade = await Grade.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!grade) throw new NotFoundError('Grade not found');
    return grade;
  }

  static async deleteGrade(id: string, schoolId: string): Promise<IGrade> {
    const grade = await Grade.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!grade) throw new NotFoundError('Grade not found');
    return grade;
  }

  // ─── Class CRUD ──────────────────────────────────────────────────────────

  static async createClass(data: Partial<IClass>): Promise<IClass> {
    // Generate a unique 6-char uppercase alphanumeric classroom code
    let code = generateClassroomCode();
    let attempts = 0;
    while (await Class.exists({ classroomCode: code }) && attempts < 10) {
      code = generateClassroomCode();
      attempts++;
    }
    const cls = new Class({ ...data, classroomCode: code });
    return cls.save();
  }

  static async getClassByCode(classroomCode: string): Promise<IClass | null> {
    return Class.findOne({ classroomCode: classroomCode.toUpperCase(), isDeleted: false }).lean();
  }

  static async regenerateClassroomCode(id: string, schoolId: string): Promise<IClass> {
    let code = generateClassroomCode();
    let attempts = 0;
    while (await Class.exists({ classroomCode: code }) && attempts < 10) {
      code = generateClassroomCode();
      attempts++;
    }
    const cls = await Class.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { classroomCode: code } },
      { new: true },
    );
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  static async listClasses(
    filters: { schoolId: string; gradeId?: string },
    query: ListQuery,
  ): Promise<PaginatedResult<IClass>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId: filters.schoolId, isDeleted: false };
    if (filters.gradeId) filter.gradeId = filters.gradeId;

    if (query.search) {
      filter.name = new RegExp(escapeRegex(query.search), 'i');
    }

    const [data, total] = await Promise.all([
      Class.find(filter)
        .populate('gradeId', 'name level')
        .populate('teacherId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Class.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getClassById(id: string, schoolId: string): Promise<IClass> {
    const cls = await Class.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('gradeId', 'name level')
      .populate('teacherId', 'firstName lastName email')
      .lean();
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  static async updateClass(id: string, schoolId: string, data: Partial<IClass>): Promise<IClass> {
    const cls = await Class.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('gradeId', 'name level')
      .populate('teacherId', 'firstName lastName email');
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  static async deleteClass(id: string, schoolId: string): Promise<IClass> {
    const cls = await Class.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }
}
