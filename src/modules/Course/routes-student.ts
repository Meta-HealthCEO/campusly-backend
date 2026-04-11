import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { CourseStudentController } from './controller-student.js';
import {
  writeProgressSchema,
  submitQuizAttemptSchema,
} from './validation.js';

const router = Router();

// Every endpoint here is keyed on enrolmentId, which is owned by the
// calling student (or by a teacher who authored the course). The service
// layer enforces row-level ownership via the JWT's user.id; route-layer
// authorize() just lets the right roles through.
const STUDENT_ROLES = ['student', 'super_admin', 'school_admin', 'teacher'] as const;

// ─── My enrolments ─────────────────────────────────────────────────────────
// /me MUST come before /:id so the literal isn't captured as an enrolment id.

router.get(
  '/me',
  authorize(...STUDENT_ROLES),
  CourseStudentController.listMyEnrolments,
);

router.get(
  '/:id',
  authorize(...STUDENT_ROLES),
  CourseStudentController.getEnrolment,
);

router.delete(
  '/:id',
  authorize(...STUDENT_ROLES),
  CourseStudentController.dropEnrolment,
);

// ─── Lesson player + progress ──────────────────────────────────────────────

router.get(
  '/:id/lessons/:lessonId',
  authorize(...STUDENT_ROLES),
  CourseStudentController.getLesson,
);

router.post(
  '/:id/lessons/:lessonId/progress',
  authorize(...STUDENT_ROLES),
  validate(writeProgressSchema),
  CourseStudentController.writeProgress,
);

router.post(
  '/:id/lessons/:lessonId/quiz-attempt',
  authorize(...STUDENT_ROLES),
  validate(submitQuizAttemptSchema),
  CourseStudentController.submitQuizAttempt,
);

export default router;
