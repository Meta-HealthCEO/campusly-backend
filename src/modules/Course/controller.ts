import type { Request, Response } from 'express';
import { getUser, type AuthenticatedUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { CourseService, type CourseActor } from './service.js';
import { CourseAnalyticsService } from './service-analytics.js';
import type { CourseQueryInput } from './validation.js';

/**
 * Build both the authenticated user and a CourseActor from a request in a
 * single getUser() call. Every handler needs both (the user for schoolId,
 * the actor for the service's permission checks), and this avoids calling
 * getUser twice per handler.
 */
function buildContext(req: Request): { user: AuthenticatedUser; actor: CourseActor } {
  const user = getUser(req);
  return {
    user,
    actor: {
      userId: user.id,
      role: user.role,
      isHOD: user.isHOD ?? false,
      isSchoolPrincipal: user.isSchoolPrincipal ?? false,
    },
  };
}

export class CourseController {
  // ─── Course CRUD ─────────────────────────────────────────────────────────

  static async createCourse(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const course = await CourseService.createCourse(
      user.schoolId!,
      actor,
      req.body,
    );
    res.status(201).json(apiResponse(true, course, 'Course created'));
  }

  static async listCourses(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const filters = req.query as unknown as CourseQueryInput;
    const result = await CourseService.listCourses(user.schoolId!, actor, filters);
    res.json(apiResponse(true, result));
  }

  static async getCourse(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const course = await CourseService.getCourse(
      req.params.id as string,
      user.schoolId!,
    );
    res.json(apiResponse(true, course));
  }

  static async updateCourse(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const course = await CourseService.updateCourse(
      req.params.id as string,
      user.schoolId!,
      actor,
      req.body,
    );
    res.json(apiResponse(true, course, 'Course updated'));
  }

  static async deleteCourse(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const result = await CourseService.deleteCourse(
      req.params.id as string,
      user.schoolId!,
      actor,
    );
    res.json(apiResponse(true, result, 'Course deleted'));
  }

  // ─── Review workflow ─────────────────────────────────────────────────────

  static async submitForReview(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const course = await CourseService.submitForReview(
      req.params.id as string,
      user.schoolId!,
      actor,
    );
    res.json(apiResponse(true, course, 'Course submitted for review'));
  }

  static async publishCourse(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const course = await CourseService.publishCourse(
      req.params.id as string,
      user.schoolId!,
      actor,
    );
    res.json(apiResponse(true, course, 'Course published'));
  }

  static async rejectCourse(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const course = await CourseService.rejectCourse(
      req.params.id as string,
      user.schoolId!,
      actor,
      req.body,
    );
    res.json(apiResponse(true, course, 'Course rejected'));
  }

  static async archiveCourse(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const course = await CourseService.archiveCourse(
      req.params.id as string,
      user.schoolId!,
      actor,
    );
    res.json(apiResponse(true, course, 'Course archived'));
  }

  // ─── Modules ─────────────────────────────────────────────────────────────

  static async addModule(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const mod = await CourseService.addModule(
      req.params.id as string,
      user.schoolId!,
      actor,
      req.body,
    );
    res.status(201).json(apiResponse(true, mod, 'Module added'));
  }

  static async updateModule(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const mod = await CourseService.updateModule(
      req.params.id as string,
      req.params.moduleId as string,
      user.schoolId!,
      actor,
      req.body,
    );
    res.json(apiResponse(true, mod, 'Module updated'));
  }

  static async deleteModule(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const result = await CourseService.deleteModule(
      req.params.id as string,
      req.params.moduleId as string,
      user.schoolId!,
      actor,
    );
    res.json(apiResponse(true, result, 'Module deleted'));
  }

  static async reorderModules(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const result = await CourseService.reorderModules(
      req.params.id as string,
      user.schoolId!,
      actor,
      req.body,
    );
    res.json(apiResponse(true, result, 'Modules reordered'));
  }

  // ─── Lessons ─────────────────────────────────────────────────────────────

  static async addLesson(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const lesson = await CourseService.addLesson(
      req.params.id as string,
      user.schoolId!,
      actor,
      req.body,
    );
    res.status(201).json(apiResponse(true, lesson, 'Lesson added'));
  }

  static async updateLesson(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const lesson = await CourseService.updateLesson(
      req.params.id as string,
      req.params.lessonId as string,
      user.schoolId!,
      actor,
      req.body,
    );
    res.json(apiResponse(true, lesson, 'Lesson updated'));
  }

  static async deleteLesson(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const result = await CourseService.deleteLesson(
      req.params.id as string,
      req.params.lessonId as string,
      user.schoolId!,
      actor,
    );
    res.json(apiResponse(true, result, 'Lesson deleted'));
  }

  static async reorderLessons(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const result = await CourseService.reorderLessons(
      req.params.id as string,
      user.schoolId!,
      actor,
      req.body,
    );
    res.json(apiResponse(true, result, 'Lessons reordered'));
  }

  // ─── Assignment ──────────────────────────────────────────────────────────

  static async assignCourseToClass(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const result = await CourseService.assignCourseToClass(
      req.params.id as string,
      user.schoolId!,
      actor,
      req.body,
    );
    res.status(201).json(apiResponse(true, result, 'Course assigned'));
  }

  static async listEnrolments(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const result = await CourseService.listEnrolments(
      req.params.id as string,
      user.schoolId!,
      actor,
    );
    res.json(apiResponse(true, result));
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  static async getCourseAnalytics(req: Request, res: Response): Promise<void> {
    const { user, actor } = buildContext(req);
    const result = await CourseAnalyticsService.getCourseAnalytics(
      req.params.id as string,
      user.schoolId!,
      actor,
    );
    res.json(apiResponse(true, result));
  }
}
