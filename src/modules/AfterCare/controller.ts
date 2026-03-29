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
}
