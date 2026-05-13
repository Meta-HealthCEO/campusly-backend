import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { requireCapability } from '../../middleware/capability.js';
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

const roles = ['super_admin', 'school_admin', 'principal', 'hod', 'teacher'] as const;

// ─── Template routes (before /:id to avoid param conflict) ───────────────────

router.get('/templates', authorize(...roles), TemplateController.listTemplates);

router.post(
  '/from-template/:templateId',
  requireCapability('manage_academic_setup'),
  validate(fromTemplateSchema),
  TemplateController.createFromTemplate,
);

router.delete('/templates/:id', requireCapability('manage_academic_setup'), TemplateController.deleteTemplate);

// ─── Structure CRUD ──────────────────────────────────────────────────────────

router.post(
  '/',
  requireCapability('manage_academic_setup'),
  validate(createStructureSchema),
  StructureController.create,
);

router.get('/', authorize(...roles), StructureController.list);

router.get('/:id', authorize(...roles), StructureController.getById);

router.put(
  '/:id',
  requireCapability('manage_academic_setup'),
  validate(updateStructureSchema),
  StructureController.update,
);

router.delete('/:id', requireCapability('manage_academic_setup'), StructureController.delete);

// ─── Status transitions ──────────────────────────────────────────────────────

router.post('/:id/activate', requireCapability('manage_academic_setup'), StructureController.activate);

router.post('/:id/lock', requireCapability('manage_academic_setup'), StructureController.lock);

router.post(
  '/:id/unlock',
  requireCapability('manage_academic_setup'),
  validate(unlockSchema),
  StructureController.unlock,
);

// ─── Categories ───────────────────────────────────────────────────────────────

router.post(
  '/:id/categories',
  requireCapability('manage_academic_setup'),
  validate(addCategorySchema),
  CategoryController.addCategory,
);

router.put(
  '/:id/categories/:catId',
  requireCapability('manage_academic_setup'),
  validate(updateCategorySchema),
  CategoryController.updateCategory,
);

router.delete(
  '/:id/categories/:catId',
  requireCapability('manage_academic_setup'),
  CategoryController.deleteCategory,
);

// ─── Line Items ───────────────────────────────────────────────────────────────

router.post(
  '/:id/categories/:catId/line-items',
  requireCapability('manage_academic_setup'),
  validate(addLineItemSchema),
  CategoryController.addLineItem,
);

router.put(
  '/:id/categories/:catId/line-items/:itemId',
  requireCapability('manage_academic_setup'),
  validate(updateLineItemSchema),
  CategoryController.updateLineItem,
);

router.delete(
  '/:id/categories/:catId/line-items/:itemId',
  requireCapability('manage_academic_setup'),
  CategoryController.deleteLineItem,
);

router.post(
  '/:id/categories/:catId/line-items/:itemId/link',
  requireCapability('manage_academic_setup'),
  validate(linkAssessmentSchema),
  CategoryController.linkAssessment,
);

// ─── Students ────────────────────────────────────────────────────────────────

router.post(
  '/:id/students',
  requireCapability('manage_academic_setup'),
  validate(addStudentsSchema),
  StudentController.addStudents,
);

router.delete(
  '/:id/students/:studentId',
  requireCapability('manage_academic_setup'),
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
  requireCapability('manage_academic_setup'),
  validate(saveAsTemplateSchema),
  TemplateController.saveAsTemplate,
);

router.post(
  '/:id/clone',
  requireCapability('manage_academic_setup'),
  validate(cloneStructureSchema),
  TemplateController.clone,
);

export default router;
