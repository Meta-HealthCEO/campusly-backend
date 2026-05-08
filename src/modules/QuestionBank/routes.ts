import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { QuestionBankController } from './controller.js';
import {
  postAddQuestionToPaper,
  putUpdatePaperQuestion,
  postRegeneratePaperQuestion,
  deleteRemovePaperQuestion,
  putUpdateMemo,
  getPaperMemoHandler,
  postFinalisePaper,
  getPaperPdf,
  getMemoPdf,
} from './controller-papers.js';
import {
  createQuestionSchema,
  updateQuestionSchema,
  reviewQuestionSchema,
  generateQuestionsSchema,
  extractFromPaperSchema,
  questionQuerySchema,
  createPaperSchema,
  updatePaperSchema,
  addQuestionToPaperSchema,
  updatePaperQuestionSchema,
  updateMemoSchema,
  paperQuerySchema,
  generatePaperSchema,
} from './validation.js';

const router = Router();

const ADMIN_ROLES = ['super_admin', 'school_admin', 'principal'] as const;
const HOD_ROLES = ['super_admin', 'school_admin', 'principal', 'hod'] as const;
const READ_ROLES = ['super_admin', 'school_admin', 'principal', 'hod', 'teacher'] as const;

// ─── AI Generation (BEFORE :id to avoid route shadowing) ──────────────────

router.post(
  '/questions/generate',
  authorize(...READ_ROLES),
  validate(generateQuestionsSchema),
  QuestionBankController.generateQuestions,
);

router.post(
  '/questions/extract-from-paper',
  authorize(...READ_ROLES),
  validate(extractFromPaperSchema),
  QuestionBankController.extractFromPaper,
);

// ─── Questions CRUD ────────────────────────────────────────────────────────

router.get(
  '/questions',
  authorize(...READ_ROLES),
  validate({ query: questionQuerySchema }),
  QuestionBankController.listQuestions,
);

router.post(
  '/questions',
  authorize(...READ_ROLES),
  validate(createQuestionSchema),
  QuestionBankController.createQuestion,
);

router.get(
  '/questions/:id',
  authorize(...READ_ROLES),
  QuestionBankController.getQuestion,
);

router.put(
  '/questions/:id',
  authorize(...READ_ROLES),
  validate(updateQuestionSchema),
  QuestionBankController.updateQuestion,
);

router.delete(
  '/questions/:id',
  authorize(...READ_ROLES),
  QuestionBankController.deleteQuestion,
);

// ─── Question Review ───────────────────────────────────────────────────────

router.patch(
  '/questions/:id/submit',
  authorize(...READ_ROLES),
  QuestionBankController.submitForReview,
);

router.patch(
  '/questions/:id/review',
  authorize(...HOD_ROLES),
  validate(reviewQuestionSchema),
  QuestionBankController.reviewQuestion,
);

// ─── AI Paper Generation (BEFORE :id to avoid route shadowing) ────────────

router.post(
  '/papers/generate',
  authorize(...READ_ROLES),
  validate(generatePaperSchema),
  QuestionBankController.generatePaper,
);

router.get(
  '/papers/:id/pdf',
  authorize(...READ_ROLES),
  getPaperPdf,
);

router.get(
  '/papers/:id/memo-pdf',
  authorize(...READ_ROLES),
  getMemoPdf,
);

// ─── Paper Operations (BEFORE generic :id) ─────────────────────────────────

router.post(
  '/papers/:id/finalise',
  authorize(...READ_ROLES),
  postFinalisePaper,
);

router.get(
  '/papers/:id/compliance',
  authorize(...READ_ROLES),
  QuestionBankController.checkCompliance,
);

router.post(
  '/papers/:id/clone',
  authorize(...READ_ROLES),
  QuestionBankController.clonePaper,
);

// ─── Memo (read + wholesale update) ───────────────────────────────────────
//
// Defined BEFORE the more specific section/question routes so Express
// doesn't confuse `/memo` with a section path. Both the list and update
// flows are scoped to the paper's school via the service layer.

router.get(
  '/papers/:id/memo',
  authorize(...READ_ROLES),
  getPaperMemoHandler,
);

router.put(
  '/papers/:id/memo',
  authorize(...READ_ROLES),
  validate(updateMemoSchema),
  putUpdateMemo,
);

// ─── Paper Question CRUD (section-scoped) ─────────────────────────────────

router.post(
  '/papers/:id/sections/:sectionIdx/questions',
  authorize(...READ_ROLES),
  validate(addQuestionToPaperSchema),
  postAddQuestionToPaper,
);

router.put(
  '/papers/:id/sections/:sectionIdx/questions/:position',
  authorize(...READ_ROLES),
  validate(updatePaperQuestionSchema),
  putUpdatePaperQuestion,
);

router.post(
  '/papers/:id/sections/:sectionIdx/questions/:position/regenerate',
  authorize(...READ_ROLES),
  postRegeneratePaperQuestion,
);

router.delete(
  '/papers/:id/sections/:sectionIdx/questions/:position',
  authorize(...READ_ROLES),
  deleteRemovePaperQuestion,
);

// ─── Papers CRUD ───────────────────────────────────────────────────────────

router.get(
  '/papers',
  authorize(...READ_ROLES),
  validate({ query: paperQuerySchema }),
  QuestionBankController.listPapers,
);

router.post(
  '/papers',
  authorize(...READ_ROLES),
  validate(createPaperSchema),
  QuestionBankController.createPaper,
);

router.get(
  '/papers/:id',
  authorize(...READ_ROLES),
  QuestionBankController.getPaper,
);

router.put(
  '/papers/:id',
  authorize(...READ_ROLES),
  validate(updatePaperSchema),
  QuestionBankController.updatePaper,
);

router.delete(
  '/papers/:id',
  authorize(...ADMIN_ROLES),
  QuestionBankController.deletePaper,
);

export default router;
