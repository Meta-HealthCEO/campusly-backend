import type { Request, Response, NextFunction } from 'express';
import { LessonService } from './service.js';
import * as Materials from './service-materials.js';
import { scaffoldLesson } from './service-scaffold.js';
import { exportTeacherPack, exportStudentPack } from './service-export.js';
import { getUser } from '../../types/authenticated-request.js';
import {
  createLessonSchema,
  updateLessonSchema,
  patchStatusSchema,
  scaffoldLessonSchema,
  addMaterialSchema,
  updateMaterialSchema,
  moveMaterialSchema,
  listLessonsSchema,
} from './validation.js';

function getAuth(req: Request): { id: string; schoolId: string } {
  const u = getUser(req);
  if (!u.schoolId) throw new Error('Authenticated user has no schoolId');
  return { id: u.id, schoolId: u.schoolId };
}

export const LessonController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const filters = listLessonsSchema.parse(req.query);
      const result = await LessonService.list(schoolId, filters);
      res.json({ data: result });
    } catch (err: unknown) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const lesson = await LessonService.getById(req.params.id as string, schoolId);
      res.json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  scaffold: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      getAuth(req);
      const input = scaffoldLessonSchema.parse(req.body);
      const outline = await scaffoldLesson(input);
      res.json({ data: outline });
    } catch (err: unknown) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, schoolId } = getAuth(req);
      const data = createLessonSchema.parse(req.body);
      const lesson = await LessonService.create(data, id, schoolId);
      res.status(201).json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const data = updateLessonSchema.parse(req.body);
      const lesson = await LessonService.update(req.params.id as string, schoolId, data);
      res.json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  patchStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const { status } = patchStatusSchema.parse(req.body);
      const lesson = await LessonService.patchStatus(req.params.id as string, schoolId, status);
      res.json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      await LessonService.delete(req.params.id as string, schoolId);
      res.json({ data: { ok: true } });
    } catch (err: unknown) {
      next(err);
    }
  },

  addMaterial: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: teacherId, schoolId } = getAuth(req);
      const input = addMaterialSchema.parse(req.body);
      const material = await Materials.addMaterial(req.params.id as string, schoolId, teacherId, input);
      res.status(201).json({ data: material });
    } catch (err: unknown) {
      next(err);
    }
  },

  updateMaterial: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const patch = updateMaterialSchema.parse(req.body);
      const material = await Materials.updateMaterial(
        req.params.id as string,
        req.params.mid as string,
        schoolId,
        patch,
      );
      res.json({ data: material });
    } catch (err: unknown) {
      next(err);
    }
  },

  moveMaterial: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const { toPhase, toIndex } = moveMaterialSchema.parse(req.body);
      const lesson = await Materials.moveMaterial(
        req.params.id as string,
        req.params.mid as string,
        schoolId,
        toPhase,
        toIndex,
      );
      res.json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  regenerateMaterial: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: teacherId, schoolId } = getAuth(req);
      const payload =
        req.body && Object.keys(req.body as Record<string, unknown>).length
          ? addMaterialSchema.parse(req.body)
          : undefined;
      const material = await Materials.regenerateMaterial(
        req.params.id as string,
        req.params.mid as string,
        schoolId,
        teacherId,
        payload,
      );
      res.json({ data: material });
    } catch (err: unknown) {
      next(err);
    }
  },

  deleteMaterial: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      await Materials.deleteMaterial(req.params.id as string, req.params.mid as string, schoolId);
      res.json({ data: { ok: true } });
    } catch (err: unknown) {
      next(err);
    }
  },

  exportTeacher: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const lessonId = req.params.id as string;
      const buf = await exportTeacherPack(lessonId, schoolId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="lesson-${lessonId}-teacher.pdf"`);
      res.send(buf);
    } catch (err: unknown) {
      next(err);
    }
  },

  exportStudent: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const lessonId = req.params.id as string;
      const buf = await exportStudentPack(lessonId, schoolId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="lesson-${lessonId}-student.pdf"`);
      res.send(buf);
    } catch (err: unknown) {
      next(err);
    }
  },
};
