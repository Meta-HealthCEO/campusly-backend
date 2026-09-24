import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { ClassUnitService } from './service-class-unit.js';
import { UnitInsightService } from './service-insight.js';
import { UnitItemsService } from './service-unit-items.js';
import type { CourseActor } from './service.js';

function context(req: Request) {
  const user = getUser(req);
  const actor: CourseActor = {
    userId: user.id,
    role: user.role,
    isHOD: user.isHOD ?? false,
    isSchoolPrincipal: user.isSchoolPrincipal ?? false,
  };
  return { schoolId: user.schoolId!, actor, isStandaloneTeacher: user.isStandaloneTeacher === true };
}

export class ClassUnitController {
  static async create(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const unit = await ClassUnitService.create(schoolId, actor, req.body);
    res.status(201).json(apiResponse(true, unit, 'Unit created'));
  }

  static async draftOutline(req: Request, res: Response): Promise<void> {
    const { schoolId, actor, isStandaloneTeacher } = context(req);
    const unit = await ClassUnitService.draftOutline(req.params.id as string, schoolId, actor, isStandaloneTeacher);
    res.json(apiResponse(true, unit, 'Outline drafted'));
  }

  static async approveOutline(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const unit = await ClassUnitService.approveOutline(req.params.id as string, schoolId, actor);
    res.json(apiResponse(true, unit, 'Outline approved; the items are being written'));
  }

  static async generationState(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const state = await ClassUnitService.generationState(req.params.id as string, schoolId, actor);
    res.json(apiResponse(true, state));
  }

  static async retryItem(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    await ClassUnitService.retryItem(req.params.id as string, req.params.lessonId as string, schoolId, actor);
    res.status(202).json(apiResponse(true, null, 'Trying that item again'));
  }

  static async previewItem(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const preview = await ClassUnitService.previewItem(req.params.id as string, req.params.lessonId as string, schoolId, actor);
    res.json(apiResponse(true, preview));
  }

  static async insight(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    res.json(apiResponse(true, await UnitInsightService.get(req.params.id as string, schoolId, actor)));
  }

  static async saveContent(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    await UnitItemsService.saveContent(req.params.id as string, req.params.lessonId as string, schoolId, actor, req.body);
    res.json(apiResponse(true, null, 'Saved'));
  }

  static async saveQuestions(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    await UnitItemsService.saveQuestions(req.params.id as string, req.params.lessonId as string, schoolId, actor, req.body);
    res.json(apiResponse(true, null, 'Saved'));
  }

  static async rewrite(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    await UnitItemsService.rewrite(req.params.id as string, req.params.lessonId as string, schoolId, actor, req.body);
    res.json(apiResponse(true, null, 'Rewritten'));
  }

  static async updateSettings(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    res.json(apiResponse(true, await UnitItemsService.updateSettings(req.params.id as string, schoolId, actor, req.body), 'Saved'));
  }

  static async addRevision(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const item = await UnitItemsService.addRevisionItem(req.params.id as string, schoolId, actor, req.body);
    res.status(201).json(apiResponse(true, item, 'Revision item added'));
  }

  static async release(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const result = await ClassUnitService.release(req.params.id as string, schoolId, actor, req.body.classIds);
    res.json(apiResponse(true, result, 'Unit released'));
  }
}
