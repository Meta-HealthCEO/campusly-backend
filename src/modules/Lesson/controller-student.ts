import type { Request, Response, NextFunction } from 'express';
import { resolveStudentFromUserId } from '../../common/student-resolver.js';
import { NotFoundError, UnauthorizedError } from '../../common/errors.js';
import { listLessonsForStudent, getLessonForStudent } from './service-student.js';
import {
  studentLessonListQuerySchema,
  studentLessonParamSchema,
} from './validation-student.js';

export class StudentLessonController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id || !req.user.schoolId) throw new UnauthorizedError();
      const student = await resolveStudentFromUserId(req.user.id, req.user.schoolId);
      if (!student) throw new NotFoundError('Student profile not found');

      const query = studentLessonListQuerySchema.parse(req.query);
      const lessons = await listLessonsForStudent(student, query);
      res.json({ success: true, data: lessons });
    } catch (err: unknown) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id || !req.user.schoolId) throw new UnauthorizedError();
      const student = await resolveStudentFromUserId(req.user.id, req.user.schoolId);
      if (!student) throw new NotFoundError('Student profile not found');

      const { id } = studentLessonParamSchema.parse(req.params);
      const lesson = await getLessonForStudent(student, id);
      if (!lesson) throw new NotFoundError('Lesson not found');
      res.json({ success: true, data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  }
}
