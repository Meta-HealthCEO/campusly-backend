import express, { Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { AIToolsController } from './controller.js';
import {
  gradeSubmissionSchema,
  bulkGradeSchema,
  reviewGradeSchema,
  publishGradeSchema,
  markPaperSchema,
  updateMarkingSchema,
  publishMarkingSchema,
  createRubricTemplateSchema,
} from './validation.js';

const router = express.Router();

// ─── Paper Generation (DEPRECATED — redirects to /api/question-bank/papers) ──
//
// All paper CRUD + generation routes previously lived under /api/ai-tools.
// They moved to the canonical Question Bank module at /api/question-bank/papers.
// 308 Permanent Redirect preserves request method + body so existing POST/PUT
// clients continue to work without code changes.
//
// Marking-related routes (/mark-paper, /markings/*) remain here — they are
// Module 3 scope and have not yet migrated.

function preserveQueryString(req: Request): string {
  const queryIndex = req.originalUrl.indexOf('?');
  return queryIndex >= 0 ? req.originalUrl.substring(queryIndex) : '';
}

// POST /generate-paper → POST /api/question-bank/papers/generate
router.post('/generate-paper', (req: Request, res: Response) => {
  res.redirect(308, `/api/question-bank/papers/generate${preserveQueryString(req)}`);
});

// GET /papers → GET /api/question-bank/papers
router.get('/papers', (req: Request, res: Response) => {
  res.redirect(308, `/api/question-bank/papers${preserveQueryString(req)}`);
});

// GET /papers/:id → GET /api/question-bank/papers/:id
router.get('/papers/:id', (req: Request, res: Response) => {
  res.redirect(308, `/api/question-bank/papers/${req.params.id}${preserveQueryString(req)}`);
});

// PUT /papers/:id → PUT /api/question-bank/papers/:id
router.put('/papers/:id', (req: Request, res: Response) => {
  res.redirect(308, `/api/question-bank/papers/${req.params.id}${preserveQueryString(req)}`);
});

// POST /papers/:id/regenerate-question → 410 Gone (path-param shape changed)
//
// Legacy body: { sectionIndex, questionIndex }
// New canonical: POST /api/question-bank/papers/:id/sections/:sectionIdx/questions/:position/regenerate
// The body→path-param translation can't be done safely without parsing the
// body, so we return 410 Gone with a migration message instead of redirecting.
router.post('/papers/:id/regenerate-question', (_req: Request, res: Response) => {
  res.status(410).json({
    success: false,
    message:
      'This endpoint has moved. Use POST /api/question-bank/papers/:id/sections/:sectionIdx/questions/:position/regenerate',
  });
});

// GET /papers/:id/pdf → GET /api/question-bank/papers/:id/pdf
router.get('/papers/:id/pdf', (req: Request, res: Response) => {
  res.redirect(308, `/api/question-bank/papers/${req.params.id}/pdf${preserveQueryString(req)}`);
});

// GET /papers/:id/memo-pdf → GET /api/question-bank/papers/:id/memo-pdf
router.get('/papers/:id/memo-pdf', (req: Request, res: Response) => {
  res.redirect(308, `/api/question-bank/papers/${req.params.id}/memo-pdf${preserveQueryString(req)}`);
});

// ─── OCR Paper Marking ───────────────────────────────────────────────────────

// POST /mark-paper — OCR-based paper marking from images
router.post(
  '/mark-paper',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(markPaperSchema),
  AIToolsController.markPaper,
);

// GET /markings — list paper markings
router.get(
  '/markings',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.listMarkings,
);

// GET /markings/:id — get a single marking
router.get(
  '/markings/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.getMarkingById,
);

// PUT /markings/:id — update teacher overrides
router.put(
  '/markings/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(updateMarkingSchema),
  AIToolsController.updateMarking,
);

// POST /markings/:id/publish — publish marking result to gradebook
router.post(
  '/markings/:id/publish',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(publishMarkingSchema),
  AIToolsController.publishMarking,
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

// ─── Rubric Templates ─────────────────────────────────────────────────────────

// GET /grade/rubric-templates — list rubric templates
router.get(
  '/grade/rubric-templates',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.listRubricTemplates,
);

// POST /grade/rubric-templates — create a rubric template
router.post(
  '/grade/rubric-templates',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(createRubricTemplateSchema),
  AIToolsController.createRubricTemplate,
);

// DELETE /grade/rubric-templates/:id — soft-delete a rubric template
router.delete(
  '/grade/rubric-templates/:id',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.deleteRubricTemplate,
);

// GET /grade — list grading jobs
router.get(
  '/grade',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.listGradingJobs,
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

// POST /grade/:jobId/publish — publish grade to gradebook
router.post(
  '/grade/:jobId/publish',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(publishGradeSchema),
  AIToolsController.publishGrade,
);

// POST /grade/:jobId/retry — re-queue a failed/stuck grading job
router.post(
  '/grade/:jobId/retry',
  authenticate,
  authorize('teacher', 'school_admin', 'super_admin'),
  AIToolsController.retryGrade,
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
