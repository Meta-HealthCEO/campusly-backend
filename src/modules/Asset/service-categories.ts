import mongoose from 'mongoose';
import { AssetCategory } from './model.js';
import { Asset } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type { CreateAssetCategoryInput, UpdateAssetCategoryInput } from './validation.js';

interface DefaultCategory {
  code: string;
  name: string;
  depreciationRate: number;
  usefulLifeYears: number;
  parentCode?: string;
}

const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { code: 'IT', name: 'IT Equipment', depreciationRate: 33.33, usefulLifeYears: 3 },
  { code: 'IT-LAPTOP', name: 'Laptops', depreciationRate: 33.33, usefulLifeYears: 3, parentCode: 'IT' },
  { code: 'IT-TABLET', name: 'Tablets', depreciationRate: 33.33, usefulLifeYears: 3, parentCode: 'IT' },
  { code: 'IT-PROJ', name: 'Projectors', depreciationRate: 20, usefulLifeYears: 5, parentCode: 'IT' },
  { code: 'IT-NET', name: 'Networking', depreciationRate: 20, usefulLifeYears: 5, parentCode: 'IT' },
  { code: 'FURN', name: 'Furniture', depreciationRate: 10, usefulLifeYears: 10 },
  { code: 'FURN-DESK', name: 'Desks & Chairs', depreciationRate: 10, usefulLifeYears: 10, parentCode: 'FURN' },
  { code: 'FURN-STORE', name: 'Storage & Shelving', depreciationRate: 10, usefulLifeYears: 10, parentCode: 'FURN' },
  { code: 'LAB', name: 'Laboratory Equipment', depreciationRate: 20, usefulLifeYears: 5 },
  { code: 'SPORT', name: 'Sports Equipment', depreciationRate: 25, usefulLifeYears: 4 },
  { code: 'MUSIC', name: 'Musical Instruments', depreciationRate: 10, usefulLifeYears: 10 },
  { code: 'VEHICLE', name: 'Vehicles', depreciationRate: 20, usefulLifeYears: 5 },
  { code: 'KITCHEN', name: 'Kitchen Equipment', depreciationRate: 20, usefulLifeYears: 5 },
  { code: 'AV', name: 'Audio Visual', depreciationRate: 20, usefulLifeYears: 5 },
  { code: 'OTHER', name: 'Other Assets', depreciationRate: 20, usefulLifeYears: 5 },
];

export class AssetCategoryService {
  static async create(schoolId: string, data: CreateAssetCategoryInput) {
    const existing = await AssetCategory.findOne({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      code: data.code,
      isDeleted: false,
    }).lean();
    if (existing) throw new BadRequestError(`Category code "${data.code}" already exists`);

    const doc: Record<string, unknown> = {
      ...data,
      schoolId: new mongoose.Types.ObjectId(schoolId),
    };
    if (data.parentId) doc.parentId = new mongoose.Types.ObjectId(data.parentId);
    const category = await AssetCategory.create(doc);
    logger.info({ categoryId: category._id }, 'Asset category created');
    return category.toObject();
  }

  static async list(schoolId: string) {
    const categories = await AssetCategory.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .sort({ code: 1 })
      .lean();
    return categories;
  }

  static async update(id: string, schoolId: string, data: UpdateAssetCategoryInput) {
    if (data.code) {
      const existing = await AssetCategory.findOne({
        schoolId: new mongoose.Types.ObjectId(schoolId),
        code: data.code,
        _id: { $ne: new mongoose.Types.ObjectId(id) },
        isDeleted: false,
      }).lean();
      if (existing) throw new BadRequestError(`Category code "${data.code}" already exists`);
    }

    const category = await AssetCategory.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false },
      { $set: data },
      { new: true },
    ).lean();
    if (!category) throw new NotFoundError('Asset category not found');
    return category;
  }

  static async remove(id: string, schoolId: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const assetCount = await Asset.countDocuments({ categoryId: oid, schoolId: soid, isDeleted: false });
    if (assetCount > 0) {
      throw new BadRequestError(`Cannot delete category: ${assetCount} asset(s) are linked to it`);
    }

    const category = await AssetCategory.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    ).lean();
    if (!category) throw new NotFoundError('Asset category not found');

    // Also soft-delete child categories
    await AssetCategory.updateMany(
      { parentId: oid, schoolId: soid, isDeleted: false },
      { $set: { isDeleted: true } },
    );

    logger.info({ categoryId: id }, 'Asset category deleted');
  }

  static async seed(schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const parentMap = new Map<string, mongoose.Types.ObjectId>();

    // First pass: create parent categories
    for (const cat of DEFAULT_CATEGORIES.filter((c) => !c.parentCode)) {
      const result = await AssetCategory.findOneAndUpdate(
        { schoolId: soid, code: cat.code },
        {
          $setOnInsert: {
            schoolId: soid,
            name: cat.name,
            code: cat.code,
            depreciationRate: cat.depreciationRate,
            usefulLifeYears: cat.usefulLifeYears,
            isActive: true,
            isDeleted: false,
          },
        },
        { upsert: true, new: true },
      ).lean();
      parentMap.set(cat.code, result._id as mongoose.Types.ObjectId);
    }

    // Second pass: create child categories
    for (const cat of DEFAULT_CATEGORIES.filter((c) => c.parentCode)) {
      const parentId = parentMap.get(cat.parentCode!);
      await AssetCategory.findOneAndUpdate(
        { schoolId: soid, code: cat.code },
        {
          $setOnInsert: {
            schoolId: soid,
            name: cat.name,
            code: cat.code,
            parentId: parentId ?? null,
            depreciationRate: cat.depreciationRate,
            usefulLifeYears: cat.usefulLifeYears,
            isActive: true,
            isDeleted: false,
          },
        },
        { upsert: true, new: true },
      );
    }

    logger.info({ schoolId }, 'Default asset categories seeded');
    return this.list(schoolId);
  }
}
