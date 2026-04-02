import { Student, IStudent } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { escapeRegex } from '../../common/utils.js';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export class StudentService {
  static async create(data: Partial<IStudent>): Promise<IStudent> {
    const student = new Student(data);
    return student.save();
  }

  static async list(
    schoolId: string,
    query: ListQuery,
  ): Promise<{
    students: IStudent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
    const limit = Math.min(
      Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
      PAGINATION_DEFAULTS.maxLimit,
    );
    const skip = (page - 1) * limit;
    const sortField = query.sort ?? '-createdAt';

    const filter: Record<string, unknown> = {
      schoolId,
      isDeleted: false,
    };

    if (query.search) {
      const searchRegex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ admissionNumber: searchRegex }];
    }

    let baseQuery = Student.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('gradeId')
      .populate('classId')
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .lean();

    const [students, total] = await Promise.all([
      baseQuery.exec(),
      Student.countDocuments(filter),
    ]);

    return {
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: string): Promise<IStudent> {
    const student = await Student.findOne({ _id: id, isDeleted: false })
      .populate('userId', 'firstName lastName email phone profileImage')
      .populate('gradeId')
      .populate('classId')
      .populate({
        path: 'guardianIds',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .lean();

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    return student;
  }

  static async update(id: string, data: Partial<IStudent>): Promise<IStudent> {
    const student = await Student.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('userId', 'firstName lastName email')
      .populate('gradeId')
      .populate('classId');

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    return student;
  }

  static async delete(id: string): Promise<IStudent> {
    const student = await Student.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    return student;
  }

  static async updateMedicalProfile(
    id: string,
    data: IStudent['medicalProfile'],
  ): Promise<IStudent> {
    const student = await Student.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { medicalProfile: data } },
      { new: true, runValidators: true },
    );

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    return student;
  }

  static async getByUserId(userId: string): Promise<IStudent> {
    const student = await Student.findOne({ userId, isDeleted: false })
      .populate('userId', 'firstName lastName email phone profileImage')
      .populate('gradeId')
      .populate('classId')
      .populate({
        path: 'guardianIds',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .lean();

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    return student;
  }
}
