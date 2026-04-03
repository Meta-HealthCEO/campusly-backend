import mongoose from 'mongoose';
import { Asset } from './model.js';
import { AssetMaintenance } from './model-ext.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import type { CreateMaintenanceInput, UpdateMaintenanceInput } from './validation.js';

export class AssetMaintenanceService {
  static async create(assetId: string, schoolId: string, userId: string, data: CreateMaintenanceInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const aoid = new mongoose.Types.ObjectId(assetId);

    // Verify asset exists
    const asset = await Asset.findOne({ _id: aoid, schoolId: soid, isDeleted: false }).lean();
    if (!asset) throw new NotFoundError('Asset not found');

    const record = await AssetMaintenance.create({
      ...data,
      assetId: aoid,
      schoolId: soid,
      createdBy: new mongoose.Types.ObjectId(userId),
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
    });

    logger.info({ maintenanceId: record._id, assetId }, 'Maintenance record created');
    return record.toObject();
  }

  static async listByAsset(assetId: string, schoolId: string) {
    return AssetMaintenance.find({
      assetId: new mongoose.Types.ObjectId(assetId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .sort({ scheduledDate: -1, createdAt: -1 })
      .lean();
  }

  static async update(id: string, schoolId: string, data: UpdateMaintenanceInput) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.completedDate) updateData.completedDate = new Date(data.completedDate);

    const record = await AssetMaintenance.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      },
      { $set: updateData },
      { new: true },
    ).lean();
    if (!record) throw new NotFoundError('Maintenance record not found');
    return record;
  }

  static async listUpcoming(schoolId: string, days: number = 30) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return AssetMaintenance.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
      status: { $in: ['scheduled', 'in_progress'] },
      scheduledDate: { $gte: now, $lte: future },
    })
      .populate('assetId', 'name assetTag')
      .sort({ scheduledDate: 1 })
      .lean();
  }

  static async listAll(query: {
    schoolId: string;
    status?: string;
    assetId?: string;
    page?: number;
    limit?: number;
  }) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(query.schoolId),
      isDeleted: false,
    };
    if (query.status) filter.status = query.status;
    if (query.assetId) filter.assetId = new mongoose.Types.ObjectId(query.assetId);

    const [records, total] = await Promise.all([
      AssetMaintenance.find(filter)
        .populate('assetId', 'name assetTag')
        .populate('createdBy', 'firstName lastName')
        .sort({ scheduledDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AssetMaintenance.countDocuments(filter),
    ]);

    return { records, total, page: query.page ?? 1, limit, totalPages: Math.ceil(total / limit) };
  }
}
