import mongoose from 'mongoose';
import { Asset, AssetCategory, AssetCheckOut } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import type { CreateAssetInput, UpdateAssetInput, AssignAssetInput, CheckOutInput, CheckInInput } from './validation.js';

interface AssetListQuery {
  schoolId: string;
  categoryId?: string;
  locationId?: string;
  status?: string;
  condition?: string;
  isPortable?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class AssetService {
  // ─── CRUD ──────────────────────────────────────────────────────────────

  static async create(schoolId: string, data: CreateAssetInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);

    // Verify category exists
    const category = await AssetCategory.findOne({
      _id: new mongoose.Types.ObjectId(data.categoryId),
      schoolId: soid,
      isDeleted: false,
    }).lean();
    if (!category) throw new BadRequestError('Asset category not found');

    const assetData: Record<string, unknown> = {
      ...data,
      schoolId: soid,
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
      locationId: data.locationId ? new mongoose.Types.ObjectId(data.locationId) : undefined,
    };
    const asset = await Asset.create(assetData);

    const populated = await Asset.findById(asset._id)
      .populate('categoryId', 'name code')
      .populate('locationId', 'name')
      .lean();

    logger.info({ assetId: asset._id, assetTag: data.assetTag }, 'Asset registered');
    return populated;
  }

  static async list(query: AssetListQuery) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(query.schoolId),
      isDeleted: false,
    };

    if (query.categoryId) filter.categoryId = new mongoose.Types.ObjectId(query.categoryId);
    if (query.locationId) filter.locationId = new mongoose.Types.ObjectId(query.locationId);
    if (query.status) filter.status = query.status;
    if (query.condition) filter.condition = query.condition;
    if (query.isPortable === 'true') filter.isPortable = true;
    if (query.assignedTo) filter.assignedTo = new mongoose.Types.ObjectId(query.assignedTo);
    if (query.search) {
      const regex = { $regex: query.search, $options: 'i' };
      filter.$or = [{ name: regex }, { assetTag: regex }, { serialNumber: regex }];
    }

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .populate('categoryId', 'name code depreciationRate usefulLifeYears')
        .populate('locationId', 'name type building')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Asset.countDocuments(filter),
    ]);

    return {
      assets,
      total,
      page: query.page ?? 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: string, schoolId: string) {
    const asset = await Asset.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('categoryId', 'name code depreciationRate usefulLifeYears')
      .populate('locationId', 'name type building')
      .lean();
    if (!asset) throw new NotFoundError('Asset not found');
    return asset;
  }

  static async update(id: string, schoolId: string, data: UpdateAssetInput) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.categoryId) updateData.categoryId = new mongoose.Types.ObjectId(data.categoryId);
    if (data.locationId) updateData.locationId = new mongoose.Types.ObjectId(data.locationId);
    if (data.locationId === null) updateData.locationId = null;

    const asset = await Asset.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      },
      { $set: updateData },
      { new: true },
    )
      .populate('categoryId', 'name code depreciationRate usefulLifeYears')
      .populate('locationId', 'name type building')
      .lean();
    if (!asset) throw new NotFoundError('Asset not found');
    return asset;
  }

  static async remove(id: string, schoolId: string) {
    const asset = await Asset.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      },
      { $set: { isDeleted: true } },
      { new: true },
    ).lean();
    if (!asset) throw new NotFoundError('Asset not found');
    logger.info({ assetId: id }, 'Asset deleted');
  }

  // ─── Assignment ────────────────────────────────────────────────────────

  static async assign(id: string, schoolId: string, userId: string, data: AssignAssetInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const asset = await Asset.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), schoolId: soid, isDeleted: false },
      {
        $set: {
          assignedTo: new mongoose.Types.ObjectId(data.assignedTo),
          assignedToType: data.assignedToType,
        },
        $push: {
          assignmentHistory: {
            assignedTo: new mongoose.Types.ObjectId(data.assignedTo),
            assignedToType: data.assignedToType,
            assignedBy: new mongoose.Types.ObjectId(userId),
            assignedAt: new Date(),
            notes: data.notes ?? '',
          },
        },
      },
      { new: true },
    ).lean();
    if (!asset) throw new NotFoundError('Asset not found');
    logger.info({ assetId: id, assignedTo: data.assignedTo }, 'Asset assigned');
    return asset;
  }

  static async unassign(id: string, schoolId: string) {
    const asset = await Asset.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      },
      {
        $set: {
          assignedTo: null,
          assignedToType: null,
          'assignmentHistory.$[last].unassignedAt': new Date(),
        },
      },
      { new: true },
    ).lean();
    if (!asset) throw new NotFoundError('Asset not found');
    // Update last assignment history entry
    await Asset.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { 'assignmentHistory.$[elem].unassignedAt': new Date() } },
      { arrayFilters: [{ 'elem.unassignedAt': null }] },
    );
    return asset;
  }

  // ─── Check-Out / Check-In ─────────────────────────────────────────────

  static async checkOut(assetId: string, schoolId: string, userId: string, data: CheckOutInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const aoid = new mongoose.Types.ObjectId(assetId);

    const asset = await Asset.findOne({ _id: aoid, schoolId: soid, isDeleted: false }).lean();
    if (!asset) throw new NotFoundError('Asset not found');
    if (!asset.isPortable) throw new BadRequestError('Only portable assets can be checked out');

    const activeCheckout = await AssetCheckOut.findOne({
      assetId: aoid, schoolId: soid, status: 'checked_out', isDeleted: false,
    }).lean();
    if (activeCheckout) throw new BadRequestError('Asset is already checked out');

    const checkout = await AssetCheckOut.create({
      assetId: aoid,
      schoolId: soid,
      borrowerId: new mongoose.Types.ObjectId(data.borrowerId),
      checkedOutBy: new mongoose.Types.ObjectId(userId),
      checkedOutAt: new Date(),
      expectedReturnDate: new Date(data.expectedReturnDate),
      conditionOut: asset.condition ?? 'good',
      purpose: data.purpose,
      status: 'checked_out',
      notes: data.notes ?? '',
    });

    logger.info({ checkoutId: checkout._id, assetId }, 'Asset checked out');
    return checkout.toObject();
  }

  static async checkIn(assetId: string, schoolId: string, userId: string, data: CheckInInput) {
    const checkout = await AssetCheckOut.findOneAndUpdate(
      {
        assetId: new mongoose.Types.ObjectId(assetId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        status: 'checked_out',
        isDeleted: false,
      },
      {
        $set: {
          status: 'returned',
          checkedInAt: new Date(),
          checkedInBy: new mongoose.Types.ObjectId(userId),
          conditionIn: data.conditionIn ?? null,
          notes: data.notes ?? '',
        },
      },
      { new: true },
    ).lean();
    if (!checkout) throw new NotFoundError('No active check-out found for this asset');

    // Update asset condition if provided
    if (data.conditionIn) {
      await Asset.updateOne(
        { _id: new mongoose.Types.ObjectId(assetId) },
        { $set: { condition: data.conditionIn } },
      );
    }

    logger.info({ checkoutId: checkout._id, assetId }, 'Asset checked in');
    return checkout;
  }

  static async listCheckOuts(query: {
    schoolId: string;
    status?: string;
    assetId?: string;
    borrowerId?: string;
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
    if (query.borrowerId) filter.borrowerId = new mongoose.Types.ObjectId(query.borrowerId);

    const [checkOuts, total] = await Promise.all([
      AssetCheckOut.find(filter)
        .populate('assetId', 'name assetTag')
        .populate('borrowerId', 'firstName lastName email')
        .populate('checkedOutBy', 'firstName lastName')
        .populate('checkedInBy', 'firstName lastName')
        .sort({ checkedOutAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AssetCheckOut.countDocuments(filter),
    ]);

    return { checkOuts, total, page: query.page ?? 1, limit, totalPages: Math.ceil(total / limit) };
  }
}
