import type { Request, Response, NextFunction } from 'express';
import { LessonService } from './service.js';
import { LessonAssignmentService } from './service-assignments.js';
import * as Materials from './service-materials.js';
import { generateAllPlaceholders } from './service-materials-bulk.js';
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
  assignClassSchema,
  updateAssignmentSchema,
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

  recentTopics: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: teacherId, schoolId } = getAuth(req);
      const rawLimit = Number(req.query.limit);
      const limit = Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), 50)
        : 8;
      const items = await LessonService.recentTopicsForTeacher(teacherId, schoolId, limit);
      res.json({ data: { items } });
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
      const { schoolId } = getAuth(req);
      const input = scaffoldLessonSchema.parse(req.body);
      const outline = await scaffoldLesson(input, schoolId);
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

  generateAllPlaceholders: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id: teacherId, schoolId } = getAuth(req);
      const result = await generateAllPlaceholders(
        req.params.id as string,
        schoolId,
        teacherId,
      );
      res.json({ data: result });
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

  assignClass: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const input = assignClassSchema.parse(req.body);
      const lesson = await LessonAssignmentService.assignClass(
        req.params.id as string,
        schoolId,
        input,
      );
      res.status(201).json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  updateAssignment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const patch = updateAssignmentSchema.parse(req.body);
      const lesson = await LessonAssignmentService.updateAssignment(
        req.params.id as string,
        schoolId,
        req.params.classId as string,
        patch,
      );
      res.json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  unassignClass: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { schoolId } = getAuth(req);
      const lesson = await LessonAssignmentService.unassignClass(
        req.params.id as string,
        schoolId,
        req.params.classId as string,
      );
      res.json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },
};
