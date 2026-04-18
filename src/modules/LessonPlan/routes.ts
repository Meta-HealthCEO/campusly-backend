import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { LessonPlanController } from './controller.js';
import {
  createLessonPlanSchema,
  updateLessonPlanSchema,
  aiGenerateLessonPlanSchema,
} from './validation.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(createLessonPlanSchema),
  LessonPlanController.create,
);

router.get(
  '/',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LessonPlanController.list,
);

router.post(
  '/ai-generate',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(aiGenerateLessonPlanSchema),
  LessonPlanController.aiGenerate,
);

router.get(
  '/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LessonPlanController.get,
);

router.put(
  '/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(updateLessonPlanSchema),
  LessonPlanController.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LessonPlanController.delete,
);

export default router;
