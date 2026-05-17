import type { Request, Response, NextFunction } from 'express';
import { LessonService } from './service.js';
import { LessonAssignmentService } from './service-assignments.js';
import { cloneLesson } from './service-clone.js';
import * as Materials from './service-materials.js';
import { generateAllPlaceholders } from './service-materials-bulk.js';
import { scaffoldLesson } from './service-scaffold.js';
import { exportTeacherPack, exportStudentPack } from './service-export.js';
import { generateSlideshow } from './service-slideshow.js';
import { chatAboutLesson } from './service-chat.js';
import { getUser } from '../../types/authenticated-request.js';
import { ForbiddenError } from '../../common/errors.js';
import type { LessonActor } from './service-access.js';
import {
  createLessonSchema,
  updateLessonSchema,
  scaffoldLessonSchema,
  addMaterialSchema,
  updateMaterialSchema,
  moveMaterialSchema,
  listLessonsSchema,
  assignClassSchema,
  updateAssignmentSchema,
  chatLessonSchema,
} from './validation.js';

function getAuth(req: Request): LessonActor {
  const u = getUser(req);
  if (!u.schoolId) throw new ForbiddenError('Authenticated user has no schoolId');
  return { ...u, schoolId: u.schoolId };
}

export const LessonController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const filters = listLessonsSchema.parse(req.query);
      const result = await LessonService.list(actor, filters);
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
      const actor = getAuth(req);
      const lesson = await LessonService.getById(req.params.id as string, actor);
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
      const actor = getAuth(req);
      const data = createLessonSchema.parse(req.body);
      const lesson = await LessonService.create(data, actor);
      res.status(201).json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const data = updateLessonSchema.parse(req.body);
      const lesson = await LessonService.update(req.params.id as string, actor, data);
      res.json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  publish: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const lesson = await LessonService.publish(req.params.id as string, actor);
      res.json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  unpublish: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const lesson = await LessonService.unpublish(req.params.id as string, actor);
      res.json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      await LessonService.delete(req.params.id as string, actor);
      res.json({ data: { ok: true } });
    } catch (err: unknown) {
      next(err);
    }
  },

  // POST /lessons/:id/clone — duplicate the lesson for re-use (e.g. next
  // year). Materials are copied (with fresh ids), assignments + reflection
  // notes + status are reset; external content refs are preserved.
  clone: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const body = (req.body ?? {}) as { title?: string };
      const lesson = await cloneLesson(req.params.id as string, actor, {
        title: body.title,
      });
      res.status(201).json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  addMaterial: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const input = addMaterialSchema.parse(req.body);
      const material = await Materials.addMaterial(req.params.id as string, actor, input);
      res.status(201).json({ data: material });
    } catch (err: unknown) {
      next(err);
    }
  },

  updateMaterial: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const patch = updateMaterialSchema.parse(req.body);
      const material = await Materials.updateMaterial(
        req.params.id as string,
        req.params.mid as string,
        actor,
        patch,
      );
      res.json({ data: material });
    } catch (err: unknown) {
      next(err);
    }
  },

  moveMaterial: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const { toPhase, toIndex } = moveMaterialSchema.parse(req.body);
      const lesson = await Materials.moveMaterial(
        req.params.id as string,
        req.params.mid as string,
        actor,
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
      const actor = getAuth(req);
      const payload =
        req.body && Object.keys(req.body as Record<string, unknown>).length
          ? addMaterialSchema.parse(req.body)
          : undefined;
      const material = await Materials.regenerateMaterial(
        req.params.id as string,
        req.params.mid as string,
        actor,
        payload,
      );
      res.json({ data: material });
    } catch (err: unknown) {
      next(err);
    }
  },

  deleteMaterial: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      await Materials.deleteMaterial(req.params.id as string, req.params.mid as string, actor);
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
      const actor = getAuth(req);
      const result = await generateAllPlaceholders(
        req.params.id as string,
        actor,
      );
      res.json({ data: result });
    } catch (err: unknown) {
      next(err);
    }
  },

  exportTeacher: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const lessonId = req.params.id as string;
      const buf = await exportTeacherPack(lessonId, actor);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="lesson-${lessonId}-teacher.pdf"`);
      res.send(buf);
    } catch (err: unknown) {
      next(err);
    }
  },

  exportStudent: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const lessonId = req.params.id as string;
      const buf = await exportStudentPack(lessonId, actor);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="lesson-${lessonId}-student.pdf"`);
      res.send(buf);
    } catch (err: unknown) {
      next(err);
    }
  },

  exportSlides: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const lessonId = req.params.id as string;
      const buf = await generateSlideshow(lessonId, actor);
      // Pull lesson title for a nicer filename. Slug it conservatively to
      // avoid Content-Disposition header parsing issues with quotes/commas.
      const lesson = await LessonService.getById(lessonId, actor);
      const slug = lesson.title
        .replace(/[^A-Za-z0-9 _-]+/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 80) || `lesson-${lessonId}`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${slug}.pptx"`,
      );
      res.send(buf);
    } catch (err: unknown) {
      next(err);
    }
  },

  assignClass: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const input = assignClassSchema.parse(req.body);
      const lesson = await LessonAssignmentService.assignClass(
        req.params.id as string,
        actor,
        input,
      );
      res.status(201).json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  updateAssignment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const patch = updateAssignmentSchema.parse(req.body);
      const lesson = await LessonAssignmentService.updateAssignment(
        req.params.id as string,
        actor,
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
      const actor = getAuth(req);
      const lesson = await LessonAssignmentService.unassignClass(
        req.params.id as string,
        actor,
        req.params.classId as string,
      );
      res.json({ data: lesson });
    } catch (err: unknown) {
      next(err);
    }
  },

  chat: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = getAuth(req);
      const input = chatLessonSchema.parse(req.body);
      const out = await chatAboutLesson(req.params.id as string, actor, input);
      res.json({ data: out });
    } catch (err: unknown) {
      next(err);
    }
  },
};
