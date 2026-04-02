import { FeeType, FeeSchedule } from '../model.js';
import { NotFoundError } from '../../../common/errors.js';
import { paginationHelper } from '../../../common/utils.js';
import type {
  CreateFeeTypeInput,
  UpdateFeeTypeInput,
  CreateFeeScheduleInput,
  UpdateFeeScheduleInput,
} from '../validation.js';

export class FeeTypeService {
  // ─── Fee Type ──────────────────────────────────────────────────────────────

  static async createFeeType(data: CreateFeeTypeInput) {
    return FeeType.create(data);
  }

  static async listFeeTypes(
    schoolId: string,
    query: { page?: number; limit?: number; category?: string },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.category) {
      filter.category = query.category;
    }

    const [feeTypes, total] = await Promise.all([
      FeeType.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FeeType.countDocuments(filter),
    ]);

    return { feeTypes, total, page: query.page ?? 1, limit };
  }

  static async getFeeType(id: string) {
    const feeType = await FeeType.findOne({ _id: id, isDeleted: false }).lean();
    if (!feeType) {
      throw new NotFoundError('Fee type not found');
    }
    return feeType;
  }

  static async updateFeeType(id: string, data: UpdateFeeTypeInput) {
    const feeType = await FeeType.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      { new: true },
    );
    if (!feeType) {
      throw new NotFoundError('Fee type not found');
    }
    return feeType;
  }

  static async deleteFeeType(id: string) {
    const feeType = await FeeType.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!feeType) {
      throw new NotFoundError('Fee type not found');
    }
    return feeType;
  }

  // ─── Fee Schedule ──────────────────────────────────────────────────────────

  static async createFeeSchedule(data: CreateFeeScheduleInput) {
    return FeeSchedule.create({
      ...data,
      dueDate: new Date(data.dueDate),
    });
  }

  static async listFeeSchedules(
    schoolId: string,
    query: { page?: number; limit?: number; academicYear?: number },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.academicYear) {
      filter.academicYear = query.academicYear;
    }

    const [schedules, total] = await Promise.all([
      FeeSchedule.find(filter)
        .populate('feeTypeId', 'name amount frequency category')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeeSchedule.countDocuments(filter),
    ]);

    return { schedules, total, page: query.page ?? 1, limit };
  }

  static async getFeeSchedule(id: string) {
    const schedule = await FeeSchedule.findOne({ _id: id, isDeleted: false }).populate(
      'feeTypeId',
    ).lean();
    if (!schedule) {
      throw new NotFoundError('Fee schedule not found');
    }
    return schedule;
  }

  static async updateFeeSchedule(id: string, data: UpdateFeeScheduleInput) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    const schedule = await FeeSchedule.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true },
    );
    if (!schedule) {
      throw new NotFoundError('Fee schedule not found');
    }
    return schedule;
  }

  static async deleteFeeSchedule(id: string) {
    const schedule = await FeeSchedule.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!schedule) {
      throw new NotFoundError('Fee schedule not found');
    }
    return schedule;
  }
}
