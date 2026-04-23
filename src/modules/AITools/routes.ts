import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { AIToolsController } from './controller.js';
import {
  generatePaperSchema,
  updatePaperSchema,
  regenerateQuestionSchema,
  gradeSubmissionSchema,
  bulkGradeSchema,
  reviewGradeSchema,
  publishGradeParamsSchema,
  markPaperSchema,
} from './validation.js';

const router = express.Router();

// ─── Paper Generation ─────────────────────────────────────────────────────────

// POST /generate-paper — generate a new exam paper
router.post(
  '/generate-paper',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(generatePaperSchema),
  AIToolsController.generatePaper,
);

// GET /papers — list generated papers
router.get(
  '/papers',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.getPapers,
);

// GET /papers/:id — get paper detail
router.get(
  '/papers/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.getPaperById,
);

// PUT /papers/:id — edit paper
router.put(
  '/papers/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(updatePaperSchema),
  AIToolsController.updatePaper,
);

// POST /papers/:id/regenerate-question — replace one question
router.post(
  '/papers/:id/regenerate-question',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(regenerateQuestionSchema),
  AIToolsController.regenerateQuestion,
);

// GET /papers/:id/pdf — download paper PDF
router.get(
  '/papers/:id/pdf',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.downloadPaperPdf,
);

// GET /papers/:id/memo-pdf — download memorandum PDF
router.get(
  '/papers/:id/memo-pdf',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.downloadMemoPdf,
);

// ─── OCR Paper Marking ───────────────────────────────────────────────────────

// POST /mark-paper — OCR-based paper marking from image
router.post(
  '/mark-paper',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(markPaperSchema),
  AIToolsController.markPaper,
);

// ─── AI Grading ───────────────────────────────────────────────────────────────

// POST /grade — grade a single submission
router.post(
  '/grade',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(gradeSubmissionSchema),
  AIToolsController.gradeSubmission,
);

// POST /grade/bulk — grade multiple submissions
router.post(
  '/grade/bulk',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(bulkGradeSchema),
  AIToolsController.bulkGrade,
);

// GET /grade/:jobId — get grading job detail
router.get(
  '/grade/:jobId',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.getGradingJob,
);

// POST /grade/:jobId/review — teacher reviews/adjusts grade
router.post(
  '/grade/:jobId/review',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(reviewGradeSchema),
  AIToolsController.reviewGrade,
);

// POST /grade/:jobId/publish — publish grade to student
router.post(
  '/grade/:jobId/publish',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate({ params: publishGradeParamsSchema }),
  AIToolsController.publishGrade,
);

// ─── Usage Stats ──────────────────────────────────────────────────────────────

// GET /usage — AI usage statistics
router.get(
  '/usage',
  authenticate,
  authorize('school_admin', 'super_admin'),
  AIToolsController.getUsage,
);

export default router;
