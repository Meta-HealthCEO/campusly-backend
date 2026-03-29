import { BusRoute, IBusRoute, TransportAssignment, ITransportAssignment } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateBusRouteInput, UpdateBusRouteInput, CreateAssignmentInput, UpdateAssignmentInput } from './validation.js';

interface ListBusRouteQuery {
  page?: number;
  limit?: number;
  sort?: string;
  schoolId?: string;
  isActive?: boolean;
}

interface ListAssignmentQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  busRouteId?: string;
}

export class TransportService {
  // ─── Bus Route CRUD ───────────────────────────────────────────────────────

  static async createBusRoute(data: CreateBusRouteInput): Promise<IBusRoute> {
    const busRoute = await BusRoute.create(data);
    return busRoute;
  }

  static async listBusRoutes(
    query: ListBusRouteQuery,
  ): Promise<{
    busRoutes: IBusRoute[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);
    const sortField = query.sort ?? '-createdAt';

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [busRoutes, total] = await Promise.all([
      BusRoute.find(filter).sort(sortField).skip(skip).limit(limit),
      BusRoute.countDocuments(filter),
    ]);

    return {
      busRoutes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getBusRoute(id: string): Promise<IBusRoute> {
    const busRoute = await BusRoute.findOne({ _id: id, isDeleted: false });

    if (!busRoute) {
      throw new NotFoundError('Bus route not found');
    }

    return busRoute;
  }

  static async updateBusRoute(id: string, data: UpdateBusRouteInput): Promise<IBusRoute> {
    const busRoute = await BusRoute.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!busRoute) {
      throw new NotFoundError('Bus route not found');
    }

    return busRoute;
  }

  static async deleteBusRoute(id: string): Promise<IBusRoute> {
    const busRoute = await BusRoute.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!busRoute) {
      throw new NotFoundError('Bus route not found');
    }

    return busRoute;
  }

  // ─── Transport Assignment CRUD ────────────────────────────────────────────

  static async createAssignment(data: CreateAssignmentInput): Promise<ITransportAssignment> {
    const assignment = await TransportAssignment.create(data);
    return assignment;
  }

  static async listAssignments(
    query: ListAssignmentQuery,
  ): Promise<{
    assignments: ITransportAssignment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.busRouteId) {
      filter.busRouteId = query.busRouteId;
    }

    const [assignments, total] = await Promise.all([
      TransportAssignment.find(filter)
        .populate('studentId')
        .populate('busRouteId', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      TransportAssignment.countDocuments(filter),
    ]);

    return {
      assignments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getAssignment(id: string): Promise<ITransportAssignment> {
    const assignment = await TransportAssignment.findOne({ _id: id, isDeleted: false })
      .populate('studentId')
      .populate('busRouteId', 'name');

    if (!assignment) {
      throw new NotFoundError('Transport assignment not found');
    }

    return assignment;
  }

  static async updateAssignment(id: string, data: UpdateAssignmentInput): Promise<ITransportAssignment> {
    const assignment = await TransportAssignment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('studentId')
      .populate('busRouteId', 'name');

    if (!assignment) {
      throw new NotFoundError('Transport assignment not found');
    }

    return assignment;
  }

  static async deleteAssignment(id: string): Promise<ITransportAssignment> {
    const assignment = await TransportAssignment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!assignment) {
      throw new NotFoundError('Transport assignment not found');
    }

    return assignment;
  }
}
