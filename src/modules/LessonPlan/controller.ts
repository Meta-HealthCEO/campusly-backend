import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { LessonPlanService } from './service.js';
import { createLessonPlanWithStagedHomework } from './service-compensation.js';
import { LessonPlanAIService } from './service-ai.js';
import { createHomeworkSchema } from '../Homework/validation.js';
import type { CreateHomeworkInput } from '../Homework/validation.js';
import type { ILessonPlan } from './model.js';
import { apiResponse } from '../../common/utils.js';

export class LessonPlanController {
  static async create(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const actorId = user.id;
    const body = { ...req.body, schoolId: user.schoolId } as Partial<ILessonPlan> & {
      stagedHomework?: CreateHomeworkInput[];
    };
    const staged = Array.isArray(body.stagedHomework) ? body.stagedHomework : [];
    const plan = staged.length > 0
      ? await createLessonPlanWithStagedHomework(body, actorId, user.role)
      : await LessonPlanService.createLessonPlan(body, actorId, user.role);
    res.status(201).json(apiResponse(true, plan, 'Lesson plan created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const result = await LessonPlanService.listLessonPlans(
      {
        schoolId,
        teacherId: user.role === 'teacher' ? user.id : req.query.teacherId as string,
        classId: req.query.classId as string,
        subjectId: req.query.subjectId as string,
        search: req.query.search as string,
      },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result, 'Lesson plans retrieved successfully'));
  }

  static async get(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const plan = await LessonPlanService.getLessonPlanById(
      req.params.id as string,
      schoolId,
      user.id,
      user.role,
    );
    res.json(apiResponse(true, plan, 'Lesson plan retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { schoolId: _schoolId, stagedHomework: _stagedHomework, ...safeBody } = req.body;
    void _schoolId;
    void _stagedHomework;
    const plan = await LessonPlanService.updateLessonPlan(
      req.params.id as string,
      user.schoolId!,
      safeBody,
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
    const user = getUser(req);
    const draft = await LessonPlanAIService.generate(
      { ...req.body, schoolId: user.schoolId },
      user.id,
      user.role,
    );
    res.json(apiResponse(true, draft, 'Lesson plan draft generated successfully'));
  }

  static async getPdf(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const buf = await LessonPlanService.getLessonPlanPdfBuffer(
      req.params.id as string,
      user.schoolId!,
      user.id,
      user.role,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="lesson-plan-${req.params.id}.pdf"`,
    );
    res.send(buf);
  }

  static async generateMaterial(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const resource = await LessonPlanService.generateLessonMaterial(
      req.params.id as string,
      user.schoolId!,
      user.id,
      user.role,
      req.body,
    );
    res.status(201).json(apiResponse(true, resource, 'Lesson material generated successfully'));
  }

  static async attachHomework(req: Request, res: Response): Promise<void> {
    const parsed = createHomeworkSchema.parse(req.body);
    const user = getUser(req);
    const hw = await LessonPlanService.attachHomeworkToLessonPlan(
      req.params.id as string,
      user.schoolId!,
      parsed,
      user.id,
      user.role,
    );
    res.status(201).json(apiResponse(true, hw, 'Homework attached to lesson plan'));
  }

  static async detachHomework(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await LessonPlanService.detachHomeworkFromLessonPlan(
      req.params.id as string,
      user.schoolId!,
      req.params.homeworkId as string,
      user.id,
      user.role,
    );
    res.status(204).end();
  }
}
