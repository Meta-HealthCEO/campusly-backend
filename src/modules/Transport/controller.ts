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
    const busRoute = await TransportService.getBusRoute(req.params.id as string);
    res.json(apiResponse(true, busRoute, 'Bus route retrieved successfully'));
  }

  static async updateBusRoute(req: Request, res: Response): Promise<void> {
    const busRoute = await TransportService.updateBusRoute(req.params.id as string, req.body);
    res.json(apiResponse(true, busRoute, 'Bus route updated successfully'));
  }

  static async deleteBusRoute(req: Request, res: Response): Promise<void> {
    await TransportService.deleteBusRoute(req.params.id as string);
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
    const assignment = await TransportService.getAssignment(req.params.id as string);
    res.json(apiResponse(true, assignment, 'Transport assignment retrieved successfully'));
  }

  static async updateAssignment(req: Request, res: Response): Promise<void> {
    const assignment = await TransportService.updateAssignment(req.params.id as string, req.body);
    res.json(apiResponse(true, assignment, 'Transport assignment updated successfully'));
  }

  static async deleteAssignment(req: Request, res: Response): Promise<void> {
    await TransportService.deleteAssignment(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Transport assignment deleted successfully'));
  }
}
