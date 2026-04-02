import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { HomeworkTemplateService } from './template.service.js';
import { apiResponse } from '../../common/utils.js';

export class HomeworkTemplateController {
  static async createTemplate(req: Request, res: Response): Promise<void> {
    const { id: teacherId, schoolId } = getUser(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const template = await HomeworkTemplateService.createTemplate(
      teacherId,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, template, 'Template created'));
  }

  static async listTemplates(req: Request, res: Response): Promise<void> {
    const { id: teacherId, schoolId } = getUser(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const subjectId = req.query.subjectId as string | undefined;
    const templates = await HomeworkTemplateService.listTemplates(
      teacherId,
      schoolId,
      subjectId,
    );
    res.json(apiResponse(true, templates, 'Templates retrieved'));
  }

  static async deleteTemplate(req: Request, res: Response): Promise<void> {
    const { id: teacherId, schoolId } = getUser(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    await HomeworkTemplateService.deleteTemplate(
      req.params.id as string,
      teacherId,
      schoolId,
    );
    res.json(apiResponse(true, undefined, 'Template deleted'));
  }

  static async cloneTemplate(req: Request, res: Response): Promise<void> {
    const { id: teacherId, schoolId } = getUser(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const homework = await HomeworkTemplateService.createFromTemplate(
      teacherId,
      schoolId,
      req.params.id as string,
      req.body,
    );
    res.status(201).json(apiResponse(true, homework, 'Homework created from template'));
  }

  static async saveAsTemplate(req: Request, res: Response): Promise<void> {
    const { id: teacherId, schoolId } = getUser(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const template = await HomeworkTemplateService.saveAsTemplate(
      teacherId,
      schoolId,
      req.params.id as string,
    );
    res.status(201).json(apiResponse(true, template, 'Saved as template'));
  }
}
