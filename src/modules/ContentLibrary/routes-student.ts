import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { StudentContentController } from './controller-student.js';
import {
  submitAttemptSchema,
  masteryQuerySchema,
  studentResourceQuerySchema,
} from './validation-student.js';

const router = Router();

const STUDENT_ROLES = [
  'super_admin', 'school_admin', 'principal', 'hod', 'teacher', 'student',
] as const;

const HOD_ROLES = [
  'super_admin', 'school_admin', 'principal', 'hod',
] as const;

// ─── Resources (read-only for students) ─────────────────────────────────────

router.get(
  '/resources',
  authorize(...STUDENT_ROLES),
  validate({ query: studentResourceQuerySchema }),
  StudentContentController.listApprovedResources,
);

router.get(
  '/resources/:id',
  authorize(...STUDENT_ROLES),
  StudentContentController.getResource,
);

// ─── Attempts ───────────────────────────────────────────────────────────────

router.post(
  '/resources/:id/attempt',
  authorize(...STUDENT_ROLES),
  validate(submitAttemptSchema),
  StudentContentController.submitAttempt,
);

// ─── Mastery ────────────────────────────────────────────────────────────────

router.get(
  '/mastery',
  authorize(...STUDENT_ROLES),
  validate({ query: masteryQuerySchema }),
  StudentContentController.getMyMastery,
);

router.get(
  '/mastery/class/:classId',
  authorize(...HOD_ROLES),
  StudentContentController.getClassMastery,
);

export default router;
