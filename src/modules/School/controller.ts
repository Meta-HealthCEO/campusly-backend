import { Request, Response } from 'express';
import { SchoolService } from './service.js';
import { apiResponse } from '../../common/utils.js';
import { ForbiddenError } from '../../common/errors.js';

export class SchoolController {
  static async create(req: Request, res: Response): Promise<void> {
    const school = await SchoolService.create(req.body);
    res.status(201).json(apiResponse(true, { school }, 'School created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const { page, limit, sort, search } = req.query;

    const result = await SchoolService.list({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sort: sort as string | undefined,
      search: search as string | undefined,
    });

    res.status(200).json(
      apiResponse(true, result, 'Schools retrieved successfully'),
    );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const requestedId = req.params.id as string;
    const callerRole = req.user?.role;
    const callerSchoolId = req.user?.schoolId;

    // Non-admin roles can only fetch their own school.
    const adminRoles = new Set(['super_admin', 'school_admin']);
    if (callerRole && !adminRoles.has(callerRole)) {
      if (!callerSchoolId || callerSchoolId.toString() !== requestedId) {
        throw new ForbiddenError('Cannot fetch a school other than your own');
      }
    }

    const school = await SchoolService.getById(requestedId);
    res.status(200).json(apiResponse(true, { school }, 'School retrieved successfully'));
  }

  /**
   * Only super_admin may act on a school other than their own. Without this
   * check any holder of `manage_school_settings` — which includes every
   * self-registered standalone teacher — could rename, strip the modules
   * from, or deactivate ANY school on the platform by id.
   */
  private static assertOwnSchool(req: Request): void {
    if (req.user?.role === 'super_admin') return;
    const requestedId = req.params.id as string;
    const callerSchoolId = req.user?.schoolId;
    if (!callerSchoolId || callerSchoolId.toString() !== requestedId) {
      throw new ForbiddenError('Cannot modify a school other than your own');
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    SchoolController.assertOwnSchool(req);
    const school = await SchoolService.update(req.params.id as string, req.body);
    res.status(200).json(apiResponse(true, { school }, 'School updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    SchoolController.assertOwnSchool(req);
    await SchoolService.delete(req.params.id as string);
    res.status(200).json(apiResponse(true, undefined, 'School deleted successfully'));
  }

  static async updateSettings(req: Request, res: Response): Promise<void> {
    SchoolController.assertOwnSchool(req);
    const school = await SchoolService.updateSettings(req.params.id as string, req.body);
    res.status(200).json(apiResponse(true, { school }, 'School settings updated successfully'));
  }

  static async getUsage(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const snapshot = await SchoolService.getUsage(schoolId);
    res.status(200).json(apiResponse(true, snapshot, 'Usage retrieved successfully'));
  }

  static async getJoinCode(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const joinCode = await SchoolService.getJoinCode(schoolId);
    res.status(200).json(apiResponse(true, { joinCode }, 'Join code retrieved successfully'));
  }
}
