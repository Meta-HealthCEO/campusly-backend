import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { LessonPlanService } from './service.js';
import { LessonPlanAIService } from './service-ai.js';
import { apiResponse } from '../../common/utils.js';

export class LessonPlanController {
  static async create(req: Request, res: Response): Promise<void> {
    const plan = await LessonPlanService.createLessonPlan(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, plan, 'Lesson plan created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await LessonPlanService.listLessonPlans(
      {
        schoolId,
        teacherId: req.query.teacherId as string,
        classId: req.query.classId as string,
        subjectId: req.query.subjectId as string,
      },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'Lesson plans retrieved successfully'));
  }

  static async get(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const plan = await LessonPlanService.getLessonPlanById(req.params.id as string, schoolId);
    res.json(apiResponse(true, plan, 'Lesson plan retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const plan = await LessonPlanService.updateLessonPlan(
      req.params.id as string,
      user.schoolId!,
      req.body,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, plan, 'Lesson plan updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await LessonPlanService.deleteLessonPlan(
      req.params.id as string,
      user.schoolId!,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, undefined, 'Lesson plan deleted successfully'));
  }

  static async aiGenerate(req: Request, res: Response): Promise<void> {
    const draft = await LessonPlanAIService.generate(req.body, getUser(req).id);
    res.json(apiResponse(true, draft, 'Lesson plan draft generated successfully'));
  }
}
