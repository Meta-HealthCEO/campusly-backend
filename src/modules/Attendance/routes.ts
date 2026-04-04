import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { requireParentOwnership } from '../../middleware/parentOwnership.js';
import { AttendanceController } from './controller.js';
import { AttendanceExportController } from './export.controller.js';
import {
  recordAttendanceSchema,
  bulkAttendanceSchema,
  createDisciplineSchema,
  updateDisciplineSchema,
  createMeritSchema,
  createLessonPlanSchema,
  updateLessonPlanSchema,
  createSubstituteSchema,
  updateSubstituteSchema,
} from './validation.js';

const router = Router();

// ─── Attendance Stats ────────────────────────────────────────────────────────

router.get(
  '/stats/student/:studentId',
  authenticate,
  requireParentOwnership('studentId'),
  AttendanceController.getStudentStats,
);

router.get(
  '/stats/class/:classId',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.getClassStats,
);

router.get(
  '/stats/chronic-absentees',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AttendanceController.getStatsChronicAbsentees,
);

// ─── CSV Export ─────────────────────────────────────────────────────────────

router.get(
  '/export',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AttendanceExportController.exportAttendance,
);

router.post(
  '/',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(recordAttendanceSchema),
  AttendanceController.record,
);

router.post(
  '/bulk',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(bulkAttendanceSchema),
  AttendanceController.bulkRecord,
);

router.get(
  '/student/:studentId',
  authenticate,
  requireParentOwnership('studentId'),
  AttendanceController.getByStudent,
);

router.get(
  '/class/:classId',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.getByClass,
);

router.get(
  '/report',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.getReport,
);

router.get(
  '/absentees',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.getAbsentees,
);

router.get(
  '/daily/:date',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AttendanceController.getDailyReport,
);

router.get(
  '/chronic-absentees',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.getChronicAbsentees,
);

router.get(
  '/student/:studentId/patterns',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.getStudentPatterns,
);

// ─── Discipline Routes ──────────────────────────────────────────────────────

router.post(
  '/discipline',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(createDisciplineSchema),
  AttendanceController.createDiscipline,
);

router.get(
  '/discipline',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.listDiscipline,
);

router.get(
  '/discipline/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.getDiscipline,
);

router.put(
  '/discipline/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(updateDisciplineSchema),
  AttendanceController.updateDiscipline,
);

router.delete(
  '/discipline/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AttendanceController.deleteDiscipline,
);

// ─── Merit / Demerit Routes ─────────────────────────────────────────────────

router.post(
  '/merits',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(createMeritSchema),
  AttendanceController.createMerit,
);

router.get(
  '/merits',
  authenticate,
  AttendanceController.listMerits,
);

router.get(
  '/merits/balance/:studentId',
  authenticate,
  requireParentOwnership('studentId'),
  AttendanceController.getMeritBalance,
);

// ─── Lesson Plan Routes ─────────────────────────────────────────────────────

router.post(
  '/lesson-plans',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(createLessonPlanSchema),
  AttendanceController.createLessonPlan,
);

router.get(
  '/lesson-plans',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.listLessonPlans,
);

router.get(
  '/lesson-plans/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.getLessonPlan,
);

router.put(
  '/lesson-plans/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(updateLessonPlanSchema),
  AttendanceController.updateLessonPlan,
);

router.delete(
  '/lesson-plans/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.deleteLessonPlan,
);

// ─── Substitute Teacher Routes ──────────────────────────────────────────────

router.post(
  '/substitutes',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(createSubstituteSchema),
  AttendanceController.createSubstitute,
);

router.get(
  '/substitutes',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.listSubstitutes,
);

router.get(
  '/substitutes/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AttendanceController.getSubstitute,
);

router.put(
  '/substitutes/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(updateSubstituteSchema),
  AttendanceController.updateSubstitute,
);

router.delete(
  '/substitutes/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AttendanceController.deleteSubstitute,
);

export default router;
