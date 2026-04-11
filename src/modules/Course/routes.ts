import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { CourseController } from './controller.js';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  createModuleSchema,
  updateModuleSchema,
  reorderModulesSchema,
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
  rejectCourseSchema,
  assignCourseSchema,
} from './validation.js';

const router = Router();

// Every course authoring endpoint is open to teachers + admin-tier roles.
// Finer-grained permission checks (draft ownership, HOD/principal overrides,
// canPublish vs canAuthor) happen in the service layer because they depend
// on isHOD / isSchoolPrincipal flags which the role-based authorize()
// middleware cannot see.
const AUTHOR_ROLES = ['super_admin', 'school_admin', 'teacher'] as const;

// Review actions (publish, reject) are allowed at the route layer for any
// author tier. The service's canPublish() helper then enforces:
//   super_admin | school_admin | isHOD | isSchoolPrincipal
// — so a plain teacher gets a ForbiddenError from the service.
const REVIEW_ROLES = ['super_admin', 'school_admin', 'teacher'] as const;

// ─── Course CRUD ───────────────────────────────────────────────────────────

router.get(
  '/',
  authorize(...AUTHOR_ROLES),
  validate({ query: courseQuerySchema }),
  CourseController.listCourses,
);

router.post(
  '/',
  authorize(...AUTHOR_ROLES),
  validate(createCourseSchema),
  CourseController.createCourse,
);

router.get(
  '/:id',
  authorize(...AUTHOR_ROLES),
  CourseController.getCourse,
);

router.put(
  '/:id',
  authorize(...AUTHOR_ROLES),
  validate(updateCourseSchema),
  CourseController.updateCourse,
);

router.delete(
  '/:id',
  authorize(...AUTHOR_ROLES),
  CourseController.deleteCourse,
);

// ─── Review workflow ───────────────────────────────────────────────────────

router.post(
  '/:id/submit-for-review',
  authorize(...AUTHOR_ROLES),
  CourseController.submitForReview,
);

router.post(
  '/:id/publish',
  authorize(...REVIEW_ROLES),
  CourseController.publishCourse,
);

router.post(
  '/:id/reject',
  authorize(...REVIEW_ROLES),
  validate(rejectCourseSchema),
  CourseController.rejectCourse,
);

router.post(
  '/:id/archive',
  authorize(...AUTHOR_ROLES),
  CourseController.archiveCourse,
);

// ─── Modules (reorder BEFORE :moduleId to avoid shadowing) ────────────────

router.patch(
  '/:id/modules/reorder',
  authorize(...AUTHOR_ROLES),
  validate(reorderModulesSchema),
  CourseController.reorderModules,
);

router.post(
  '/:id/modules',
  authorize(...AUTHOR_ROLES),
  validate(createModuleSchema),
  CourseController.addModule,
);

router.put(
  '/:id/modules/:moduleId',
  authorize(...AUTHOR_ROLES),
  validate(updateModuleSchema),
  CourseController.updateModule,
);

router.delete(
  '/:id/modules/:moduleId',
  authorize(...AUTHOR_ROLES),
  CourseController.deleteModule,
);

// ─── Lessons (reorder BEFORE :lessonId to avoid shadowing) ────────────────

router.patch(
  '/:id/lessons/reorder',
  authorize(...AUTHOR_ROLES),
  validate(reorderLessonsSchema),
  CourseController.reorderLessons,
);

router.post(
  '/:id/lessons',
  authorize(...AUTHOR_ROLES),
  validate(createLessonSchema),
  CourseController.addLesson,
);

router.put(
  '/:id/lessons/:lessonId',
  authorize(...AUTHOR_ROLES),
  validate(updateLessonSchema),
  CourseController.updateLesson,
);

router.delete(
  '/:id/lessons/:lessonId',
  authorize(...AUTHOR_ROLES),
  CourseController.deleteLesson,
);

// ─── Assignment ────────────────────────────────────────────────────────────

router.post(
  '/:id/assign',
  authorize(...AUTHOR_ROLES),
  validate(assignCourseSchema),
  CourseController.assignCourseToClass,
);

router.get(
  '/:id/enrolments',
  authorize(...AUTHOR_ROLES),
  CourseController.listEnrolments,
);

export default router;
