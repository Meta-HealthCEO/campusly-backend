import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import {
  postCreateAssignment,
  getListAssignments,
  getAssignment,
  putUpdateAssignment,
  deleteAssignmentHandler,
  getClassAssignments,
  postClassAssignment,
  deleteClassAssignment,
  getStudentAssignments,
  postSubmitAssignment,
  getSubmissions,
  getOneSubmission,
  postMarkSubmission,
  postGenerateAssignment,
} from './controller.js';
import { postUploadSubmissionFile } from './controller-uploads.js';

const router = Router();

// AI generator — teachers only, before they commit to creating.
router.post(
  '/generate',
  authorize('teacher', 'school_admin', 'super_admin'),
  postGenerateAssignment,
);

// Assignment CRUD
router.post(
  '/',
  authorize('teacher', 'school_admin', 'super_admin'),
  postCreateAssignment,
);
router.get('/', getListAssignments);

// Static routes must sit above /:id to avoid the param swallowing.
router.get('/student/mine', authorize('student'), getStudentAssignments);

// Submission file upload — used by student submit flow + teacher attachments.
router.post(
  '/uploads/file',
  authorize('student', 'teacher', 'school_admin', 'super_admin'),
  postUploadSubmissionFile,
);
router.get(
  '/submissions/:submissionId',
  authorize('teacher', 'school_admin', 'super_admin'),
  getOneSubmission,
);
router.post(
  '/submissions/:submissionId/mark',
  authorize('teacher', 'school_admin', 'super_admin'),
  postMarkSubmission,
);

router.get('/:id', getAssignment);
router.put(
  '/:id',
  authorize('teacher', 'school_admin', 'super_admin'),
  putUpdateAssignment,
);
router.delete(
  '/:id',
  authorize('teacher', 'school_admin', 'super_admin'),
  deleteAssignmentHandler,
);

// Class push (teacher pushes assignment to a class with release/due dates)
router.get(
  '/:id/classes',
  authorize('teacher', 'school_admin', 'super_admin'),
  getClassAssignments,
);
router.post(
  '/:id/classes',
  authorize('teacher', 'school_admin', 'super_admin'),
  postClassAssignment,
);
router.delete(
  '/:id/classes/:classAssignmentId',
  authorize('teacher', 'school_admin', 'super_admin'),
  deleteClassAssignment,
);

// Student submission
router.post(
  '/:id/submit',
  authorize('student'),
  postSubmitAssignment,
);

// Submissions roster (teacher)
router.get(
  '/:id/submissions',
  authorize('teacher', 'school_admin', 'super_admin'),
  getSubmissions,
);

export default router;
