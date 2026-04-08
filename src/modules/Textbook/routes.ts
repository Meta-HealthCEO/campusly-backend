import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { TextbookController } from './controller.js';
import {
  createTextbookSchema,
  updateTextbookSchema,
  addChapterSchema,
  updateChapterSchema,
  addResourceToChapterSchema,
  reorderChaptersSchema,
  textbookQuerySchema,
} from './validation.js';

const router = Router();

const ADMIN_ROLES = ['super_admin', 'school_admin', 'principal', 'teacher'] as const;
const STUDENT_ROLES = [
  'super_admin', 'school_admin', 'principal', 'hod', 'teacher', 'student',
] as const;

// ─── List & Get ────────────────────────────────────────────────────────────

router.get(
  '/',
  authorize(...STUDENT_ROLES),
  validate({ query: textbookQuerySchema }),
  TextbookController.listTextbooks,
);

router.get(
  '/:id',
  authorize(...STUDENT_ROLES),
  TextbookController.getTextbook,
);

// ─── CRUD ──────────────────────────────────────────────────────────────────

router.post(
  '/',
  authorize(...ADMIN_ROLES),
  validate(createTextbookSchema),
  TextbookController.createTextbook,
);

router.put(
  '/:id',
  authorize(...ADMIN_ROLES),
  validate(updateTextbookSchema),
  TextbookController.updateTextbook,
);

router.delete(
  '/:id',
  authorize(...ADMIN_ROLES),
  TextbookController.deleteTextbook,
);

// ─── Reorder (BEFORE :chapterId to avoid shadowing) ───────────────────────

router.put(
  '/:id/chapters/reorder',
  authorize(...ADMIN_ROLES),
  validate(reorderChaptersSchema),
  TextbookController.reorderChapters,
);

// ─── Chapters ──────────────────────────────────────────────────────────────

router.post(
  '/:id/chapters',
  authorize(...ADMIN_ROLES),
  validate(addChapterSchema),
  TextbookController.addChapter,
);

router.put(
  '/:id/chapters/:chapterId',
  authorize(...ADMIN_ROLES),
  validate(updateChapterSchema),
  TextbookController.updateChapter,
);

router.delete(
  '/:id/chapters/:chapterId',
  authorize(...ADMIN_ROLES),
  TextbookController.removeChapter,
);

// ─── Chapter Resources ─────────────────────────────────────────────────────

router.post(
  '/:id/chapters/:chapterId/resources',
  authorize(...ADMIN_ROLES),
  validate(addResourceToChapterSchema),
  TextbookController.addResourceToChapter,
);

router.delete(
  '/:id/chapters/:chapterId/resources/:resourceId',
  authorize(...ADMIN_ROLES),
  TextbookController.removeResourceFromChapter,
);

// ─── Publish ───────────────────────────────────────────────────────────────

router.post(
  '/:id/publish',
  authorize(...ADMIN_ROLES),
  TextbookController.publishTextbook,
);

export default router;
