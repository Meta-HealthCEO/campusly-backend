import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { requireParentOwnership } from '../../middleware/parentOwnership.js';
import { LearningController } from './controller.js';
import {
  createQuizSchema,
  updateQuizSchema,
  publishQuizSchema,
  submitQuizAttemptSchema,
  createStudyMaterialSchema,
  updateStudyMaterialSchema,
  createRubricSchema,
  updateRubricSchema,
  submitDraftSchema,
  submitFinalSchema,
  gradeWithRubricSchema,
  submitPeerReviewSchema,
} from './validation.js';

const router = Router();

// ─── Quizzes ─────────────────────────────────────────────────────────────────

router.post(
  '/quizzes',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(createQuizSchema),
  LearningController.createQuiz,
);

router.get('/quizzes', authenticate, LearningController.listQuizzes);

router.get('/quizzes/:id', authenticate, LearningController.getQuiz);

router.put(
  '/quizzes/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(updateQuizSchema),
  LearningController.updateQuiz,
);

router.patch(
  '/quizzes/:id/publish',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(publishQuizSchema),
  LearningController.publishQuiz,
);

router.delete(
  '/quizzes/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LearningController.deleteQuiz,
);

// Quiz attempts
router.post(
  '/quizzes/:id/attempt',
  authenticate,
  authorize('student'),
  validate(submitQuizAttemptSchema),
  LearningController.submitQuizAttempt,
);

router.get(
  '/quizzes/:id/results',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LearningController.getQuizResults,
);

// ─── Study Materials ─────────────────────────────────────────────────────────

router.post(
  '/materials',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(createStudyMaterialSchema),
  LearningController.uploadStudyMaterial,
);

router.get('/materials', authenticate, LearningController.getStudyMaterials);

router.get('/materials/:id', authenticate, LearningController.getStudyMaterial);

router.put(
  '/materials/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(updateStudyMaterialSchema),
  LearningController.updateStudyMaterial,
);

router.delete(
  '/materials/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LearningController.deleteStudyMaterial,
);

router.post('/materials/:id/download', authenticate, LearningController.downloadStudyMaterial);

// ─── Rubrics ─────────────────────────────────────────────────────────────────

router.post(
  '/rubrics',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(createRubricSchema),
  LearningController.createRubric,
);

router.get('/rubrics', authenticate, LearningController.listRubrics);

router.get('/rubrics/:id', authenticate, LearningController.getRubric);

router.put(
  '/rubrics/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(updateRubricSchema),
  LearningController.updateRubric,
);

router.delete(
  '/rubrics/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LearningController.deleteRubric,
);

// ─── Assignment Submissions (Enhanced) ───────────────────────────────────────

router.post(
  '/assignments/:homeworkId/draft',
  authenticate,
  authorize('student'),
  validate(submitDraftSchema),
  LearningController.submitDraft,
);

router.post(
  '/assignments/:homeworkId/submit',
  authenticate,
  authorize('student'),
  validate(submitFinalSchema),
  LearningController.submitFinal,
);

router.get(
  '/assignments/:homeworkId/submissions',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LearningController.getSubmissionsForHomework,
);

router.get(
  '/assignments/:homeworkId/analytics',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LearningController.getAssignmentAnalytics,
);

router.post(
  '/assignments/:homeworkId/peer-review',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LearningController.enablePeerReview,
);

router.post(
  '/submissions/:id/grade',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(gradeWithRubricSchema),
  LearningController.gradeWithRubric,
);

router.post(
  '/submissions/:id/peer-review',
  authenticate,
  authorize('student'),
  validate(submitPeerReviewSchema),
  LearningController.submitPeerReview,
);

router.post(
  '/submissions/:id/request-revision',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LearningController.requestRevision,
);

router.get('/submissions/:id', authenticate, LearningController.getSubmission);

// ─── Student Progress ────────────────────────────────────────────────────────

router.get(
  '/progress/:studentId',
  authenticate,
  requireParentOwnership('studentId'),
  LearningController.getStudentProgress,
);

router.post(
  '/progress/:studentId/:subjectId/mastery',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LearningController.calculateMastery,
);

router.get(
  '/struggling/:classId',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  LearningController.flagStrugglingStudents,
);

export default router;
