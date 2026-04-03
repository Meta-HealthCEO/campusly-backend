import mongoose from 'mongoose';
import { Asset, AssetCategory, AssetCheckOut } from './model.js';
import { AssetMaintenance, AssetInsurance } from './model-ext.js';
import { logger } from '../../common/logger.js';

interface DepreciationItem {
  assetId: string;
  name: string;
  assetTag: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  annualDepreciation: number;
  usefulLifeRemaining: number;
}

interface CategoryDepreciation {
  categoryName: string;
  categoryCode: string;
  assetCount: number;
  purchaseValue: number;
  currentValue: number;
  depreciation: number;
  depreciationRate: number;
}

export class AssetReportService {
  static async getSummary(schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const baseFilter = { schoolId: soid, isDeleted: false };

    const [
      totalAssets,
      byStatus,
      byCategory,
      totalValueAgg,
      recentAcquisitions,
      maintenanceDue,
      overdueCheckouts,
      insuranceExpiring,
    ] = await Promise.all([
      Asset.countDocuments(baseFilter),
      Asset.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Asset.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: '$categoryId',
            count: { $sum: 1 },
            value: { $sum: { $ifNull: ['$purchasePrice', 0] } },
          },
        },
        {
          $lookup: {
            from: 'assetcategories', localField: '_id', foreignField: '_id', as: 'cat',
          },
        },
        { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            category: { $ifNull: ['$cat.name', 'Uncategorized'] },
            count: 1, value: 1,
          },
        },
      ]),
      Asset.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$purchasePrice', 0] } } } },
      ]),
      Asset.countDocuments({
        ...baseFilter,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      AssetMaintenance.countDocuments({
        schoolId: soid, isDeleted: false,
        status: { $in: ['scheduled', 'in_progress'] },
        scheduledDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      }),
      AssetCheckOut.countDocuments({
        schoolId: soid, isDeleted: false,
        status: 'checked_out',
        expectedReturnDate: { $lt: new Date() },
      }),
      AssetInsurance.countDocuments({
        schoolId: soid, isDeleted: false,
        expiryDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of byStatus) {
      statusMap[s._id as string] = s.count as number;
    }

    return {
      totalAssets,
      totalValue: totalValueAgg[0]?.total ?? 0,
      byStatus: statusMap,
      byCategory: byCategory.map((c) => ({
        category: c.category as string,
        count: c.count as number,
        value: c.value as number,
      })),
      recentAcquisitions,
      maintenanceDue,
      overdueCheckouts,
      insuranceExpiringSoon: insuranceExpiring,
    };
  }

  static async getDepreciation(schoolId: string, asOfDate?: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const targetDate = asOfDate ? new Date(asOfDate) : new Date();

    const assets = await Asset.find({
      schoolId: soid, isDeleted: false,
      purchasePrice: { $gt: 0 },
      purchaseDate: { $ne: null },
    })
      .populate<{ categoryId: { name: string; code: string; depreciationRate?: number; usefulLifeYears?: number } }>(
        'categoryId', 'name code depreciationRate usefulLifeYears',
      )
      .lean();

    const items: DepreciationItem[] = [];
    const categoryMap = new Map<string, CategoryDepreciation>();
    let totalPurchaseValue = 0;
    let totalCurrentValue = 0;

    for (const asset of assets) {
      const cat = asset.categoryId as { name: string; code: string; depreciationRate?: number; usefulLifeYears?: number } | null;
      const usefulLife = cat?.usefulLifeYears ?? 5;
      const purchaseDate = asset.purchaseDate as Date;
      const msInService = targetDate.getTime() - purchaseDate.getTime();
      const yearsInService = msInService / (365.25 * 24 * 60 * 60 * 1000);
      const annualDep = Math.round((asset.purchasePrice as number) / usefulLife);
      const currentVal = Math.max(0, Math.round((asset.purchasePrice as number) - annualDep * yearsInService));
      const remaining = Math.max(0, usefulLife - yearsInService);

      items.push({
        assetId: String(asset._id),
        name: asset.name,
        assetTag: asset.assetTag,
        purchaseDate: purchaseDate.toISOString().slice(0, 10),
        purchasePrice: asset.purchasePrice as number,
        currentValue: currentVal,
        annualDepreciation: annualDep,
        usefulLifeRemaining: Math.round(remaining * 10) / 10,
      });

      totalPurchaseValue += asset.purchasePrice as number;
      totalCurrentValue += currentVal;

      const catCode = cat?.code ?? 'OTHER';
      const existing = categoryMap.get(catCode);
      if (existing) {
        existing.assetCount += 1;
        existing.purchaseValue += asset.purchasePrice as number;
        existing.currentValue += currentVal;
        existing.depreciation += (asset.purchasePrice as number) - currentVal;
      } else {
        categoryMap.set(catCode, {
          categoryName: cat?.name ?? 'Other',
          categoryCode: catCode,
          assetCount: 1,
          purchaseValue: asset.purchasePrice as number,
          currentValue: currentVal,
          depreciation: (asset.purchasePrice as number) - currentVal,
          depreciationRate: cat?.depreciationRate ?? 20,
        });
      }
    }

    return {
      asOfDate: targetDate.toISOString().slice(0, 10),
      totalPurchaseValue,
      totalCurrentValue,
      totalDepreciation: totalPurchaseValue - totalCurrentValue,
      byCategory: Array.from(categoryMap.values()),
      assets: items,
    };
  }

  static async getReplacementDue(schoolId: string, withinMonths: number = 12) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const assets = await Asset.find({
      schoolId: soid, isDeleted: false,
      purchasePrice: { $gt: 0 },
      purchaseDate: { $ne: null },
      status: { $nin: ['disposed', 'lost', 'stolen'] },
    })
      .populate<{ categoryId: { name: string; code: string; usefulLifeYears?: number } }>(
        'categoryId', 'name code usefulLifeYears',
      )
      .lean();

    const now = new Date();
    const result: Array<{
      assetId: string; name: string; assetTag: string;
      category: string; endOfLife: string; monthsRemaining: number;
    }> = [];

    for (const asset of assets) {
      const cat = asset.categoryId as { name: string; usefulLifeYears?: number } | null;
      const usefulLife = cat?.usefulLifeYears ?? 5;
      const purchaseDate = asset.purchaseDate as Date;
      const endOfLife = new Date(purchaseDate);
      endOfLife.setFullYear(endOfLife.getFullYear() + usefulLife);

      const monthsRemaining = (endOfLife.getTime() - now.getTime()) / (30 * 24 * 60 * 60 * 1000);
      if (monthsRemaining <= withinMonths) {
        result.push({
          assetId: String(asset._id),
          name: asset.name,
          assetTag: asset.assetTag,
          category: cat?.name ?? 'Other',
          endOfLife: endOfLife.toISOString().slice(0, 10),
          monthsRemaining: Math.round(monthsRemaining * 10) / 10,
        });
      }
    }

    return result.sort((a, b) => a.monthsRemaining - b.monthsRemaining);
  }

  static async getMaintenanceCosts(schoolId: string, year?: number, categoryId?: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const targetYear = year ?? new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01`);
    const endDate = new Date(`${targetYear + 1}-01-01`);

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          schoolId: soid,
          isDeleted: false,
          status: 'completed',
          completedDate: { $gte: startDate, $lt: endDate },
          cost: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: 'assets', localField: 'assetId', foreignField: '_id', as: 'asset',
        },
      },
      { $unwind: '$asset' },
    ];

    if (categoryId) {
      pipeline.push({ $match: { 'asset.categoryId': new mongoose.Types.ObjectId(categoryId) } });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'assetcategories', localField: 'asset.categoryId', foreignField: '_id', as: 'cat',
        },
      },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$asset.categoryId',
          categoryName: { $first: '$cat.name' },
          totalCost: { $sum: '$cost' },
          recordCount: { $sum: 1 },
        },
      },
      { $sort: { totalCost: -1 } },
    );

    const results = await AssetMaintenance.aggregate(pipeline);

    const totalCost = results.reduce((sum, r) => sum + (r.totalCost as number), 0);
    return {
      year: targetYear,
      totalCost,
      byCategory: results.map((r) => ({
        category: (r.categoryName as string) ?? 'Other',
        totalCost: r.totalCost as number,
        recordCount: r.recordCount as number,
      })),
    };
  }

  static async generateQrData(assetId: string, schoolId: string) {
    const asset = await Asset.findOne({
      _id: new mongoose.Types.ObjectId(assetId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!asset) return null;

    return {
      url: `/admin/assets/register/${assetId}`,
      assetTag: asset.assetTag,
      name: asset.name,
    };
  }
}
