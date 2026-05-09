import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { requireParentOwnership } from '../../middleware/parentOwnership.js';
import { HomeworkController } from './controller.js';
import { HomeworkTemplateController } from './template.controller.js';
import {
  createHomeworkSchema,
  updateHomeworkSchema,
  submitHomeworkSchema,
  gradeSubmissionSchema,
  generateComprehensionSchema,
} from './validation.js';
import {
  createTemplateSchema,
  cloneTemplateSchema,
} from './template.validation.js';

const router = Router();

// ─── Templates (must be above /:id to avoid route clash) ───────────────────

router.post(
  '/templates',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(createTemplateSchema),
  HomeworkTemplateController.createTemplate,
);

router.get(
  '/templates',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  HomeworkTemplateController.listTemplates,
);

router.delete(
  '/templates/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  HomeworkTemplateController.deleteTemplate,
);

router.post(
  '/templates/:id/clone',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(cloneTemplateSchema),
  HomeworkTemplateController.cloneTemplate,
);

router.post(
  '/',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(createHomeworkSchema),
  HomeworkController.create,
);

router.get(
  '/',
  authenticate,
  HomeworkController.list,
);

router.get(
  '/parent/:studentId',
  authenticate,
  authorize('parent', 'school_admin', 'super_admin'),
  requireParentOwnership('studentId'),
  HomeworkController.getHomeworkForParent,
);

router.get(
  '/student/:studentId/submissions',
  authenticate,
  requireParentOwnership('studentId'),
  HomeworkController.getStudentSubmissions,
);

router.get(
  '/student/dashboard',
  authenticate,
  authorize('student'),
  HomeworkController.studentDashboard,
);

router.get(
  '/parent/dashboard',
  authenticate,
  authorize('parent'),
  HomeworkController.parentDashboard,
);

router.get(
  '/submissions/:id',
  authenticate,
  HomeworkController.getSubmissionById,
);

router.post(
  '/submissions/:id/regrade',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  HomeworkController.regradeSubmission,
);

router.post(
  '/comprehension-questions',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(generateComprehensionSchema),
  HomeworkController.generateComprehension,
);

router.get(
  '/:id',
  authenticate,
  HomeworkController.getById,
);

router.put(
  '/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(updateHomeworkSchema),
  HomeworkController.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  HomeworkController.delete,
);

router.post(
  '/:id/save-as-template',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  HomeworkTemplateController.saveAsTemplate,
);

router.post(
  '/:id/submit',
  authenticate,
  authorize('student'),
  validate(submitHomeworkSchema),
  HomeworkController.submit,
);

router.get(
  '/:id/submissions',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  HomeworkController.getSubmissions,
);

router.patch(
  '/submissions/:submissionId/grade',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(gradeSubmissionSchema),
  HomeworkController.grade,
);

export default router;
