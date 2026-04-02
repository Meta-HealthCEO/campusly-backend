import mongoose from 'mongoose';
import {
  BusRoute,
  IBusRoute,
  TransportAssignment,
  ITransportAssignment,
  BoardingLog,
  IBoardingLog,
  TransportAlert,
  ITransportAlert,
} from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { transportBoardingQueue } from '../../jobs/queues.js';
import type {
  CreateBusRouteInput,
  UpdateBusRouteInput,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  CreateBoardingLogInput,
  LogAlightInput,
  CreateTransportAlertInput,
} from './validation.js';

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

interface ListBoardingLogQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  routeId?: string;
  studentId?: string;
  date?: string;
}

interface ListTransportAlertQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  routeId?: string;
  isResolved?: boolean;
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

  static async getBusRoute(id: string, schoolId: string): Promise<IBusRoute> {
    const busRoute = await BusRoute.findOne({ _id: id, schoolId, isDeleted: false });

    if (!busRoute) {
      throw new NotFoundError('Bus route not found');
    }

    return busRoute;
  }

  static async updateBusRoute(id: string, schoolId: string, data: UpdateBusRouteInput): Promise<IBusRoute> {
    const busRoute = await BusRoute.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!busRoute) {
      throw new NotFoundError('Bus route not found');
    }

    return busRoute;
  }

  static async deleteBusRoute(id: string, schoolId: string): Promise<IBusRoute> {
    const busRoute = await BusRoute.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
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

  static async getAssignment(id: string, schoolId: string): Promise<ITransportAssignment> {
    const assignment = await TransportAssignment.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('studentId')
      .populate('busRouteId', 'name');

    if (!assignment) {
      throw new NotFoundError('Transport assignment not found');
    }

    return assignment;
  }

  static async updateAssignment(id: string, schoolId: string, data: UpdateAssignmentInput): Promise<ITransportAssignment> {
    const assignment = await TransportAssignment.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
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

  static async deleteAssignment(id: string, schoolId: string): Promise<ITransportAssignment> {
    const assignment = await TransportAssignment.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!assignment) {
      throw new NotFoundError('Transport assignment not found');
    }

    return assignment;
  }

  // ─── Boarding Log CRUD ─────────────────────────────────────────────────────

  static async createBoardingLog(data: CreateBoardingLogInput): Promise<IBoardingLog> {
    const boardingLog = await BoardingLog.create(data);

    await transportBoardingQueue.add('parent-notify-board', {
      studentId: data.studentId,
      routeId: data.routeId,
      boardedAt: data.boardedAt,
    });

    return boardingLog;
  }

  static async logAlight(id: string, schoolId: string, data: LogAlightInput): Promise<IBoardingLog> {
    const boardingLog = await BoardingLog.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!boardingLog) {
      throw new NotFoundError('Boarding log not found');
    }

    return boardingLog;
  }

  static async listBoardingLogsByRoute(
    query: ListBoardingLogQuery,
  ): Promise<{
    boardingLogs: IBoardingLog[];
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

    if (query.routeId) {
      filter.routeId = query.routeId;
    }

    if (query.studentId) {
      filter.studentId = query.studentId;
    }

    if (query.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.date);
      end.setHours(23, 59, 59, 999);
      filter.boardedAt = { $gte: start, $lte: end };
    }

    const [boardingLogs, total] = await Promise.all([
      BoardingLog.find(filter)
        .populate('studentId')
        .populate('routeId', 'name')
        .sort('-boardedAt')
        .skip(skip)
        .limit(limit),
      BoardingLog.countDocuments(filter),
    ]);

    return {
      boardingLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Transport Alert CRUD ──────────────────────────────────────────────────

  static async createTransportAlert(data: CreateTransportAlertInput): Promise<ITransportAlert> {
    const alert = await TransportAlert.create(data);
    return alert;
  }

  static async listTransportAlerts(
    query: ListTransportAlertQuery,
  ): Promise<{
    alerts: ITransportAlert[];
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

    if (query.routeId) {
      filter.routeId = query.routeId;
    }

    if (query.isResolved !== undefined) {
      filter.isResolved = query.isResolved;
    }

    const [alerts, total] = await Promise.all([
      TransportAlert.find(filter)
        .populate('routeId', 'name')
        .populate('createdBy', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      TransportAlert.countDocuments(filter),
    ]);

    return {
      alerts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getTransportAlert(id: string, schoolId: string): Promise<ITransportAlert> {
    const alert = await TransportAlert.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('routeId', 'name')
      .populate('createdBy', 'name email');

    if (!alert) {
      throw new NotFoundError('Transport alert not found');
    }

    return alert;
  }

  static async resolveTransportAlert(id: string, schoolId: string): Promise<ITransportAlert> {
    const alert = await TransportAlert.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isResolved: true, resolvedAt: new Date() } },
      { new: true },
    );

    if (!alert) {
      throw new NotFoundError('Transport alert not found');
    }

    return alert;
  }

  static async deleteTransportAlert(id: string, schoolId: string): Promise<ITransportAlert> {
    const alert = await TransportAlert.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!alert) {
      throw new NotFoundError('Transport alert not found');
    }

    return alert;
  }

  // ─── Route Capacity ──────────────────────────────────────────────────────

  static async getRouteCapacity(
    schoolId: string,
    routeId: string,
  ): Promise<{
    routeId: string;
    routeName: string;
    capacity: number;
    assignedCount: number;
    availableSpots: number;
    utilisationPercent: number;
  }> {
    const route = await BusRoute.findOne({ _id: routeId, schoolId, isDeleted: false });
    if (!route) {
      throw new NotFoundError('Bus route not found');
    }

    const assignedCount = await TransportAssignment.countDocuments({
      busRouteId: routeId,
      schoolId,
      isDeleted: false,
    });

    const availableSpots = Math.max(0, route.capacity - assignedCount);
    const utilisationPercent = route.capacity > 0
      ? Math.round((assignedCount / route.capacity) * 100)
      : 0;

    return {
      routeId: String(route._id),
      routeName: route.name,
      capacity: route.capacity,
      assignedCount,
      availableSpots,
      utilisationPercent,
    };
  }

  static async getCapacityOverview(
    schoolId: string,
  ): Promise<{
    routeId: string;
    routeName: string;
    capacity: number;
    assignedCount: number;
    availableSpots: number;
    utilisationPercent: number;
  }[]> {
    const routes = await BusRoute.find({ schoolId, isDeleted: false, isActive: true })
      .sort('name')
      .lean();

    if (routes.length === 0) return [];

    const routeIds = routes.map((r) => r._id);
    const counts = await TransportAssignment.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), busRouteId: { $in: routeIds }, isDeleted: false } },
      { $group: { _id: '$busRouteId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const c of counts) {
      countMap.set(String(c._id), c.count as number);
    }

    return routes.map((route) => {
      const assignedCount = countMap.get(String(route._id)) ?? 0;
      const availableSpots = Math.max(0, route.capacity - assignedCount);
      const utilisationPercent = route.capacity > 0
        ? Math.round((assignedCount / route.capacity) * 100)
        : 0;

      return {
        routeId: String(route._id),
        routeName: route.name,
        capacity: route.capacity,
        assignedCount,
        availableSpots,
        utilisationPercent,
      };
    });
  }

  static async getRouteStudents(
    schoolId: string,
    routeId: string,
  ): Promise<ITransportAssignment[]> {
    const route = await BusRoute.findOne({ _id: routeId, schoolId, isDeleted: false });
    if (!route) {
      throw new NotFoundError('Bus route not found');
    }

    const assignments = await TransportAssignment.find({
      busRouteId: routeId,
      schoolId,
      isDeleted: false,
    })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email phone' } })
      .populate('busRouteId', 'name')
      .lean();

    return assignments;
  }
}
