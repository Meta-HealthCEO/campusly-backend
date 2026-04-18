import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { TrainingService } from './service-training.js';

export class TrainingController {
  static async createSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const session = await TrainingService.createSession(req.body, user.schoolId!);
    res.status(201).json(apiResponse(true, session, 'Training session created'));
  }

  static async listSessions(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { teamId, studentId, from, to, status } = req.query;
    const sessions = await TrainingService.listSessions({
      schoolId: user.schoolId!,
      teamId: typeof teamId === 'string' ? teamId : undefined,
      studentId: typeof studentId === 'string' ? studentId : undefined,
      from: typeof from === 'string' ? from : undefined,
      to: typeof to === 'string' ? to : undefined,
      status: typeof status === 'string' ? status : undefined,
    });
    res.status(200).json(apiResponse(true, sessions, 'Training sessions retrieved'));
  }

  static async getSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const session = await TrainingService.getSession(req.params.id as string, user.schoolId!);
    res.status(200).json(apiResponse(true, session, 'Training session retrieved'));
  }

  static async updateSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const session = await TrainingService.updateSession(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.status(200).json(apiResponse(true, session, 'Training session updated'));
  }

  static async deleteSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await TrainingService.deleteSession(req.params.id as string, user.schoolId!);
    res.status(200).json(apiResponse(true, null, 'Training session deleted'));
  }

  static async recordAttendance(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const records = await TrainingService.recordAttendance(
      req.params.sessionId as string,
      user.schoolId!,
      req.body,
    );
    res.status(200).json(apiResponse(true, records, 'Attendance recorded'));
  }

  static async getAttendance(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const records = await TrainingService.getAttendance(
      req.params.sessionId as string,
      user.schoolId!,
    );
    res.status(200).json(apiResponse(true, records, 'Attendance retrieved'));
  }

  static async getPlayerAttendanceSummary(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { from, to } = req.query;
    const summary = await TrainingService.getPlayerAttendanceSummary(
      req.params.studentId as string,
      user.schoolId!,
      typeof from === 'string' ? from : undefined,
      typeof to === 'string' ? to : undefined,
    );
    res.status(200).json(apiResponse(true, summary, 'Attendance summary retrieved'));
  }

  static async createDrill(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const drill = await TrainingService.createDrill(req.body, user.schoolId!);
    res.status(201).json(apiResponse(true, drill, 'Drill template created'));
  }

  static async listDrills(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sport = typeof req.query.sport === 'string' ? req.query.sport : undefined;
    const drills = await TrainingService.listDrills(user.schoolId!, sport);
    res.status(200).json(apiResponse(true, drills, 'Drill templates retrieved'));
  }

  static async updateDrill(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const drill = await TrainingService.updateDrill(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.status(200).json(apiResponse(true, drill, 'Drill template updated'));
  }

  static async deleteDrill(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await TrainingService.deleteDrill(req.params.id as string, user.schoolId!);
    res.status(200).json(apiResponse(true, null, 'Drill template deleted'));
  }
}
