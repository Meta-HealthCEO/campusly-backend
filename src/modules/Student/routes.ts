import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { requireCapability } from '../../middleware/capability.js';
import { validate } from '../../middleware/validate.js';
import { requireParentOwnership } from '../../middleware/parentOwnership.js';
import { StudentController } from './controller.js';
import { StudentExportController } from './export.controller.js';
import { BulkImportController } from './bulk-import.controller.js';
import { PhotoController } from './photo.controller.js';
import { TranscriptController } from './transcript.controller.js';
import {
  createStudentSchema,
  updateStudentSchema,
  updateMedicalProfileSchema,
} from './validation.js';

const router = Router();
const requireManageUsers = requireCapability('manage_users');

function requireStudentManagement(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role === 'teacher' && req.user.isStandaloneTeacher === true) {
    next();
    return;
  }
  requireManageUsers(req, res, next);
}

// ─── CSV Export ─────────────────────────────────────────────────────────────

router.get(
  '/export',
  authenticate,
  authorize('super_admin', 'school_admin'),
  StudentExportController.exportStudents,
);

// ─── Bulk Import ────────────────────────────────────────────────────────────

router.get(
  '/bulk-import/template',
  authenticate,
  authorize('super_admin', 'school_admin'),
  BulkImportController.downloadTemplate,
);

router.post(
  '/bulk-import/validate',
  authenticate,
  authorize('super_admin', 'school_admin'),
  BulkImportController.validate,
);

router.post(
  '/bulk-import',
  authenticate,
  requireManageUsers,
  BulkImportController.importStudents,
);

// ─── CRUD ───────────────────────────────────────────────────────────────────

router.post(
  '/',
  authenticate,
  requireStudentManagement,
  validate(createStudentSchema),
  StudentController.create,
);

router.get(
  '/',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'student', 'parent', 'coach', 'sports_manager'),
  StudentController.list,
);

router.get(
  '/me',
  authenticate,
  authorize('student'),
  StudentController.me,
);

router.get(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'parent', 'coach', 'sports_manager'),
  requireParentOwnership('id'),
  StudentController.getById,
);

router.put(
  '/:id',
  authenticate,
  requireStudentManagement,
  validate(updateStudentSchema),
  StudentController.update,
);

router.delete(
  '/:id',
  authenticate,
  requireStudentManagement,
  StudentController.delete,
);

router.patch(
  '/:id/medical',
  authenticate,
  requireStudentManagement,
  validate(updateMedicalProfileSchema),
  StudentController.updateMedicalProfile,
);

// ─── Photo Upload ───────────────────────────────────────────────────────────

router.post(
  '/:id/photo',
  authenticate,
  requireStudentManagement,
  PhotoController.uploadPhoto,
);

router.get(
  '/:id/photo',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'parent'),
  PhotoController.getPhoto,
);

// ─── Transcript ─────────────────────────────────────────────────────────────

router.get(
  '/:id/transcript',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'parent'),
  TranscriptController.getTranscript,
);

// ─── Student Invite ────────────────────────────────────────────────────────
router.post(
  '/:id/invite',
  authenticate,
  requireStudentManagement,
  StudentController.inviteStudent,
);

router.post(
  '/:id/regenerate-credentials',
  authenticate,
  requireStudentManagement,
  StudentController.regenerateCredentials,
);

export default router;
