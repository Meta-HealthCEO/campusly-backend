import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { AttendanceController } from './controller.js';
import { recordAttendanceSchema, bulkAttendanceSchema } from './validation.js';

const router = Router();

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

export default router;
