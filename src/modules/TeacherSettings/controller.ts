import type { Request, Response, NextFunction } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { TeacherSettingsService } from './service.js';
import { updateTeachingScopeSchema } from './validation.js';
import { BadRequestError } from '../../common/errors.js';
import { apiResponse } from '../../common/utils.js';

export class TeacherSettingsController {
  static async getTeachingScope(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getUser(req);
      const scope = await TeacherSettingsService.getTeachingScope(user.id);
      res.json(apiResponse(true, scope, 'Teaching scope retrieved'));
    } catch (err: unknown) { next(err); }
  }

  static async updateTeachingScope(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getUser(req);
      const parsed = updateTeachingScopeSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.message);
      const scope = await TeacherSettingsService.updateTeachingScope(user.id, parsed.data);
      res.json(apiResponse(true, scope, 'Teaching scope updated'));
    } catch (err: unknown) { next(err); }
  }
}
