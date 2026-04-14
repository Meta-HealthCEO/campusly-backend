import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { TemplateService } from '../services/template.service.js';

function getTenant(req: Request): { teacherId: string; schoolId: string | null } {
  const user = getUser(req);
  return { teacherId: user.id, schoolId: user.schoolId ?? null };
}

export class TemplateController {
  static async saveAsTemplate(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const template = await TemplateService.saveAsTemplate(
      req.params.id as string,
      tenant,
      req.body.templateName,
    );
    res.status(201).json(apiResponse(true, template, 'Template saved successfully'));
  }

  static async listTemplates(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const templates = await TemplateService.listTemplates(tenant);
    res.json(apiResponse(true, templates));
  }

  static async deleteTemplate(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    await TemplateService.deleteTemplate(req.params.id as string, tenant);
    res.json(apiResponse(true, undefined, 'Template deleted successfully'));
  }

  static async createFromTemplate(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await TemplateService.createFromTemplate(
      req.params.templateId as string,
      tenant,
      req.body,
    );
    res.status(201).json(apiResponse(true, structure, 'Structure created from template successfully'));
  }

  static async clone(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const structure = await TemplateService.clone(req.params.id as string, tenant, req.body);
    res.status(201).json(apiResponse(true, structure, 'Structure cloned successfully'));
  }
}
