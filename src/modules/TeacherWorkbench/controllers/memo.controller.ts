import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { MemoService } from '../services/index.js';
import { resolveSchoolScope } from '../../../common/school-scope.js';

export class MemoController {
  static async generateMemo(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const memo = await MemoService.generateMemo(req.params.paperId as string, user.id, schoolId);
    res.status(201).json(apiResponse(true, memo, 'Memo generated'));
  }

  static async getMemoByPaper(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const memo = await MemoService.getMemoByPaper(req.params.paperId as string, schoolId);
    res.json(apiResponse(true, memo, 'Memo retrieved'));
  }

  static async updateMemo(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const memo = await MemoService.updateMemo(req.params.id as string, req.body, schoolId);
    res.json(apiResponse(true, memo, 'Memo updated'));
  }

  static async regenerateAnswer(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const memo = await MemoService.regenerateAnswer(
      req.params.memoId as string,
      req.params.questionNumber as string,
      user.id,
      schoolId,
    );
    res.json(apiResponse(true, memo, 'Answer regenerated'));
  }
}
