import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { CoachAssignmentService } from './service-coach-assignment.js';

export class CoachAssignmentController {
  static async create(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const assignment = await CoachAssignmentService.create(req.body, user.schoolId!);
    res.status(201).json(apiResponse(true, assignment, 'Coach assigned'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { userId, teamId } = req.query;
    const assignments = await CoachAssignmentService.list({
      schoolId: user.schoolId!,
      userId: typeof userId === 'string' ? userId : undefined,
      teamId: typeof teamId === 'string' ? teamId : undefined,
    });
    res.status(200).json(apiResponse(true, assignments, 'Coach assignments retrieved'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const assignment = await CoachAssignmentService.update(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.status(200).json(apiResponse(true, assignment, 'Coach assignment updated'));
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await CoachAssignmentService.remove(req.params.id as string, user.schoolId!);
    res.status(200).json(apiResponse(true, null, 'Coach assignment removed'));
  }

  static async listMyAssignments(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const assignments = await CoachAssignmentService.list({
      schoolId: user.schoolId!,
      userId: user.id,
    });
    res.status(200).json(apiResponse(true, assignments, 'My assignments retrieved'));
  }
}
