import { Request, Response } from 'express';
import { TransportService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class TransportController {
  // ─── Bus Route ────────────────────────────────────────────────────────────

  static async createBusRoute(req: Request, res: Response): Promise<void> {
    const busRoute = await TransportService.createBusRoute(req.body);
    res.status(201).json(apiResponse(true, busRoute, 'Bus route created successfully'));
  }

  static async listBusRoutes(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
    };

    const result = await TransportService.listBusRoutes(query);
    res.json(apiResponse(true, result, 'Bus routes retrieved successfully'));
  }

  static async getBusRoute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const busRoute = await TransportService.getBusRoute(req.params.id as string, schoolId);
    res.json(apiResponse(true, busRoute, 'Bus route retrieved successfully'));
  }

  static async updateBusRoute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const busRoute = await TransportService.updateBusRoute(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, busRoute, 'Bus route updated successfully'));
  }

  static async deleteBusRoute(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await TransportService.deleteBusRoute(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Bus route deleted successfully'));
  }

  // ─── Transport Assignment ─────────────────────────────────────────────────

  static async createAssignment(req: Request, res: Response): Promise<void> {
    const assignment = await TransportService.createAssignment(req.body);
    res.status(201).json(apiResponse(true, assignment, 'Transport assignment created successfully'));
  }

  static async listAssignments(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      busRouteId: req.query.busRouteId as string | undefined,
    };

    const result = await TransportService.listAssignments(query);
    res.json(apiResponse(true, result, 'Transport assignments retrieved successfully'));
  }

  static async getAssignment(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const assignment = await TransportService.getAssignment(req.params.id as string, schoolId);
    res.json(apiResponse(true, assignment, 'Transport assignment retrieved successfully'));
  }

  static async updateAssignment(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const assignment = await TransportService.updateAssignment(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, assignment, 'Transport assignment updated successfully'));
  }

  static async deleteAssignment(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await TransportService.deleteAssignment(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Transport assignment deleted successfully'));
  }

  // ─── Boarding Log ───────────────────────────────────────────────────────────

  static async createBoardingLog(req: Request, res: Response): Promise<void> {
    const boardingLog = await TransportService.createBoardingLog(req.body);
    res.status(201).json(apiResponse(true, boardingLog, 'Boarding log created successfully'));
  }

  static async logAlight(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const boardingLog = await TransportService.logAlight(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, boardingLog, 'Alighting logged successfully'));
  }

  static async listBoardingLogs(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      routeId: req.query.routeId as string | undefined,
      studentId: req.query.studentId as string | undefined,
      date: req.query.date as string | undefined,
    };

    const result = await TransportService.listBoardingLogsByRoute(query);
    res.json(apiResponse(true, result, 'Boarding logs retrieved successfully'));
  }

  // ─── Transport Alert ────────────────────────────────────────────────────────

  static async createTransportAlert(req: Request, res: Response): Promise<void> {
    const alert = await TransportService.createTransportAlert(req.body);
    res.status(201).json(apiResponse(true, alert, 'Transport alert created successfully'));
  }

  static async listTransportAlerts(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      routeId: req.query.routeId as string | undefined,
      isResolved: req.query.isResolved !== undefined ? req.query.isResolved === 'true' : undefined,
    };

    const result = await TransportService.listTransportAlerts(query);
    res.json(apiResponse(true, result, 'Transport alerts retrieved successfully'));
  }

  static async getTransportAlert(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const alert = await TransportService.getTransportAlert(req.params.id as string, schoolId);
    res.json(apiResponse(true, alert, 'Transport alert retrieved successfully'));
  }

  static async resolveTransportAlert(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const alert = await TransportService.resolveTransportAlert(req.params.id as string, schoolId);
    res.json(apiResponse(true, alert, 'Transport alert resolved successfully'));
  }

  static async deleteTransportAlert(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await TransportService.deleteTransportAlert(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Transport alert deleted successfully'));
  }

  // ─── Route Capacity ────────────────────────────────────────────────────────

  static async getRouteCapacity(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await TransportService.getRouteCapacity(schoolId, req.params.id as string);
    res.json(apiResponse(true, result, 'Route capacity retrieved successfully'));
  }

  static async getCapacityOverview(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await TransportService.getCapacityOverview(schoolId);
    res.json(apiResponse(true, result, 'Capacity overview retrieved successfully'));
  }

  static async getRouteStudents(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await TransportService.getRouteStudents(schoolId, req.params.id as string);
    res.json(apiResponse(true, result, 'Route students retrieved successfully'));
  }
}
