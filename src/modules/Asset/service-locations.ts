import mongoose from 'mongoose';
import { AssetLocation, Asset } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type { CreateLocationInput, UpdateLocationInput } from './validation.js';

interface LocationFilters {
  schoolId: string;
  type?: string;
  building?: string;
  department?: string;
}

export class AssetLocationService {
  static async create(schoolId: string, data: CreateLocationInput) {
    const location = await AssetLocation.create({
      ...data,
      schoolId: new mongoose.Types.ObjectId(schoolId),
    });
    logger.info({ locationId: location._id }, 'Asset location created');
    return location.toObject();
  }

  static async list(filters: LocationFilters) {
    const query: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(filters.schoolId),
      isDeleted: false,
    };
    if (filters.type) query.type = filters.type;
    if (filters.building) query.building = filters.building;
    if (filters.department) query.department = filters.department;

    return AssetLocation.find(query).sort({ name: 1 }).lean();
  }

  static async update(id: string, schoolId: string, data: UpdateLocationInput) {
    const location = await AssetLocation.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      },
      { $set: data },
      { new: true },
    ).lean();
    if (!location) throw new NotFoundError('Location not found');
    return location;
  }

  static async remove(id: string, schoolId: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const assetCount = await Asset.countDocuments({ locationId: oid, schoolId: soid, isDeleted: false });
    if (assetCount > 0) {
      throw new BadRequestError(`Cannot delete location: ${assetCount} asset(s) are at this location`);
    }

    const location = await AssetLocation.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    ).lean();
    if (!location) throw new NotFoundError('Location not found');
    logger.info({ locationId: id }, 'Asset location deleted');
  }
}
