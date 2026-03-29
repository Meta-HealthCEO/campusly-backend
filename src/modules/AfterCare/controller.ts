import { Request, Response } from 'express';
import { AfterCareService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class AfterCareController {
  // ─── Registration ─────────────────────────────────────────────────────────

  static async createRegistration(req: Request, res: Response): Promise<void> {
    const registration = await AfterCareService.createRegistration(req.body);
    res.status(201).json(apiResponse(true, registration, 'After care registration created successfully'));
  }

  static async listRegistrations(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
    };

    const result = await AfterCareService.listRegistrations(query);
    res.json(apiResponse(true, result, 'Registrations retrieved successfully'));
  }

  static async getRegistration(req: Request, res: Response): Promise<void> {
    const registration = await AfterCareService.getRegistration(req.params.id as string);
    res.json(apiResponse(true, registration, 'Registration retrieved successfully'));
  }

  static async updateRegistration(req: Request, res: Response): Promise<void> {
    const registration = await AfterCareService.updateRegistration(req.params.id as string, req.body);
    res.json(apiResponse(true, registration, 'Registration updated successfully'));
  }

  static async deleteRegistration(req: Request, res: Response): Promise<void> {
    await AfterCareService.deleteRegistration(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Registration deleted successfully'));
  }

  // ─── Attendance ───────────────────────────────────────────────────────────

  static async checkIn(req: Request, res: Response): Promise<void> {
    const attendance = await AfterCareService.checkIn(req.body, req.user!.id);
    res.status(201).json(apiResponse(true, attendance, 'Check-in recorded successfully'));
  }

  static async checkOut(req: Request, res: Response): Promise<void> {
    const attendance = await AfterCareService.checkOut(
      req.params.id as string,
      req.body,
      req.user!.id,
    );
    res.json(apiResponse(true, attendance, 'Check-out recorded successfully'));
  }

  static async listAttendance(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      studentId: req.query.studentId as string | undefined,
      date: req.query.date as string | undefined,
    };

    const result = await AfterCareService.listAttendance(query);
    res.json(apiResponse(true, result, 'Attendance records retrieved successfully'));
  }

  static async getAttendance(req: Request, res: Response): Promise<void> {
    const attendance = await AfterCareService.getAttendance(req.params.id as string);
    res.json(apiResponse(true, attendance, 'Attendance record retrieved successfully'));
  }

  static async deleteAttendance(req: Request, res: Response): Promise<void> {
    await AfterCareService.deleteAttendance(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Attendance record deleted successfully'));
  }

  // ─── Pickup Authorization ───────────────────────────────────────────────

  static async createPickupAuth(req: Request, res: Response): Promise<void> {
    const auth = await AfterCareService.createPickupAuth(req.body);
    res.status(201).json(apiResponse(true, auth, 'Pickup authorization created successfully'));
  }

  static async listPickupAuths(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      studentId: req.query.studentId as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
    };

    const result = await AfterCareService.listPickupAuths(query);
    res.json(apiResponse(true, result, 'Pickup authorizations retrieved successfully'));
  }

  static async updatePickupAuth(req: Request, res: Response): Promise<void> {
    const auth = await AfterCareService.updatePickupAuth(req.params.id as string, req.body);
    res.json(apiResponse(true, auth, 'Pickup authorization updated successfully'));
  }

  static async deletePickupAuth(req: Request, res: Response): Promise<void> {
    await AfterCareService.deletePickupAuth(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Pickup authorization deleted successfully'));
  }

  // ─── Sign Out Log ──────────────────────────────────────────────────────

  static async createSignOutLog(req: Request, res: Response): Promise<void> {
    const log = await AfterCareService.createSignOutLog(req.body);
    res.status(201).json(apiResponse(true, log, 'Sign out log created successfully'));
  }

  static async listSignOutLogs(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      studentId: req.query.studentId as string | undefined,
      date: req.query.date as string | undefined,
    };

    const result = await AfterCareService.listSignOutLogs(query);
    res.json(apiResponse(true, result, 'Sign out logs retrieved successfully'));
  }

  // ─── After Care Activity ───────────────────────────────────────────────

  static async createActivity(req: Request, res: Response): Promise<void> {
    const activity = await AfterCareService.createActivity(req.body);
    res.status(201).json(apiResponse(true, activity, 'Activity created successfully'));
  }

  static async listActivities(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      date: req.query.date as string | undefined,
    };

    const result = await AfterCareService.listActivities(query);
    res.json(apiResponse(true, result, 'Activities retrieved successfully'));
  }

  static async getActivity(req: Request, res: Response): Promise<void> {
    const activity = await AfterCareService.getActivity(req.params.id as string);
    res.json(apiResponse(true, activity, 'Activity retrieved successfully'));
  }

  static async updateActivity(req: Request, res: Response): Promise<void> {
    const activity = await AfterCareService.updateActivity(req.params.id as string, req.body);
    res.json(apiResponse(true, activity, 'Activity updated successfully'));
  }

  static async deleteActivity(req: Request, res: Response): Promise<void> {
    await AfterCareService.deleteActivity(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Activity deleted successfully'));
  }

  // ─── After Care Invoice ────────────────────────────────────────────────

  static async generateInvoices(req: Request, res: Response): Promise<void> {
    const invoices = await AfterCareService.generateMonthlyInvoices(req.body);
    res.status(201).json(apiResponse(true, invoices, 'Monthly invoices generated successfully'));
  }

  static async listInvoices(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      studentId: req.query.studentId as string | undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      status: req.query.status as string | undefined,
    };

    const result = await AfterCareService.listInvoices(query);
    res.json(apiResponse(true, result, 'Invoices retrieved successfully'));
  }

  static async markInvoicePaid(req: Request, res: Response): Promise<void> {
    const invoice = await AfterCareService.markInvoicePaid(req.params.id as string);
    res.json(apiResponse(true, invoice, 'Invoice marked as paid successfully'));
  }
}
