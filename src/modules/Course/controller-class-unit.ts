import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { ClassUnitService } from './service-class-unit.js';
import { UnitInsightService } from './service-insight.js';
import { UnitItemsService } from './service-unit-items.js';
import { UnitCopyService } from './service-unit-copy.js';
import type { CourseActor } from './service.js';
import { aiActorFor, assertAIAllowance, withAIAllowance } from '../subscription/ai-allowance.js';

function context(req: Request) {
  const user = getUser(req);
  const actor: CourseActor = {
    userId: user.id,
    role: user.role,
    isHOD: user.isHOD ?? false,
    isSchoolPrincipal: user.isSchoolPrincipal ?? false,
  };
  return { schoolId: user.schoolId!, actor };
}

export class ClassUnitController {
  static async copy(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const unit = await UnitCopyService.copy(req.params.id as string, schoolId, actor, req.body);
    res.status(201).json(apiResponse(true, unit, 'Unit copied'));
  }

  static async library(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const page = Number.parseInt(req.query.page as string, 10);
    const entries = await UnitCopyService.library(schoolId, actor, {
      gradeId: req.query.gradeId as string | undefined,
      subjectId: req.query.subjectId as string | undefined,
      page: Number.isFinite(page) && page > 0 ? page : undefined,
    });
    res.json(apiResponse(true, entries, 'School library'));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    // A teacher with no AI actions left isn't left with an empty unit they can't draft.
    await assertAIAllowance(await aiActorFor(req), 'unit_outline');
    const unit = await ClassUnitService.create(schoolId, actor, req.body);
    res.status(201).json(apiResponse(true, unit, 'Unit created'));
  }

  static async draftOutline(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const courseId = req.params.id as string;
    const draft = () => ClassUnitService.draftOutline(courseId, schoolId, actor);
    const ai = await aiActorFor(req);
    // One action per unit outline: redrafting the same unit isn't counted again.
    const unit = ai.isStandaloneTeacher && await ClassUnitService.isFirstOutline(courseId, schoolId)
      ? await withAIAllowance(ai, 'unit_outline', draft, { courseId })
      : await draft();
    res.json(apiResponse(true, unit, 'Outline drafted'));
  }

  static async approveOutline(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const courseId = req.params.id as string;
    // One action for writing all of the unit's items, counted once they are queued.
    const unit = await withAIAllowance(await aiActorFor(req), 'unit_build', () => ClassUnitService.approveOutline(courseId, schoolId, actor), { courseId });
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
    const courseId = req.params.id as string;
    await withAIAllowance(await aiActorFor(req), 'unit_rewrite', () => UnitItemsService.rewrite(courseId, req.params.lessonId as string, schoolId, actor, req.body), { courseId });
    res.json(apiResponse(true, null, 'Rewritten'));
  }

  static async updateSettings(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    res.json(apiResponse(true, await UnitItemsService.updateSettings(req.params.id as string, schoolId, actor, req.body), 'Saved'));
  }

  static async addRevision(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const courseId = req.params.id as string;
    const item = await withAIAllowance(await aiActorFor(req), 'revision_item', () => UnitItemsService.addRevisionItem(courseId, schoolId, actor, req.body), { courseId });
    res.status(201).json(apiResponse(true, item, 'Revision item added'));
  }

  static async release(req: Request, res: Response): Promise<void> {
    const { schoolId, actor } = context(req);
    const result = await ClassUnitService.release(req.params.id as string, schoolId, actor, req.body.classIds);
    res.json(apiResponse(true, result, 'Unit released'));
  }
}
