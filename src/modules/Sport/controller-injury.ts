import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { InjuryService } from './service-injury.js';
import { resolveScopedStudentId } from './student-access.js';

export class InjuryController {
  static async createInjury(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const injury = await InjuryService.createInjury(
      req.body,
      user.schoolId!,
      user.id,
    );
    res.status(201).json(apiResponse(true, injury, 'Injury recorded'));
  }

  static async listInjuries(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { studentId, teamId, status } = req.query;
    const scopedStudentId = await resolveScopedStudentId(
      user,
      typeof studentId === 'string' ? studentId : undefined,
    );
    const injuries = await InjuryService.listInjuries({
      schoolId: user.schoolId!,
      studentId: scopedStudentId,
      teamId: typeof teamId === 'string' ? teamId : undefined,
      status: typeof status === 'string' ? status : undefined,
    });
    res.status(200).json(apiResponse(true, injuries, 'Injuries retrieved'));
  }

  static async getInjury(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const injury = await InjuryService.getInjury(
      req.params.id as string,
      user.schoolId!,
    );
    res.status(200).json(apiResponse(true, injury, 'Injury retrieved'));
  }

  static async updateInjury(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const injury = await InjuryService.updateInjury(
      req.params.id as string,
      user.schoolId!,
      req.body,
      user.id,
    );
    res.status(200).json(apiResponse(true, injury, 'Injury updated'));
  }

  static async deleteInjury(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await InjuryService.deleteInjury(
      req.params.id as string,
      user.schoolId!,
    );
    res.status(200).json(apiResponse(true, null, 'Injury deleted'));
  }

  static async addRecoveryLog(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const log = await InjuryService.addRecoveryLog(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, log, 'Recovery log added'));
  }

  static async listRecoveryLogs(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const logs = await InjuryService.listRecoveryLogs(
      req.params.id as string,
      user.schoolId!,
    );
    res.status(200).json(apiResponse(true, logs, 'Recovery logs retrieved'));
  }

  static async getPlayerInjuries(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const injuries = await InjuryService.getPlayerInjuries(
      req.params.studentId as string,
      user.schoolId!,
    );
    res.status(200).json(apiResponse(true, injuries, 'Player injuries retrieved'));
  }
}
