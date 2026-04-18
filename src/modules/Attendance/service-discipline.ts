import { Discipline, IDiscipline } from './model.js';
import { Student } from '../Student/model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

export class DisciplineService {
  static async createDiscipline(data: Partial<IDiscipline>, reportedBy: string): Promise<IDiscipline> {
    if (data.studentId && data.schoolId) {
      const student = await Student.findOne({ _id: data.studentId, schoolId: data.schoolId, isDeleted: false });
      if (!student) throw new BadRequestError('Student does not belong to this school');
    }
    const discipline = new Discipline({ ...data, reportedBy });
    return discipline.save();
  }

  static async listDiscipline(
    schoolId: string,
    filters: { studentId?: string; status?: string; type?: string },
    page = 1,
    limit = 20,
  ) {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.maxLimit);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.studentId) filter.studentId = filters.studentId;
    if (filters.status) filter.status = filters.status;
    if (filters.type) filter.type = filters.type;

    const [data, total] = await Promise.all([
      Discipline.find(filter)
        .populate('studentId', 'admissionNumber userId gradeId classId')
        .populate('reportedBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      Discipline.countDocuments(filter),
    ]);

    return { data, total, page: sanitizedPage, limit: sanitizedLimit, totalPages: Math.ceil(total / sanitizedLimit) };
  }

  static async getDisciplineById(id: string, schoolId: string): Promise<IDiscipline> {
    const record = await Discipline.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('studentId', 'admissionNumber userId gradeId classId')
      .populate('reportedBy', 'firstName lastName email')
      .lean();
    if (!record) throw new NotFoundError('Discipline record not found');
    return record;
  }

  static async updateDiscipline(id: string, schoolId: string, data: Partial<IDiscipline>): Promise<IDiscipline> {
    const record = await Discipline.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('studentId', 'admissionNumber userId gradeId classId').populate('reportedBy', 'firstName lastName email');
    if (!record) throw new NotFoundError('Discipline record not found');
    return record;
  }

  static async deleteDiscipline(id: string, schoolId: string): Promise<IDiscipline> {
    const record = await Discipline.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!record) throw new NotFoundError('Discipline record not found');
    return record;
  }
}
