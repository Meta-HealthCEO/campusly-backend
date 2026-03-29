import { Request, Response } from 'express';
import { AttendanceService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class AttendanceController {
  static async record(req: Request, res: Response): Promise<void> {
    const attendance = await AttendanceService.record(req.body, req.user!.id);
    res.status(201).json(apiResponse(true, attendance, 'Attendance recorded successfully'));
  }

  static async bulkRecord(req: Request, res: Response): Promise<void> {
    const records = await AttendanceService.bulkRecord(req.body, req.user!.id);
    res.status(201).json(apiResponse(true, records, 'Bulk attendance recorded successfully'));
  }

  static async getByStudent(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'startDate and endDate are required'));
      return;
    }

    const records = await AttendanceService.getByStudent(
      studentId,
      startDate as string,
      endDate as string,
    );
    res.json(apiResponse(true, records, 'Student attendance retrieved successfully'));
  }

  static async getByClass(req: Request, res: Response): Promise<void> {
    const classId = req.params.classId as string;
    const { date } = req.query;

    if (!date) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'date is required'));
      return;
    }

    const records = await AttendanceService.getByClass(classId, date as string);
    res.json(apiResponse(true, records, 'Class attendance retrieved successfully'));
  }

  static async getReport(req: Request, res: Response): Promise<void> {
    const { studentId, classId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'startDate and endDate are required'));
      return;
    }

    const report = await AttendanceService.getReport({
      studentId: studentId as string | undefined,
      classId: classId as string | undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(apiResponse(true, report, 'Attendance report retrieved successfully'));
  }

  static async getAbsentees(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const { date, period } = req.query;

    if (!date) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'date is required'));
      return;
    }

    const absentees = await AttendanceService.getAbsentees(
      schoolId,
      date as string,
      period ? Number(period) : undefined,
    );
    res.json(apiResponse(true, absentees, 'Absentees retrieved successfully'));
  }

  static async getDailyReport(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const date = req.params.date as string;
    const report = await AttendanceService.getDailyReport(schoolId, date);
    res.json(apiResponse(true, report, 'Daily report retrieved successfully'));
  }
}
