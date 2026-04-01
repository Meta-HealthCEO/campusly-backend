import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { MemoService } from '../services/index.js';

export class MemoController {
  static async generateMemo(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const memo = await MemoService.generateMemo(req.params.paperId as string, user.id, schoolId);
    res.status(201).json(apiResponse(true, memo, 'Memo generated'));
  }

  static async getMemoByPaper(req: Request, res: Response): Promise<void> {
    const memo = await MemoService.getMemoByPaper(req.params.paperId as string);
    res.json(apiResponse(true, memo, 'Memo retrieved'));
  }

  static async updateMemo(req: Request, res: Response): Promise<void> {
    const memo = await MemoService.updateMemo(req.params.id as string, req.body);
    res.json(apiResponse(true, memo, 'Memo updated'));
  }
}
