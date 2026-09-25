// src/modules/Evidence/controller.ts
import type { Request, Response } from 'express';
import { apiResponse } from '../../common/utils.js';
import { getUser } from '../../types/authenticated-request.js';
import { parentAccess, recordAccess } from './access.js';
import { lostMarksReasons, setDismissed } from './service-reasons.js';
import { classMisconceptions } from './service-class.js';

export const ReasonsController = {
  async reasons(req: Request, res: Response): Promise<void> {
    const { source, recordId } = req.query as { source: 'test' | 'homework'; recordId: string };
    res.json(apiResponse(true, await lostMarksReasons(await recordAccess(getUser(req), source, recordId))));
  },
  async dismiss(req: Request, res: Response): Promise<void> {
    await setDismissed(getUser(req), req.params.id as string, true);
    res.status(204).end();
  },
  async restore(req: Request, res: Response): Promise<void> {
    await setDismissed(getUser(req), req.params.id as string, false);
    res.status(204).end();
  },
  async classMisconceptions(req: Request, res: Response): Promise<void> {
    const q = req.query as { parent: 'paper' | 'homework'; parentId: string; classId: string };
    res.json(apiResponse(true, await classMisconceptions(await parentAccess(getUser(req), q.parent, q.parentId, q.classId))));
  },
};
