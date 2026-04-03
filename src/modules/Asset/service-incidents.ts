import mongoose from 'mongoose';
import { Asset } from './model.js';
import { AssetIncident } from './model-ext.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import type { CreateAssetIncidentInput, UpdateAssetIncidentInput } from './validation.js';

export class AssetIncidentService {
  static async create(
    assetId: string, schoolId: string, userId: string, data: CreateAssetIncidentInput,
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const aoid = new mongoose.Types.ObjectId(assetId);

    const asset = await Asset.findOne({ _id: aoid, schoolId: soid, isDeleted: false }).lean();
    if (!asset) throw new NotFoundError('Asset not found');

    const incident = await AssetIncident.create({
      ...data,
      assetId: aoid,
      schoolId: soid,
      reportedBy: new mongoose.Types.ObjectId(userId),
      date: new Date(data.date),
      responsiblePartyId: data.responsiblePartyId
        ? new mongoose.Types.ObjectId(data.responsiblePartyId) : undefined,
      status: 'reported',
    });

    logger.info({ incidentId: incident._id, assetId }, 'Asset incident reported');
    return incident.toObject();
  }

  static async list(query: {
    schoolId: string;
    type?: string;
    assetId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(query.schoolId),
      isDeleted: false,
    };
    if (query.type) filter.type = query.type;
    if (query.assetId) filter.assetId = new mongoose.Types.ObjectId(query.assetId);
    if (query.status) filter.status = query.status;

    const [incidents, total] = await Promise.all([
      AssetIncident.find(filter)
        .populate('assetId', 'name assetTag')
        .populate('reportedBy', 'firstName lastName')
        .populate('responsiblePartyId', 'firstName lastName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AssetIncident.countDocuments(filter),
    ]);

    return { incidents, total, page: query.page ?? 1, limit, totalPages: Math.ceil(total / limit) };
  }

  static async update(id: string, schoolId: string, data: UpdateAssetIncidentInput) {
    const incident = await AssetIncident.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      },
      { $set: data },
      { new: true },
    ).lean();
    if (!incident) throw new NotFoundError('Incident not found');
    return incident;
  }
}
