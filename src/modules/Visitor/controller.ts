import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { VisitorService, PreRegistrationService } from './service.js';
import { LateArrivalService, EarlyDepartureService, DailyReportService } from './service-student.js';
import type {
  RegisterVisitorInput,
  CheckoutVisitorInput,
  ListVisitorsInput,
  CreatePreRegistrationInput,
  ListPreRegistrationsInput,
  CreateLateArrivalInput,
  ListLateArrivalsInput,
  CreateEarlyDepartureInput,
  ListEarlyDeparturesInput,
} from './validation.js';

export class VisitorController {
  // ─── Visitors ───────────────────────────────────────────────────────────

  static async register(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: RegisterVisitorInput = req.body;
    const record = await VisitorService.register(user.schoolId as string, user.id, data);
    res.status(201).json(
      apiResponse(true, record, `Visitor registered. Pass number: ${record.passNumber}`),
    );
  }

  static async list(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const query: ListVisitorsInput = {
      status: req.query.status as ListVisitorsInput['status'],
      purpose: req.query.purpose as ListVisitorsInput['purpose'],
      date: req.query.date as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      search: req.query.search as string | undefined,
      hostId: req.query.hostId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await VisitorService.list(schoolId as string, query);
    res.json(apiResponse(true, result, 'Visitors listed'));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    const record = await VisitorService.getById(id as string, schoolId as string);
    res.json(apiResponse(true, record, 'Visitor retrieved'));
  }

  static async checkout(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    const data: CheckoutVisitorInput = req.body;
    const result = await VisitorService.checkout(id as string, schoolId as string, data);
    res.json(apiResponse(true, result, 'Visitor checked out'));
  }

  static async getOnPremises(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const result = await VisitorService.getOnPremises(schoolId as string);
    res.json(apiResponse(true, result, 'On-premises visitors retrieved'));
  }

  static async exportOnPremises(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const csv = await VisitorService.exportOnPremises(schoolId as string);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="on-premises-visitors.csv"');
    res.send(csv);
  }

  // ─── Pre-Registration ──────────────────────────────────────────────────

  static async createPreRegistration(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreatePreRegistrationInput = req.body;
    const record = await PreRegistrationService.create(
      user.schoolId as string,
      user.id,
      data,
    );
    res.status(201).json(apiResponse(true, record, 'Visitor pre-registered'));
  }

  static async listPreRegistrations(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const query: ListPreRegistrationsInput = {
      expectedDate: req.query.expectedDate as string | undefined,
      status: req.query.status as ListPreRegistrationsInput['status'],
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await PreRegistrationService.list(schoolId as string, query);
    res.json(apiResponse(true, result, 'Pre-registrations listed'));
  }

  static async cancelPreRegistration(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { id } = req.params;
    const record = await PreRegistrationService.cancel(
      id as string,
      user.schoolId as string,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, record, 'Pre-registration cancelled'));
  }

  // ─── Late Arrivals ─────────────────────────────────────────────────────

  static async createLateArrival(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateLateArrivalInput = req.body;
    const record = await LateArrivalService.create(
      user.schoolId as string,
      user.id,
      data,
    );
    res.status(201).json(apiResponse(true, record, 'Late arrival recorded'));
  }

  static async listLateArrivals(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const query: ListLateArrivalsInput = {
      date: req.query.date as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      classId: req.query.classId as string | undefined,
      studentId: req.query.studentId as string | undefined,
      reason: req.query.reason as ListLateArrivalsInput['reason'],
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await LateArrivalService.list(schoolId as string, query);
    res.json(apiResponse(true, result, 'Late arrivals listed'));
  }

  // ─── Early Departures ──────────────────────────────────────────────────

  static async createEarlyDeparture(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateEarlyDepartureInput = req.body;
    const record = await EarlyDepartureService.create(
      user.schoolId as string,
      user.id,
      data,
    );
    res.status(201).json(apiResponse(true, record, 'Early departure recorded'));
  }

  static async listEarlyDepartures(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const query: ListEarlyDeparturesInput = {
      date: req.query.date as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      classId: req.query.classId as string | undefined,
      studentId: req.query.studentId as string | undefined,
      reason: req.query.reason as ListEarlyDeparturesInput['reason'],
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await EarlyDepartureService.list(schoolId as string, query);
    res.json(apiResponse(true, result, 'Early departures listed'));
  }

  // ─── Daily Report ──────────────────────────────────────────────────────

  static async getDailyReport(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const date = req.query.date as string | undefined;
    const report = await DailyReportService.getReport(schoolId as string, date);
    res.json(apiResponse(true, report, 'Daily report retrieved'));
  }
}
