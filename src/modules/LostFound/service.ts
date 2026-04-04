import mongoose from 'mongoose';
import { LostItem, ILostItem } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';

interface GetItemsFilters {
  status?: string;
  category?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

interface LostFoundStats {
  totalFound: number;
  totalClaimed: number;
  totalUnclaimed: number;
  totalReturned: number;
  avgDaysToClaim: number;
}

export class LostFoundService {
  static async reportFoundItem(
    data: {
      schoolId: string;
      itemName: string;
      description: string;
      category: string;
      locationFound?: string;
      dateFound?: string;
      photos?: string[];
      studentId?: string;
    },
    reportedBy: string,
  ): Promise<ILostItem> {
    const item = await LostItem.create({
      ...data,
      type: 'found',
      status: 'found',
      reportedBy,
      dateFound: data.dateFound ? new Date(data.dateFound) : new Date(),
    });
    return item;
  }

  static async reportLostItem(
    data: {
      schoolId: string;
      itemName: string;
      description: string;
      category: string;
      locationLost?: string;
      dateLost?: string;
      photos?: string[];
      studentId?: string;
    },
    reportedBy: string,
  ): Promise<ILostItem> {
    const item = await LostItem.create({
      ...data,
      type: 'lost',
      status: 'lost',
      reportedBy,
      dateLost: data.dateLost ? new Date(data.dateLost) : new Date(),
    });
    return item;
  }

  static async getItems(
    schoolId: string,
    filters: GetItemsFilters,
    page?: number,
    limit?: number,
  ): Promise<{ items: ILostItem[]; total: number }> {
    const { skip, limit: take } = paginationHelper(page, limit);

    const query: Record<string, unknown> = {
      schoolId,
      isDeleted: false,
    };

    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.type) query.type = filters.type;

    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.startDate) dateFilter.$gte = new Date(filters.startDate);
      if (filters.endDate) dateFilter.$lte = new Date(filters.endDate);
      query.createdAt = dateFilter;
    }

    const [items, total] = await Promise.all([
      LostItem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .populate('reportedBy', 'firstName lastName email')
        .populate('claimedBy', 'firstName lastName email')
        .populate('studentId', 'firstName lastName'),
      LostItem.countDocuments(query),
    ]);

    return { items, total };
  }

  static async getItemById(id: string, schoolId: string): Promise<ILostItem> {
    const item = await LostItem.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('reportedBy', 'firstName lastName email')
      .populate('claimedBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email')
      .populate('matchedItemId')
      .populate('studentId', 'firstName lastName');

    if (!item) {
      throw new NotFoundError('Lost & found item not found');
    }

    return item;
  }

  static async claimItem(itemId: string, schoolId: string, claimedBy: string, studentId?: string): Promise<ILostItem> {
    const item = await LostItem.findOne({ _id: itemId, schoolId, isDeleted: false });

    if (!item) {
      throw new NotFoundError('Lost & found item not found');
    }

    if (item.status === 'claimed' || item.status === 'returned') {
      throw new BadRequestError('This item has already been claimed or returned');
    }

    if (item.status === 'archived') {
      throw new BadRequestError('This item has been archived');
    }

    item.claimedBy = new mongoose.Types.ObjectId(claimedBy);
    item.claimedDate = new Date();
    item.status = 'claimed';
    if (studentId) {
      item.studentId = new mongoose.Types.ObjectId(studentId);
    }

    await item.save();
    return item;
  }

  static async verifyAndReturn(itemId: string, schoolId: string, verifiedBy: string): Promise<ILostItem> {
    const item = await LostItem.findOne({ _id: itemId, schoolId, isDeleted: false });

    if (!item) {
      throw new NotFoundError('Lost & found item not found');
    }

    if (item.status !== 'claimed') {
      throw new BadRequestError('Only claimed items can be verified and returned');
    }

    item.verifiedBy = new mongoose.Types.ObjectId(verifiedBy);
    item.status = 'returned';

    await item.save();
    return item;
  }

  static async matchItems(lostItemId: string, foundItemId: string, schoolId: string): Promise<{ lostItem: ILostItem; foundItem: ILostItem }> {
    const [lostItem, foundItem] = await Promise.all([
      LostItem.findOne({ _id: lostItemId, schoolId, isDeleted: false }),
      LostItem.findOne({ _id: foundItemId, schoolId, isDeleted: false }),
    ]);

    if (!lostItem) throw new NotFoundError('Lost item not found');
    if (!foundItem) throw new NotFoundError('Found item not found');

    if (lostItem.type !== 'lost') throw new BadRequestError('First item must be a lost report');
    if (foundItem.type !== 'found') throw new BadRequestError('Second item must be a found item');

    lostItem.matchedItemId = foundItem._id as mongoose.Types.ObjectId;
    foundItem.matchedItemId = lostItem._id as mongoose.Types.ObjectId;

    await Promise.all([lostItem.save(), foundItem.save()]);

    return { lostItem, foundItem };
  }

  static async autoMatchSuggestions(itemId: string, schoolId: string): Promise<ILostItem[]> {
    const item = await LostItem.findOne({ _id: itemId, schoolId, isDeleted: false });

    if (!item) {
      throw new NotFoundError('Lost & found item not found');
    }

    const oppositeType = item.type === 'lost' ? 'found' : 'lost';

    const dateField = item.type === 'lost' ? 'dateFound' : 'dateLost';
    const itemDate = item.type === 'lost' ? item.dateLost : item.dateFound;

    const query: Record<string, unknown> = {
      schoolId: item.schoolId,
      type: oppositeType,
      category: item.category,
      isDeleted: false,
      status: 'found',
      matchedItemId: { $exists: false },
    };

    // Look within 14 days of the item date
    if (itemDate) {
      const startDate = new Date(itemDate);
      startDate.setDate(startDate.getDate() - 14);
      const endDate = new Date(itemDate);
      endDate.setDate(endDate.getDate() + 14);
      query[dateField] = { $gte: startDate, $lte: endDate };
    }

    const suggestions = await LostItem.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('reportedBy', 'firstName lastName email');

    return suggestions;
  }

  static async archiveOldItems(schoolId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await LostItem.updateMany(
      {
        schoolId,
        status: 'found',
        isDeleted: false,
        createdAt: { $lte: thirtyDaysAgo },
      },
      {
        $set: {
          status: 'archived',
          archivedDate: new Date(),
        },
      },
    );

    return result.modifiedCount;
  }

  static async getStats(schoolId: string): Promise<LostFoundStats> {
    const [totalFound, totalClaimed, totalUnclaimed, totalReturned, claimAggregation] = await Promise.all([
      LostItem.countDocuments({ schoolId, type: 'found', isDeleted: false }),
      LostItem.countDocuments({ schoolId, status: 'claimed', isDeleted: false }),
      LostItem.countDocuments({ schoolId, status: 'found', type: 'found', isDeleted: false }),
      LostItem.countDocuments({ schoolId, status: 'returned', isDeleted: false }),
      LostItem.aggregate([
        {
          $match: {
            schoolId: new mongoose.Types.ObjectId(schoolId),
            claimedDate: { $exists: true },
            isDeleted: false,
          },
        },
        {
          $project: {
            daysToClaim: {
              $divide: [
                { $subtract: ['$claimedDate', '$createdAt'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDays: { $avg: '$daysToClaim' },
          },
        },
      ]),
    ]);

    return {
      totalFound,
      totalClaimed,
      totalUnclaimed,
      totalReturned,
      avgDaysToClaim: claimAggregation[0]?.avgDays
        ? Math.round(claimAggregation[0].avgDays * 10) / 10
        : 0,
    };
  }

  static async getHotspotReport(
    schoolId: string,
    dateRange?: { startDate?: string; endDate?: string },
  ) {
    const matchFilter: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    if (dateRange?.startDate || dateRange?.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (dateRange.startDate) dateFilter.$gte = new Date(dateRange.startDate);
      if (dateRange.endDate) dateFilter.$lte = new Date(dateRange.endDate);
      matchFilter.createdAt = dateFilter;
    }

    const [byLocation, byCategory, byMonth] = await Promise.all([
      LostItem.aggregate([
        { $match: { ...matchFilter, type: 'lost' } },
        {
          $group: {
            _id: { $ifNull: ['$locationLost', 'Unknown'] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, location: '$_id', count: 1 } },
      ]),
      LostItem.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, category: '$_id', count: 1 } },
      ]),
      LostItem.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    return { byLocation, byCategory, byMonth };
  }

  static async softDelete(id: string, schoolId: string): Promise<ILostItem> {
    const item = await LostItem.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!item) {
      throw new NotFoundError('Lost & found item not found');
    }

    return item;
  }
}
