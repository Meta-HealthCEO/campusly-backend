import mongoose from 'mongoose';
import { Merit, IMerit } from './model.js';
import { Student } from '../Student/model.js';
import { BadRequestError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

export class MeritService {
  static async createMerit(data: Partial<IMerit>, awardedBy: string): Promise<IMerit> {
    if (data.studentId && data.schoolId) {
      const student = await Student.findOne({ _id: data.studentId, schoolId: data.schoolId, isDeleted: false });
      if (!student) throw new BadRequestError('Student does not belong to this school');
    }
    const merit = new Merit({ ...data, awardedBy });
    return merit.save();
  }

  static async listMerits(
    schoolId: string,
    filters: { studentId?: string; type?: string; category?: string },
    page = 1,
    limit = 20,
  ) {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.maxLimit);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.studentId) filter.studentId = filters.studentId;
    if (filters.type) filter.type = filters.type;
    if (filters.category) filter.category = filters.category;

    const [data, total] = await Promise.all([
      Merit.find(filter)
        .populate('studentId', 'admissionNumber userId gradeId classId')
        .populate('awardedBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      Merit.countDocuments(filter),
    ]);

    return { data, total, page: sanitizedPage, limit: sanitizedLimit, totalPages: Math.ceil(total / sanitizedLimit) };
  }

  static async getStudentMeritBalance(studentId: string, schoolId: string) {
    const merits = await Merit.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId), schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false } },
      {
        $group: {
          _id: '$type',
          totalPoints: { $sum: '$points' },
          count: { $sum: 1 },
        },
      },
    ]);

    const meritPoints = merits.find((m) => m._id === 'merit')?.totalPoints ?? 0;
    const demeritPoints = merits.find((m) => m._id === 'demerit')?.totalPoints ?? 0;

    return { meritPoints, demeritPoints, netPoints: meritPoints - demeritPoints };
  }
}
