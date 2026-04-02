import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { requireParentOwnership } from '../../middleware/parentOwnership.js';
import { HomeworkController } from './controller.js';
import {
  createHomeworkSchema,
  updateHomeworkSchema,
  submitHomeworkSchema,
  gradeSubmissionSchema,
} from './validation.js';

const router = Router();

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
