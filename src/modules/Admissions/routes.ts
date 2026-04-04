import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { authenticate, authorize, validate, createRateLimiter } from '../../middleware/index.js';
import { AdmissionsController } from './controller.js';
import {
  submitApplicationSchema,
  updateStatusSchema,
  scheduleInterviewSchema,
  bulkActionSchema,
  updateCapacitySchema,
} from './validation.js';

const router = Router();

// ─── Multer config for document uploads ───────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/admissions');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}_${unique}${ext}`);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPEG, and PNG files are allowed'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadFields = upload.fields([
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'previousReportCard', maxCount: 1 },
  { name: 'proofOfResidence', maxCount: 1 },
]);

// ─── Rate limiter: 5 applications per IP per hour ─────────────────────────────

const applyRateLimit = createRateLimiter(60 * 60 * 1000, 5);

// ─── Public routes (no auth) ──────────────────────────────────────────────────

router.post(
  '/public/apply',
  applyRateLimit,
  uploadFields,
  validate(submitApplicationSchema),
  AdmissionsController.submitApplication,
);

router.get(
  '/public/status/:trackingToken',
  AdmissionsController.checkStatus,
);

router.get(
  '/public/capacity/:schoolId',
  AdmissionsController.getPublicCapacity,
);

// ─── Parent routes ────────────────────────────────────────────────────────────

router.get(
  '/my-applications',
  authenticate,
  authorize('parent'),
  AdmissionsController.getMyApplications,
);

// ─── Admin routes ─────────────────────────────────────────────────────────────

router.get(
  '/applications',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AdmissionsController.listApplications,
);

router.get(
  '/applications/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AdmissionsController.getApplication,
);

router.put(
  '/applications/:id/status',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(updateStatusSchema),
  AdmissionsController.updateStatus,
);

router.delete(
  '/applications/:id',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AdmissionsController.deleteApplication,
);

router.put(
  '/applications/:id/interview',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(scheduleInterviewSchema),
  AdmissionsController.scheduleInterview,
);

router.post(
  '/applications/bulk-action',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(bulkActionSchema),
  AdmissionsController.bulkAction,
);

// ─── Capacity ─────────────────────────────────────────────────────────────────

router.get(
  '/capacity',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AdmissionsController.getCapacity,
);

router.put(
  '/capacity',
  authenticate,
  authorize('school_admin', 'super_admin'),
  validate(updateCapacitySchema),
  AdmissionsController.updateCapacity,
);

router.post(
  '/capacity/:grade/offer-waitlist',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AdmissionsController.offerToWaitlist,
);

// ─── Reports ──────────────────────────────────────────────────────────────────

router.get(
  '/reports/summary',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AdmissionsController.getReportSummary,
);

export default router;
