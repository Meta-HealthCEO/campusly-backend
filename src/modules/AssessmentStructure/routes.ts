import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import {
  StructureController,
  CategoryController,
  StudentController,
  TemplateController,
  TermMarksController,
} from './controller.js';
import {
  createStructureSchema,
  updateStructureSchema,
  addCategorySchema,
  updateCategorySchema,
  addLineItemSchema,
  updateLineItemSchema,
  linkAssessmentSchema,
  addStudentsSchema,
  unlockSchema,
  saveAsTemplateSchema,
  fromTemplateSchema,
  cloneStructureSchema,
} from './validation.js';

const router = Router();

const roles = ['super_admin', 'school_admin', 'teacher'] as const;

// ─── Template routes (before /:id to avoid param conflict) ───────────────────

router.get('/templates', authorize(...roles), TemplateController.listTemplates);

router.post(
  '/from-template/:templateId',
  authorize(...roles),
  validate(fromTemplateSchema),
  TemplateController.createFromTemplate,
);

router.delete('/templates/:id', authorize(...roles), TemplateController.deleteTemplate);

// ─── Structure CRUD ──────────────────────────────────────────────────────────

router.post(
  '/',
  authorize(...roles),
  validate(createStructureSchema),
  StructureController.create,
);

router.get('/', authorize(...roles), StructureController.list);

router.get('/:id', authorize(...roles), StructureController.getById);

router.put(
  '/:id',
  authorize(...roles),
  validate(updateStructureSchema),
  StructureController.update,
);

router.delete('/:id', authorize(...roles), StructureController.delete);

// ─── Status transitions ──────────────────────────────────────────────────────

router.post('/:id/activate', authorize(...roles), StructureController.activate);

router.post('/:id/lock', authorize(...roles), StructureController.lock);

router.post(
  '/:id/unlock',
  authorize(...roles),
  validate(unlockSchema),
  StructureController.unlock,
);

// ─── Categories ───────────────────────────────────────────────────────────────

router.post(
  '/:id/categories',
  authorize(...roles),
  validate(addCategorySchema),
  CategoryController.addCategory,
);

router.put(
  '/:id/categories/:catId',
  authorize(...roles),
  validate(updateCategorySchema),
  CategoryController.updateCategory,
);

router.delete(
  '/:id/categories/:catId',
  authorize(...roles),
  CategoryController.deleteCategory,
);

// ─── Line Items ───────────────────────────────────────────────────────────────

router.post(
  '/:id/categories/:catId/line-items',
  authorize(...roles),
  validate(addLineItemSchema),
  CategoryController.addLineItem,
);

router.put(
  '/:id/categories/:catId/line-items/:itemId',
  authorize(...roles),
  validate(updateLineItemSchema),
  CategoryController.updateLineItem,
);

router.delete(
  '/:id/categories/:catId/line-items/:itemId',
  authorize(...roles),
  CategoryController.deleteLineItem,
);

router.post(
  '/:id/categories/:catId/line-items/:itemId/link',
  authorize(...roles),
  validate(linkAssessmentSchema),
  CategoryController.linkAssessment,
);

// ─── Students ────────────────────────────────────────────────────────────────

router.post(
  '/:id/students',
  authorize(...roles),
  validate(addStudentsSchema),
  StudentController.addStudents,
);

router.delete(
  '/:id/students/:studentId',
  authorize(...roles),
  StudentController.removeStudent,
);

// ─── Term Marks ───────────────────────────────────────────────────────────────

router.get('/:id/term-marks', authorize(...roles), TermMarksController.getTermMarks);

router.get(
  '/:id/term-marks/:studentId',
  authorize(...roles),
  TermMarksController.getStudentTermMarks,
);

router.get('/:id/export', authorize(...roles), TermMarksController.exportTermMarks);

// ─── Template operations on a structure ──────────────────────────────────────

router.post(
  '/:id/save-as-template',
  authorize(...roles),
  validate(saveAsTemplateSchema),
  TemplateController.saveAsTemplate,
);

router.post(
  '/:id/clone',
  authorize(...roles),
  validate(cloneStructureSchema),
  TemplateController.clone,
);

export default router;
