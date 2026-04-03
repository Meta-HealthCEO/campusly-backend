import mongoose from 'mongoose';
import { AssetInsurance } from './model-ext.js';
import { NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type { CreateInsuranceInput, UpdateInsuranceInput } from './validation.js';

export class AssetInsuranceService {
  static async create(schoolId: string, data: CreateInsuranceInput) {
    const policy = await AssetInsurance.create({
      ...data,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      categoryId: data.categoryId ? new mongoose.Types.ObjectId(data.categoryId) : undefined,
      startDate: new Date(data.startDate),
      expiryDate: new Date(data.expiryDate),
    });
    logger.info({ policyId: policy._id }, 'Insurance policy created');
    return policy.toObject();
  }

  static async list(schoolId: string) {
    return AssetInsurance.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('categoryId', 'name code')
      .sort({ expiryDate: 1 })
      .lean();
  }

  static async update(id: string, schoolId: string, data: UpdateInsuranceInput) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.categoryId) updateData.categoryId = new mongoose.Types.ObjectId(data.categoryId);
    if (data.categoryId === null) updateData.categoryId = null;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.expiryDate) updateData.expiryDate = new Date(data.expiryDate);

    const policy = await AssetInsurance.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      },
      { $set: updateData },
      { new: true },
    )
      .populate('categoryId', 'name code')
      .lean();
    if (!policy) throw new NotFoundError('Insurance policy not found');
    return policy;
  }

  static async remove(id: string, schoolId: string) {
    const policy = await AssetInsurance.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      },
      { $set: { isDeleted: true } },
      { new: true },
    ).lean();
    if (!policy) throw new NotFoundError('Insurance policy not found');
    logger.info({ policyId: id }, 'Insurance policy deleted');
  }

  static async listExpiring(schoolId: string, days: number = 60) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return AssetInsurance.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
      expiryDate: { $gte: now, $lte: future },
    })
      .populate('categoryId', 'name code')
      .sort({ expiryDate: 1 })
      .lean();
  }
}
