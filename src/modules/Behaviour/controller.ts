import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { BehaviourService, type BehaviourActor } from './service.js';

function actor(req: Request): BehaviourActor {
  const user = getUser(req);
  return { id: user.id, role: user.role, schoolId: user.schoolId!, isHOD: user.isHOD ?? false, isSchoolPrincipal: user.isSchoolPrincipal ?? false };
}

export class BehaviourController {
  static async log(req: Request, res: Response): Promise<void> {
    const entry = await BehaviourService.log(actor(req), req.body);
    res.status(201).json(apiResponse(true, entry, 'Logged'));
  }

  static async forClass(req: Request, res: Response): Promise<void> {
    const data = await BehaviourService.forClass(actor(req), req.query.classId as string);
    res.json(apiResponse(true, data, 'Class behaviour'));
  }

  static async forLearner(req: Request, res: Response): Promise<void> {
    const data = await BehaviourService.forLearner(actor(req), req.params.studentId as string);
    res.json(apiResponse(true, data, 'Learner behaviour'));
  }

  static async undo(req: Request, res: Response): Promise<void> {
    await BehaviourService.undo(actor(req), req.params.id as string);
    res.json(apiResponse(true, null, 'Undone'));
  }
}
