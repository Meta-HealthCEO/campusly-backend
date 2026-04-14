import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { StructureService } from '../services/structure.service.js';

function getTenant(req: Request): { teacherId: string; schoolId: string | null } {
  const user = getUser(req);
  return { teacherId: user.id, schoolId: user.schoolId ?? null };
}

export class StructureController {
  static async create(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await StructureService.create(tenant, req.body);
    res.status(201).json(apiResponse(true, structure, 'Assessment structure created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const query = {
      term: req.query.term ? Number(req.query.term) : undefined,
      year: req.query.academicYear ? Number(req.query.academicYear) : undefined,
      classId: req.query.classId as string | undefined,
      subjectId: req.query.subjectId as string | undefined,
    };
    const structures = await StructureService.list(tenant, query);
    res.json(apiResponse(true, structures));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await StructureService.getById(req.params.id as string, tenant);
    res.json(apiResponse(true, structure));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await StructureService.update(req.params.id as string, tenant, req.body);
    res.json(apiResponse(true, structure, 'Assessment structure updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    await StructureService.delete(req.params.id as string, tenant);
    res.json(apiResponse(true, undefined, 'Assessment structure deleted successfully'));
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await StructureService.activate(req.params.id as string, tenant);
    res.json(apiResponse(true, structure, 'Assessment structure activated successfully'));
  }

  static async lock(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const result = await StructureService.lock(req.params.id as string, tenant);
    if (result.errors) {
      res.status(400).json(apiResponse(false, undefined, undefined, result.errors.join('; ')));
      return;
    }
    res.json(apiResponse(true, result.structure, 'Assessment structure locked successfully'));
  }

  static async unlock(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const tenant = { teacherId: user.id, schoolId: user.schoolId ?? null };
    const structure = await StructureService.unlock(
      req.params.id as string,
      tenant,
      user.id,
      req.body.reason,
    );
    res.json(apiResponse(true, structure, 'Assessment structure unlocked successfully'));
  }
}
