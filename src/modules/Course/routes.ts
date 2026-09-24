import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { requireEntitlement } from '../subscription/entitlements.js';
import { CourseController } from './controller.js';
import { CourseStudentController } from './controller-student.js';
import { ClassUnitController } from './controller-class-unit.js';
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
  catalogQuerySchema,
  createClassUnitSchema,
  releaseUnitSchema,
  saveItemContentSchema,
  saveItemQuestionsSchema,
  rewriteItemSchema,
  unitSettingsSchema,
  revisionItemSchema,
  copyUnitSchema,
  libraryQuerySchema,
} from './validation.js';

const router = Router();

// Every course endpoint is open at the route layer to admins and teachers.
// Finer-grained permission checks live in the service:
//   - Draft ownership: teachers can only edit their own drafts
//   - Review gating: only super_admin, school_admin, isHOD, or
//     isSchoolPrincipal can publish/reject (enforced by canPublish)
//   - Author gating: canAuthor blocks parents, students, and SGB members
// The role tuple below is intentionally broad so that HOD/principal flags
// (which are not part of UserRole) can be checked by the service layer,
// not by the role-only authorize() middleware.
const COURSE_ROLES = ['super_admin', 'school_admin', 'teacher'] as const;

// ─── Course CRUD ───────────────────────────────────────────────────────────

router.get(
  '/',
  authorize(...COURSE_ROLES),
  validate({ query: courseQuerySchema }),
  CourseController.listCourses,
);

router.post(
  '/',
  authorize(...COURSE_ROLES),
  validate(createCourseSchema),
  CourseController.createCourse,
);

// ─── School library of released units (before /:id) ─────────────────────

router.get(
  '/library',
  authorize(...COURSE_ROLES),
  validate({ query: libraryQuerySchema }),
  ClassUnitController.library,
);

// ─── Catalog (any authenticated role with course module access) ──────────
// MUST come before /:id to avoid the literal "catalog" being captured as
// an :id parameter.

router.get(
  '/catalog',
  authorize(...COURSE_ROLES, 'student'),
  validate({ query: catalogQuerySchema }),
  CourseStudentController.listCatalog,
);

router.get(
  '/catalog/:slug',
  authorize(...COURSE_ROLES, 'student'),
  CourseStudentController.getCatalogPreview,
);

router.get(
  '/:id',
  authorize(...COURSE_ROLES),
  CourseController.getCourse,
);

router.put(
  '/:id',
  authorize(...COURSE_ROLES),
  validate(updateCourseSchema),
  CourseController.updateCourse,
);

router.delete(
  '/:id',
  authorize(...COURSE_ROLES),
  CourseController.deleteCourse,
);

// ─── Review workflow ───────────────────────────────────────────────────────

router.post(
  '/:id/submit-for-review',
  authorize(...COURSE_ROLES),
  CourseController.submitForReview,
);

router.post(
  '/:id/publish',
  authorize(...COURSE_ROLES),
  CourseController.publishCourse,
);

router.post(
  '/:id/reject',
  authorize(...COURSE_ROLES),
  validate(rejectCourseSchema),
  CourseController.rejectCourse,
);

router.post(
  '/:id/archive',
  authorize(...COURSE_ROLES),
  CourseController.archiveCourse,
);

// ─── Modules (reorder BEFORE :moduleId to avoid shadowing) ────────────────

router.patch(
  '/:id/modules/reorder',
  authorize(...COURSE_ROLES),
  validate(reorderModulesSchema),
  CourseController.reorderModules,
);

router.post(
  '/:id/modules',
  authorize(...COURSE_ROLES),
  validate(createModuleSchema),
  CourseController.addModule,
);

router.put(
  '/:id/modules/:moduleId',
  authorize(...COURSE_ROLES),
  validate(updateModuleSchema),
  CourseController.updateModule,
);

router.delete(
  '/:id/modules/:moduleId',
  authorize(...COURSE_ROLES),
  CourseController.deleteModule,
);

// ─── Lessons (reorder BEFORE :lessonId to avoid shadowing) ────────────────

router.patch(
  '/:id/lessons/reorder',
  authorize(...COURSE_ROLES),
  validate(reorderLessonsSchema),
  CourseController.reorderLessons,
);

router.post(
  '/:id/lessons',
  authorize(...COURSE_ROLES),
  validate(createLessonSchema),
  CourseController.addLesson,
);

router.put(
  '/:id/lessons/:lessonId',
  authorize(...COURSE_ROLES),
  validate(updateLessonSchema),
  CourseController.updateLesson,
);

router.delete(
  '/:id/lessons/:lessonId',
  authorize(...COURSE_ROLES),
  CourseController.deleteLesson,
);

// ─── Assignment ────────────────────────────────────────────────────────────

router.post(
  '/:id/assign',
  authorize(...COURSE_ROLES),
  validate(assignCourseSchema),
  CourseController.assignCourseToClass,
);

router.get(
  '/:id/enrolments',
  authorize(...COURSE_ROLES),
  CourseController.listEnrolments,
);

// ─── Class units (AI course builder) ──────────────────────────────────────

router.post('/class-units', authorize(...COURSE_ROLES), validate(createClassUnitSchema), ClassUnitController.create);
router.post('/:id/outline', authorize(...COURSE_ROLES), ClassUnitController.draftOutline);
router.post('/:id/outline/approve', authorize(...COURSE_ROLES), ClassUnitController.approveOutline);
router.get('/:id/generation', authorize(...COURSE_ROLES), ClassUnitController.generationState);
router.post('/:id/lessons/:lessonId/generate', authorize(...COURSE_ROLES), ClassUnitController.retryItem);
router.get('/:id/lessons/:lessonId/preview', authorize(...COURSE_ROLES), ClassUnitController.previewItem);
router.post('/:id/release', authorize(...COURSE_ROLES), validate(releaseUnitSchema), ClassUnitController.release);
router.get('/:id/insight', authorize(...COURSE_ROLES), ClassUnitController.insight);
router.put('/:id/lessons/:lessonId/content', authorize(...COURSE_ROLES), validate(saveItemContentSchema), ClassUnitController.saveContent);
router.put('/:id/lessons/:lessonId/questions', authorize(...COURSE_ROLES), validate(saveItemQuestionsSchema), ClassUnitController.saveQuestions);
router.post('/:id/lessons/:lessonId/rewrite', authorize(...COURSE_ROLES), validate(rewriteItemSchema), ClassUnitController.rewrite);
router.patch('/:id/settings', authorize(...COURSE_ROLES), validate(unitSettingsSchema), ClassUnitController.updateSettings);
router.post('/:id/revision', authorize(...COURSE_ROLES), validate(revisionItemSchema), ClassUnitController.addRevision);
router.post('/:id/copy', authorize(...COURSE_ROLES), validate(copyUnitSchema), ClassUnitController.copy);

// ─── Analytics ─────────────────────────────────────────────────────────────

router.get(
  '/:id/analytics',
  authorize(...COURSE_ROLES),
  requireEntitlement('advancedAnalytics'),
  CourseController.getCourseAnalytics,
);

export default router;
