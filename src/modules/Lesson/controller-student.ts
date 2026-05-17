import type { Request, Response, NextFunction } from 'express';
import { resolveStudentFromUserId } from '../../common/student-resolver.js';
import { NotFoundError, UnauthorizedError } from '../../common/errors.js';
import {
  listLessonsForStudent,
  getLessonForStudent,
  isLessonVisibleToStudent,
} from './service-student.js';
import { exportStudentPack } from './service-export.js';
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

  /**
   * Download the same student-pack PDF the teacher gets, gated on the
   * lesson being published + assigned to the student's class. The export
   * service is then driven by the lesson's schoolId — safe to pass after
   * visibility is verified here.
   */
  static async exportPack(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id || !req.user.schoolId) throw new UnauthorizedError();
      const student = await resolveStudentFromUserId(req.user.id, req.user.schoolId);
      if (!student) throw new NotFoundError('Student profile not found');

      const { id } = studentLessonParamSchema.parse(req.params);
      const visible = await isLessonVisibleToStudent(student, id);
      if (!visible) throw new NotFoundError('Lesson not found');

      const buf = await exportStudentPack(id, student.schoolId.toString());
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="lesson-${id}-student.pdf"`);
      res.send(buf);
    } catch (err: unknown) {
      next(err);
    }
  }
}
