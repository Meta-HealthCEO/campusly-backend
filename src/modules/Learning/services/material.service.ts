import {
  StudyMaterial,
  Rubric,
  type IStudyMaterial,
  type IRubric,
} from '../model.js';
import { NotFoundError } from '../../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../../common/constants.js';
import { escapeRegex } from '../../../common/utils.js';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  schoolId?: string;
  classId?: string;
  subjectId?: string;
  gradeId?: string;
  teacherId?: string;
  term?: number;
  topic?: string;
  type?: string;
  status?: string;
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

export class MaterialService {
  // ─── Study Materials ─────────────────────────────────────────────────

  static async uploadStudyMaterial(
    data: Partial<IStudyMaterial>,
    teacherId: string,
  ): Promise<IStudyMaterial> {
    const material = new StudyMaterial({ ...data, teacherId });
    return material.save();
  }

  static async getStudyMaterials(query: ListQuery): Promise<PaginatedResult<IStudyMaterial>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.gradeId) filter.gradeId = query.gradeId;
    if (query.term) filter.term = query.term;
    if (query.topic) filter.topic = new RegExp(escapeRegex(query.topic), 'i');
    if (query.type) filter.type = query.type;

    if (query.search) {
      filter.$or = [
        { title: new RegExp(escapeRegex(query.search), 'i') },
        { description: new RegExp(escapeRegex(query.search), 'i') },
        { tags: { $in: [new RegExp(escapeRegex(query.search), 'i')] } },
      ];
    }

    const [data, total] = await Promise.all([
      StudyMaterial.find(filter)
        .populate('subjectId', 'name code')
        .populate('gradeId', 'name')
        .populate('teacherId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      StudyMaterial.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getStudyMaterial(id: string): Promise<IStudyMaterial> {
    const material = await StudyMaterial.findOne({ _id: id, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .lean();
    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  static async updateStudyMaterial(
    id: string,
    data: Partial<IStudyMaterial>,
  ): Promise<IStudyMaterial> {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  static async deleteStudyMaterial(id: string): Promise<IStudyMaterial> {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  static async incrementDownloads(id: string): Promise<IStudyMaterial> {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $inc: { downloads: 1 } },
      { new: true },
    );
    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  // ─── Rubrics ─────────────────────────────────────────────────────────

  static async createRubric(data: Partial<IRubric>, teacherId: string): Promise<IRubric> {
    const rubric = new Rubric({ ...data, teacherId });
    return rubric.save();
  }

  static async getRubric(id: string): Promise<IRubric> {
    const rubric = await Rubric.findOne({ _id: id, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName email')
      .lean();
    if (!rubric) throw new NotFoundError('Rubric not found');
    return rubric;
  }

  static async listRubrics(query: ListQuery): Promise<PaginatedResult<IRubric>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.teacherId) filter.teacherId = query.teacherId;
    if (query.subjectId) filter.subjectId = query.subjectId;

    const [data, total] = await Promise.all([
      Rubric.find(filter)
        .populate('subjectId', 'name code')
        .populate('teacherId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Rubric.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async updateRubric(id: string, data: Partial<IRubric>): Promise<IRubric> {
    const rubric = await Rubric.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!rubric) throw new NotFoundError('Rubric not found');
    return rubric;
  }

  static async deleteRubric(id: string): Promise<IRubric> {
    const rubric = await Rubric.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!rubric) throw new NotFoundError('Rubric not found');
    return rubric;
  }
}
